import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Pre-warm Meshopt WASM decoder immediately on module load
if (typeof window !== 'undefined' && MeshoptDecoder && MeshoptDecoder.ready) {
  MeshoptDecoder.ready.catch(() => {});
}

// Global in-memory cache for parsed GLTF scenes & computed bounding metadata
const globalModelCache = new Map();
const globalLoadingPromises = new Map();

/**
 * Pre-fetches and parses a GLB model with MeshoptDecoder, caching the prepared scene.
 */
export async function loadGlbModel(modelPath) {
  if (!modelPath) return null;

  if (globalModelCache.has(modelPath)) {
    return globalModelCache.get(modelPath);
  }

  if (globalLoadingPromises.has(modelPath)) {
    return globalLoadingPromises.get(modelPath);
  }

  const promise = (async () => {
    try {
      await MeshoptDecoder.ready;
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      return new Promise((resolve, reject) => {
        loader.load(
          modelPath,
          (gltf) => {
            const rootScene = gltf.scene;

            // Center geometry pivot and calculate base scale once
            const box = new THREE.Box3().setFromObject(rootScene);
            const size = new THREE.Vector3();
            box.getSize(size);
            const center = new THREE.Vector3();
            box.getCenter(center);

            rootScene.position.x = -center.x;
            rootScene.position.y = -center.y;
            rootScene.position.z = -center.z;

            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const targetDim = 1.75;
            const baseScale = targetDim / maxDim;

            const cachedData = {
              scene: rootScene,
              baseScale
            };

            globalModelCache.set(modelPath, cachedData);
            globalLoadingPromises.delete(modelPath);
            resolve(cachedData);
          },
          undefined,
          (err) => {
            globalLoadingPromises.delete(modelPath);
            console.error(`[CategoryCard3DViewer] Failed to load ${modelPath}:`, err);
            reject(err);
          }
        );
      });
    } catch (err) {
      globalLoadingPromises.delete(modelPath);
      throw err;
    }
  })();

  globalLoadingPromises.set(modelPath, promise);
  return promise;
}

/**
 * Priority background preloader for individual category models.
 */
export async function preloadCategoryModel(modelPath) {
  if (!modelPath) return;
  try {
    return await loadGlbModel(modelPath);
  } catch (err) {
    // Gracefully ignore preload error
  }
}

/**
 * Staggered background preloader for all category models using idle callbacks.
 */
export function preloadAllCategoryModels(modelPaths) {
  if (typeof window === 'undefined' || !Array.isArray(modelPaths)) return;

  let index = 0;
  const queueNext = () => {
    if (index >= modelPaths.length) return;
    const path = modelPaths[index++];
    if (path) {
      loadGlbModel(path)
        .catch(() => {})
        .finally(() => {
          if ('requestIdleCallback' in window) {
            window.requestIdleCallback(queueNext, { timeout: 1500 });
          } else {
            setTimeout(queueNext, 300);
          }
        });
    } else {
      queueNext();
    }
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(queueNext, { timeout: 2000 });
  } else {
    setTimeout(queueNext, 400);
  }
}

// Cached shared contact shadow texture & geometry singleton
let cachedShadowTexture = null;
let cachedShadowGeo = null;
let cachedShadowMat = null;

