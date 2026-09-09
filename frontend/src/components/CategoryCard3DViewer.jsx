import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Module-level in-memory cache to prevent re-fetching GLBs across cards & hover re-entries
const globalModelCache = new Map();
const globalLoadingPromises = new Map();

/**
 * Pre-fetches and parses a GLB model with MeshoptDecoder, storing the scene in memory.
 */
async function loadGlbModel(modelPath) {
  if (globalModelCache.has(modelPath)) {
    return globalModelCache.get(modelPath);
  }

  if (globalLoadingPromises.has(modelPath)) {
    return globalLoadingPromises.get(modelPath);
  }

  const promise = (async () => {
    await MeshoptDecoder.ready;
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    return new Promise((resolve, reject) => {
      loader.load(
        modelPath,
        (gltf) => {
          globalModelCache.set(modelPath, gltf.scene);
          globalLoadingPromises.delete(modelPath);
          resolve(gltf.scene);
        },
        undefined,
        (err) => {
          globalLoadingPromises.delete(modelPath);
          console.error(`[CategoryCard3DViewer] Failed to load ${modelPath}:`, err);
          reject(err);
        }
      );
    });
  })();

  globalLoadingPromises.set(modelPath, promise);
  return promise;
}

/**
 * Generates a realistic soft radial contact shadow texture for the ground pedestal.
 */
function createContactShadowTexture() {
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

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function CategoryCard3DViewer({ modelPath, isHovered, title = 'Equipment' }) {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(!globalModelCache.has(modelPath));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isHovered && !globalModelCache.has(modelPath)) {
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    let animId = null;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup - well-proportioned for card interior
    const width = container.clientWidth || 230;
    const height = container.clientHeight || 220;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 3.2);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with transparent background & high dynamic range
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    // Key light (warm golden industrial highlights)
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 2.6);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    // Cool fill light (balanced contrast)
    const fillLight = new THREE.DirectionalLight(0xddf2ff, 1.4);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    // Strong rim light from above/rear (silhouettes mechanical details)
    const rimLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // Subtle bottom bounce light (industrial underglow)
    const bounceLight = new THREE.DirectionalLight(0xff9900, 0.4);
    bounceLight.position.set(0, -3, 2);
    scene.add(bounceLight);

    // 5. Contact Shadow Pedestal
    const shadowTexture = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(2.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.65;
    scene.add(shadowPlane);

    // 6. Model Emergence Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let baseScale = 1;
    let isModelReady = false;

    loadGlbModel(modelPath)
      .then((originalScene) => {
        if (isDisposed) return;

        const clone = originalScene.clone(true);

        // Normalize bounding box & center geometry pivot
        const box = new THREE.Box3().setFromObject(clone);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        clone.position.x = -center.x;
        clone.position.y = -center.y;
        clone.position.z = -center.z;

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetDim = 1.75;
        baseScale = targetDim / maxDim;

        modelGroup.scale.set(baseScale, baseScale, baseScale);
        modelGroup.position.set(0, 0, 0);

        // Base isometric pitch
        modelGroup.rotation.x = 0.12;
        modelGroup.rotation.z = -0.03;

        modelGroup.add(clone);
        isModelReady = true;
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isDisposed) {
          setHasError(true);
          setIsLoading(false);
        }
      });

    // 7. Interactive Cursor Parallax
    let mouseX = 0;
    let mouseY = 0;
    const cardEl = container.closest('.disd-cat-five-card');

    const handlePointerMove = (e) => {
      if (!cardEl) return;
      const rect = cardEl.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to +1
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to +1
      mouseX = normX;
      mouseY = normY;
    };

    const handlePointerLeave = () => {
      mouseX = 0;
      mouseY = 0;
    };

    if (cardEl) {
      cardEl.addEventListener('pointermove', handlePointerMove);
      cardEl.addEventListener('pointerleave', handlePointerLeave);
    }

    // 8. Dynamic Emergence & Rotation Loop
    let lastTime = performance.now();
    let emergenceProgress = isHovered ? 0 : 0;

    const animate = (now) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isModelReady) {
        // Continuous smooth auto-rotation on Y
        modelGroup.rotation.y += 0.95 * delta;

        // Mouse Parallax tilt
        const targetTiltX = 0.12 + mouseY * -0.22;
        const targetTiltZ = -0.03 + mouseX * -0.15;
        modelGroup.rotation.x += (targetTiltX - modelGroup.rotation.x) * Math.min(delta * 8, 1);
        modelGroup.rotation.z += (targetTiltZ - modelGroup.rotation.z) * Math.min(delta * 8, 1);

        modelGroup.scale.set(baseScale, baseScale, baseScale);
        modelGroup.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    if (isHovered) {
      animId = requestAnimationFrame(animate);
    } else {
      // Single resting render
      renderer.render(scene, camera);
    }

    // 9. Resize observer / handling
    const handleResize = () => {
      if (!container || isDisposed) return;
      const newW = container.clientWidth || 280;
      const newH = container.clientHeight || 260;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isDisposed = true;
      window.removeEventListener('resize', handleResize);
      if (cardEl) {
        cardEl.removeEventListener('pointermove', handlePointerMove);
        cardEl.removeEventListener('pointerleave', handlePointerLeave);
      }
      if (animId) cancelAnimationFrame(animId);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      shadowTexture.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
    };
  }, [modelPath, isHovered]);

  if (hasError) {
    return null;
  }

  return (
    <div
      className={`disd-card-3d-viewer ${isHovered ? 'active' : ''}`}
      aria-label={`${title} 3D interactive viewer`}
    >
      <div ref={mountRef} className="disd-card-3d-canvas-wrap" />
      {isLoading && isHovered && (
        <div className="disd-card-3d-spinner-wrap">
          <div className="disd-card-3d-spinner" />
        </div>
      )}
    </div>
  );
}