function getSharedContactShadowMesh() {
  if (!cachedShadowTexture) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const cx = 128;
    const cy = 128;

    // Outer ambient diffusion
    const outerGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
    outerGrad.addColorStop(0, 'rgba(4, 30, 20, 0.45)');
    outerGrad.addColorStop(0.4, 'rgba(4, 30, 20, 0.22)');
    outerGrad.addColorStop(0.7, 'rgba(4, 30, 20, 0.08)');
    outerGrad.addColorStop(1, 'rgba(4, 30, 20, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 115, 65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tight core contact shadow
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    coreGrad.addColorStop(0, 'rgba(2, 18, 12, 0.65)');
    coreGrad.addColorStop(0.5, 'rgba(2, 18, 12, 0.30)');
    coreGrad.addColorStop(1, 'rgba(2, 18, 12, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 65, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    cachedShadowTexture = new THREE.CanvasTexture(canvas);
    cachedShadowTexture.needsUpdate = true;
    cachedShadowGeo = new THREE.PlaneGeometry(2.2, 1.2);
    cachedShadowMat = new THREE.MeshBasicMaterial({
      map: cachedShadowTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
  }

  const shadowPlane = new THREE.Mesh(cachedShadowGeo, cachedShadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.65;
  return shadowPlane;
}

export default function CategoryCard3DViewer({ modelPath, isHovered, title = 'Equipment', posterImage }) {
  const mountRef = useRef(null);
  const [hasStartedInit, setHasStartedInit] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [isLoading, setIsLoading] = useState(!globalModelCache.has(modelPath));
  const [hasError, setHasError] = useState(false);

  // References for persistent Three.js instances
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const modelGroupRef = useRef(null);
  const animFrameRef = useRef(null);
  const baseScaleRef = useRef(1);
  const mouseCoordsRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(isHovered);
  isHoveredRef.current = isHovered;

  // Initialize WebGL context strictly on desktop user hover (avoids 5 concurrent contexts & mobile crashes)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouchOrMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024;
    if (isTouchOrMobile) return; // Touch & mobile devices use the optimized poster image with zero WebGL overhead

    if (isHovered && !hasStartedInit) {
      setHasStartedInit(true);
    }
  }, [isHovered, hasStartedInit]);

  // Set up Three.js Scene and Renderer ONCE per card
  useEffect(() => {
    if (!hasStartedInit) return;

    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const width = container.clientWidth || 230;
    const height = container.clientHeight || 220;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 3.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with hardware-accelerated settings & capped pixel ratio for performance
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    // Cap pixel ratio to 1.5 to save 50%+ GPU fill-rate on high-DPI screens without visual loss
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.6);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xddf2ff, 1.4);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0xff9900, 0.4);
    bounceLight.position.set(0, -3, 2);
    scene.add(bounceLight);

    // 5. Shared Contact Shadow Pedestal
    const shadowMesh = getSharedContactShadowMesh();
    scene.add(shadowMesh);

    // 6. Model Emergence Group
    const modelGroup = new THREE.Group();
    modelGroup.rotation.x = 0.12;
    modelGroup.rotation.z = -0.03;
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 7. Load or Clone Model from Cache
    loadGlbModel(modelPath)
      .then((cachedData) => {
        if (isDisposed || !cachedData) return;

        const clone = cachedData.scene.clone(true);
        baseScaleRef.current = cachedData.baseScale || 1;

        modelGroup.scale.set(baseScaleRef.current, baseScaleRef.current, baseScaleRef.current);
        modelGroup.position.set(0, 0, 0);
        modelGroup.add(clone);

        setIsModelReady(true);
        setIsLoading(false);

        // Render single frame immediately
        renderer.render(scene, camera);
      })
      .catch((err) => {
        if (!isDisposed) {
          console.error('[CategoryCard3DViewer] Model init error:', err);
          setHasError(true);
          setIsLoading(false);
        }
      });

    // 8. Pointer Tracking (Cached getBoundingClientRect to prevent forced reflows)
    const cardEl = container.closest('.disd-cat-five-card');
    let cachedRect = null;

    const handlePointerEnter = () => {
      if (cardEl) {
        cachedRect = cardEl.getBoundingClientRect();
      }
    };

    const handlePointerMove = (e) => {
      if (!cachedRect && cardEl) {
        cachedRect = cardEl.getBoundingClientRect();
      }
      if (!cachedRect) return;

      const normX = ((e.clientX - cachedRect.left) / cachedRect.width) * 2 - 1;
      const normY = ((e.clientY - cachedRect.top) / cachedRect.height) * 2 - 1;
      mouseCoordsRef.current.x = normX;
      mouseCoordsRef.current.y = normY;
    };

    const handlePointerLeave = () => {
      mouseCoordsRef.current.x = 0;
      mouseCoordsRef.current.y = 0;
      cachedRect = null;
    };

    if (cardEl) {
      cardEl.addEventListener('pointerenter', handlePointerEnter, { passive: true });
      cardEl.addEventListener('pointermove', handlePointerMove, { passive: true });
      cardEl.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    }

    // 9. Resize Handling
    const handleResize = () => {
      if (!container || isDisposed || !renderer || !camera) return;
      cachedRect = null;
      const newW = container.clientWidth || 230;
      const newH = container.clientHeight || 220;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Initial render
    renderer.render(scene, camera);

    // Component Unmount Cleanup (Only when card component itself is removed from DOM)
    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      if (cardEl) {
        cardEl.removeEventListener('pointerenter', handlePointerEnter);
        cardEl.removeEventListener('pointermove', handlePointerMove);
        cardEl.removeEventListener('pointerleave', handlePointerLeave);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hasStartedInit, modelPath]);

  // High-performance animation loop: strictly active only when hovered
  useEffect(() => {
    if (!hasStartedInit) return;

    let lastTime = performance.now();

    const animate = (now) => {
      // If no longer hovered, pause loop immediately (zero CPU/GPU consumption)
      if (!isHoveredRef.current) {
        animFrameRef.current = null;
        return;
      }

      animFrameRef.current = requestAnimationFrame(animate);

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const modelGroup = modelGroupRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;

      if (modelGroup && renderer && scene && camera) {
        // Continuous smooth auto-rotation on Y
        modelGroup.rotation.y += 0.95 * delta;

        // Smooth cursor parallax tilt
        const mouseX = mouseCoordsRef.current.x;
        const mouseY = mouseCoordsRef.current.y;
        const targetTiltX = 0.12 + mouseY * -0.22;
        const targetTiltZ = -0.03 + mouseX * -0.15;

        modelGroup.rotation.x += (targetTiltX - modelGroup.rotation.x) * Math.min(delta * 8, 1);
        modelGroup.rotation.z += (targetTiltZ - modelGroup.rotation.z) * Math.min(delta * 8, 1);

        const baseScale = baseScaleRef.current;
        modelGroup.scale.set(baseScale, baseScale, baseScale);

        renderer.render(scene, camera);
      }
    };

    if (isHovered) {
      if (!animFrameRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      // Render resting frame
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isHovered, hasStartedInit]);

  if (hasError) {
    return null;
  }

  return (
    <div
      className={`disd-card-3d-viewer ${isHovered ? 'active' : ''}`}
      aria-label={`${title} 3D interactive viewer`}
    >
      {/* Instant 2D Silhouette Poster Backdrop: Prevents blank space while model prepares */}
      {posterImage && (
        <div className={`disd-card-3d-poster-wrap ${isModelReady ? 'fade-out' : 'visible'}`}>
          <img
            src={posterImage}
            alt={title}
            className="disd-card-3d-poster-img"
            loading="eager"
            decoding="async"
            width="220"
            height="180"
          />
        </div>
      )}

      {/* Persistent Canvas Container */}
      <div
        ref={mountRef}
        className={`disd-card-3d-canvas-wrap ${isModelReady ? 'ready' : 'hidden'}`}
      />

      {/* Polished loading spinner */}
      {isLoading && isHovered && (
        <div className="disd-card-3d-spinner-wrap">
          <div className="disd-card-3d-spinner" />
        </div>
      )}
    </div>
  );
}
