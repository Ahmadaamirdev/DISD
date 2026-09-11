import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Centralized Product & Specification Data
import { heroProducts, heroProductConfig, getModelAssetForTier } from '../data/heroProductData.js';

// Modular Reusable Hero Components
import HeroProductTitle from './hero/HeroProductTitle.jsx';
import HeroTypography from './hero/HeroTypography.jsx';
import HeroSpecification from './hero/HeroSpecification.jsx';
import HeroSpecificationMarker from './hero/HeroSpecificationMarker.jsx';
import HeroSpecificationConnector from './hero/HeroSpecificationConnector.jsx';
import { getAssetUrl } from '../data/cloudinaryAssets';
import { getDeviceTier } from '../utils/deviceTier.js';

const MODEL_PATH = getAssetUrl('/assets/tripo_pbr_model_4be6fa61-73bb-4da0-b263-fd93bf51e0cc_meshopt.glb');

/**
 * Generates a soft diffused contact shadow texture directly beneath the model.
 */
function createContactShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const cx = 256;
  const cy = 256;

  // 1. Core tight contact shadow
  const coreGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 150);
  coreGrad.addColorStop(0, 'rgba(8, 7, 6, 0.72)');
  coreGrad.addColorStop(0.5, 'rgba(14, 12, 10, 0.42)');
  coreGrad.addColorStop(1, 'rgba(20, 18, 15, 0)');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 190, 130, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Broad diffused ambient occlusion penumbra
  const softGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 240);
  softGrad.addColorStop(0, 'rgba(16, 14, 12, 0.32)');
  softGrad.addColorStop(0.55, 'rgba(22, 20, 17, 0.14)');
  softGrad.addColorStop(1, 'rgba(28, 25, 21, 0)');
  ctx.fillStyle = softGrad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 250, 180, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function Hero3DStudio({ onOpenQuoteModal, onModelLoaded, isSiteReady = false }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const cardsRef = useRef({});
  const bgTextRef = useRef(null);
  const specsContainerRef = useRef(null);
  const headerRef = useRef(null);
  const cardPositionsRef = useRef({});
  const triggerIntroRef = useRef(null);

  useEffect(() => {
    if (isSiteReady && triggerIntroRef.current) {
      triggerIntroRef.current();
    }
  }, [isSiteReady]);

  // Dynamic Product Switcher State (Hydraulic Breaker <-> Electric Forklift)
  const [selectedProductId, setSelectedProductId] = useState('breaker');
  const [isCrossfading, setIsCrossfading] = useState(false);
  const switchProductRef = useRef(null);

  const activeProduct = heroProducts[selectedProductId] || heroProducts.breaker;
  const { product, specifications, engineeringFeatures } = activeProduct;

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [activeHoverId, setActiveHoverId] = useState(null);

  // Carefully Timed 8-Phase Reveal Sequence
  const [revealPhase, setRevealPhase] = useState(0);
  const [isModelReady, setIsModelReady] = useState(false);
  const deviceTier = getDeviceTier();

  // Accessibility: prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);

  // Active hover spec ref for 3D feature illumination in render loop
  const activeHoverSpecRef = useRef(null);
  const activeSpecsRef = useRef(specifications);
  const updateCardPositionsRef = useRef(null);
  const lastScreenCoordsRef = useRef({});

  useEffect(() => {
    activeSpecsRef.current = specifications;
  }, [specifications]);

  useEffect(() => {
    activeHoverSpecRef.current = specifications.find((s) => s.id === activeHoverId) || null;
  }, [activeHoverId, specifications]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (updateCardPositionsRef.current) {
        updateCardPositionsRef.current();
      }
    }, 120);
    return () => clearTimeout(t);
  }, [selectedProductId]);

  // Mouse & scroll parallax state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const idleWeightRef = useRef(0);

  // Handle click/tap toggle for accessibility and mobile touch
  const handleSpecSelect = (id) => {
    setActiveHoverId((prev) => (prev === id ? null : id));
  };

  // Switch between Hydraulic Breaker and Electric Forklift with smooth fade
  const handleToggleProduct = () => {
    if (isCrossfading) return;
    const nextId = selectedProductId === 'breaker' ? 'forklift' : 'breaker';
    setActiveHoverId(null);
    setIsCrossfading(true);

    setTimeout(() => {
      setSelectedProductId(nextId);
      if (switchProductRef.current) {
        switchProductRef.current(nextId);
      }
      setTimeout(() => {
        setIsCrossfading(false);
      }, 60);
    }, 240);
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId;
    let isDisposed = false;
    const startPerfTime = performance.now();
    const getElapsedTime = () => (performance.now() - startPerfTime) * 0.001;

    const getWidth = () => container.clientWidth || window.innerWidth;
    const getHeight = () => container.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x211F1C, 12, 34);

    // 2. Camera Setup - 32° FOV for clean product photography compression
    const camera = new THREE.PerspectiveCamera(
      32,
      getWidth() / getHeight(),
      0.1,
      100
    );
    const initialCamPos = new THREE.Vector3(0, 2.1, 5.6);
    camera.position.copy(initialCamPos);

    // Context loss prevention: Prevent default and fall back smoothly to poster image
    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn('WebGL context lost. Falling back to high-res poster gracefully.');
      setIsModelReady(false);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
    const handleContextRestored = () => {
      console.log('WebGL context restored. Reloading...');
      window.location.reload();
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // 3. WebGL Renderer with ACES Tone Mapping & Adaptive Hardware Capabilities
    if (deviceTier.isFallback) {
      setWebglUnavailable(true);
      setIsLoading(false);
      setIsModelReady(false);
      setRevealPhase(8);
      if (onModelLoaded) onModelLoaded();
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: deviceTier.tier === 'high',
        alpha: true,
        powerPreference: deviceTier.tier === 'high' ? 'high-performance' : 'default',
      });
    } catch (err) {
      console.warn('WebGL context creation failed:', err);
      setWebglUnavailable(true);
      setIsLoading(false);
      setIsModelReady(false);
      setRevealPhase(8);
      if (onModelLoaded) onModelLoaded();
      return () => {
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      };
    }

    const isMobileDevice = deviceTier.isMobile;
    renderer.setPixelRatio(deviceTier.maxPixelRatio);
    renderer.setSize(getWidth(), getHeight(), false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    // Adaptive Dynamic Shadows: Enabled only on high-tier hardware.
    // Medium/Low tiers use the soft contact shadow plane below the machine at 0 GPU cost!
    renderer.shadowMap.enabled = deviceTier.enableShadows;
    if (deviceTier.enableShadows) {
      renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    // 4. Studio Reflection Environment (subtle sheen without blue tint)
    let pmremGenerator;
    let envTexture;
    if (deviceTier.enablePMREM) {
      try {
        pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTexture;
        scene.environmentIntensity = 0.40;
      } catch (pmremErr) {
        console.warn('PMREM environment generation skipped:', pmremErr);
      }
    }

    // 5. Seamless Dark Charcoal Studio Floor
    const floorGeo = new THREE.PlaneGeometry(120, 120);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x211F1C,
      roughness: 0.70,
      metalness: 0.10,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Soft realistic contact shadow plane directly beneath the machine
    const contactShadowTexture = createContactShadowTexture();
    const contactShadowGeo = new THREE.PlaneGeometry(5.4, 5.4);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTexture,
      transparent: true,
      opacity: 0.90,
      depthWrite: false,
    });
    const contactShadowMesh = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.set(0, 0.002, 0);
    scene.add(contactShadowMesh);

    // 6. Professional Three-Point Product Photography Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff6ec, 2.6);
    keyLight.position.set(-4.5, 6.2, 4.5);
    keyLight.castShadow = deviceTier.enableShadows;
    const shadowMapDim = isMobileDevice ? 512 : 1024;
    keyLight.shadow.mapSize.width = shadowMapDim;
    keyLight.shadow.mapSize.height = shadowMapDim;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -4.5;
    keyLight.shadow.camera.right = 4.5;
    keyLight.shadow.camera.top = 4.5;
    keyLight.shadow.camera.bottom = -1.5;
    keyLight.shadow.bias = -0.0001;
    keyLight.shadow.radius = isMobileDevice ? 2 : 3;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xede6dc, 0.95);
    fillLight.position.set(4.8, 3.8, 3.8);
    scene.add(fillLight);

    const orangeRimLight = new THREE.DirectionalLight(0xff8a1a, 1.4);
    orangeRimLight.position.set(-3.2, 4.8, -4.6);
    scene.add(orangeRimLight);

    const rimAccentRight = new THREE.DirectionalLight(0xffa238, 0.85);
    rimAccentRight.position.set(3.8, 4.2, -4.0);
    scene.add(rimAccentRight);

    const overheadSoftbox = new THREE.DirectionalLight(0xfff8f0, 0.65);
    overheadSoftbox.position.set(0, 9.0, 0.5);
    scene.add(overheadSoftbox);

    const hemiLight = new THREE.HemisphereLight(0x36312B, 0x211F1C, 0.85);
    scene.add(hemiLight);

    // FEATURE HIGHLIGHT LIGHT: Subtle 3D accent on hovered component
    const featureHighlightLight = new THREE.PointLight(0xff8a1a, 0, 3.2, 1.8);
    scene.add(featureHighlightLight);

    // 7. OrbitControls - Rotation Enabled with Constant Zoom & Damping (Attached to canvas so HTML overlays are unobstructed)
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enableZoom = false; // Zoom strictly remains constant
    controls.enablePan = false;  // Orbit rotation only
    controls.enableRotate = true;
    controls.rotateSpeed = 0.85;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.enabled = false; // Enabled after initial intro descent

    let loadedModel = null;
    let baseModelY = 0;
    const baseRotationY = -Math.PI / 7;
    const targetLookAt = new THREE.Vector3(0, 0.9, 0);
    const modelCenter = new THREE.Vector3();
    const finalCenter = new THREE.Vector3();

    // Cinematic Camera Intro: Starts viewed from above, then moves towards front
    let isIntroActive = false;
    let introStartTime = null;
    const INTRO_DURATION = 1.9; // seconds
    const camStartPos = new THREE.Vector3();
    const camEndPos = new THREE.Vector3();

    const revealTimers = [];

    // 8. Dynamic Product Model Loader with In-Memory Caching
    const modelCache = {};

    // 4 Animated 3D anchor vectors for smooth position interpolation across models
    const animatedAnchors = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ];
    let isAnchorsInitialized = false;

    // Dynamic 3D model switch animation (rotation, scale & subtle rise/settle)
    let modelTransitionStartTime = null;
    const MODEL_TRANSITION_DURATION = 1.35; // seconds
    let modelStartRotY = 0;
    let modelStartPosY = 0;
    let modelBaseScale = 1;

    const loadProductModel = async (prodId, isInitial = false) => {
      const prodConfig = heroProducts[prodId] || heroProducts.breaker;

      // Remove current model from scene if exists
      if (loadedModel) {
        scene.remove(loadedModel);
        loadedModel = null;
      }

      const setupAndDisplayModel = (model) => {
        loadedModel = model;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.needsUpdate = true;
            }
          }
        });
        // Scale product so it occupies optimal viewport proportion
        if (!model.userData.initialScale) {
          model.position.set(0, 0, 0);
          model.rotation.set(0, 0, 0);
          model.scale.setScalar(1);
          model.updateMatrixWorld(true);

          const initialBox = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          initialBox.getSize(size);

          const maxDim = Math.max(size.x, size.y, size.z);
          const targetDim = prodConfig.targetDim || 2.65;
          const scale = targetDim / (maxDim || 1);
          model.userData.initialScale = scale;
          model.scale.setScalar(scale);
        } else {
          model.scale.setScalar(model.userData.initialScale);
        }
        modelBaseScale = model.userData.initialScale || 1;
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        model.updateMatrixWorld(true);

        // Ground model on floor (Y = 0) and center at X = 0
        const scaledBox = new THREE.Box3().setFromObject(model);
        scaledBox.getCenter(modelCenter);

        baseModelY = -scaledBox.min.y;
        model.position.set(-modelCenter.x, baseModelY, -modelCenter.z);
        model.rotation.y = baseRotationY;
        model.updateMatrixWorld(true);

        scene.add(model);

        // Set camera framing & lookAt
        const finalBox = new THREE.Box3().setFromObject(model);
        finalBox.getCenter(finalCenter);

        targetLookAt.set(0, finalCenter.y * (prodConfig.cameraLookAtYRatio || 0.92), 0);
        controls.target.copy(targetLookAt);

        if (isInitial) {
          camStartPos.set(0.1, finalCenter.y * 3.5, 4.2);
          camEndPos.set(0, finalCenter.y * 1.05, 5.6);
          camera.position.copy(camStartPos);
          camera.lookAt(targetLookAt);

          modelStartRotY = baseRotationY - Math.PI / 4.0;
          modelStartPosY = baseModelY - 0.22;
          modelBaseScale = model.userData.initialScale || 1;
          model.rotation.y = modelStartRotY;
          model.position.y = modelStartPosY;
          model.scale.setScalar(modelBaseScale);

          isIntroActive = false;
          controls.enabled = false;

          // Warm up GPU shaders, compile shadow maps and upload textures while under preloader to eliminate any first-frame jank
          try {
            renderer.compile(scene, camera);
            renderer.render(scene, camera);
          } catch (warmErr) {
            // fallback gracefully
          }
        } else {
          camEndPos.set(0, finalCenter.y * 1.05, 5.6);
          camera.position.copy(camEndPos);
          camera.lookAt(targetLookAt);

          // Trigger smooth model entrance rotation, scale & settle animation
          modelTransitionStartTime = getElapsedTime();
          modelStartRotY = baseRotationY - Math.PI / 4.0;
          modelStartPosY = baseModelY - 0.22;
          modelBaseScale = model.userData.initialScale || 1;
          model.rotation.y = modelStartRotY;
          model.position.y = modelStartPosY;
          model.scale.setScalar(modelBaseScale);
        }

        setIsLoading(false);
        setIsModelReady(true);

        // Staggered reveal sequence synchronized with model presentation
        revealTimers.forEach(clearTimeout);
        revealTimers.length = 0;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setRevealPhase(8);
          camera.position.copy(camEndPos);
          controls.enabled = true;
          isIntroActive = false;
        } else {
          if (isInitial) {
            setRevealPhase(2);
            setTimeout(() => { updateCardPositions(); }, 50);

            if (onModelLoaded) {
              onModelLoaded();
            }

            if (isSiteReady && triggerIntroRef.current) {
              triggerIntroRef.current();
            }

            // Background preload alternate model ONLY on high tier hardware when browser is idle
            if (deviceTier.preloadAlternateModel) {
              const schedulePreload = window.requestIdleCallback || ((cb) => setTimeout(cb, 4000));
              schedulePreload(() => {
                const altId = prodId === 'breaker' ? 'forklift' : 'breaker';
                const altConfig = heroProducts[altId];
                if (altConfig && !modelCache[altId] && !isDisposed) {
                  const preloader = new GLTFLoader();
                  preloader.setMeshoptDecoder(MeshoptDecoder);
                  preloader.load(altConfig.modelPath, (gltf) => {
                    if (!isDisposed) {
                      modelCache[altId] = gltf.scene;
                    }
                  });
                }
              });
            }
          } else {
            setRevealPhase(8);
            controls.enabled = true;
            isIntroActive = false;
            setTimeout(() => { updateCardPositions(); }, 60);
          }
        }
      };

      if (modelCache[prodId]) {
        setupAndDisplayModel(modelCache[prodId]);
        return;
      }

      try {
        await MeshoptDecoder.ready;
        if (isDisposed) return;

        setIsLoading(true);
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);

        const assetUrl = getModelAssetForTier(prodConfig, deviceTier.quality);
        const loadStartTime = performance.now();

        loader.load(
          assetUrl,
          (gltf) => {
            if (isDisposed) return;
            const loadDuration = (performance.now() - loadStartTime).toFixed(1);

            // Texture safety & memory optimization for average GPUs
            try {
              const maxAniso = renderer ? Math.min(renderer.capabilities.getMaxAnisotropy() || 1, 4) : 1;
              gltf.scene.traverse((child) => {
                if (child.isMesh) {
                  if (!deviceTier.enableShadows) {
                    child.castShadow = false;
                    child.receiveShadow = false;
                  }
                  if (child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach((mat) => {
                      if (mat.map) {
                        mat.map.anisotropy = maxAniso;
                        mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                      }
                    });
                  }
                }
              });
            } catch {
              // Ignore traversal error
            }

            modelCache[prodId] = gltf.scene;
            setupAndDisplayModel(gltf.scene);

            if (import.meta.env.DEV) {
              console.log(`[Hero3DStudio] 3D Model loaded for Tier: ${deviceTier.tier} (${deviceTier.quality}) in ${loadDuration}ms`, {
                triangles: renderer?.info?.render?.triangles || 0,
                drawCalls: renderer?.info?.render?.calls || 0,
                geometries: renderer?.info?.memory?.geometries || 0,
                textures: renderer?.info?.memory?.textures || 0,
              });
            }
          },
          (xhr) => {
            if (xhr.total > 0) {
              const pct = Math.round((xhr.loaded / xhr.total) * 100);
              setLoadingProgress(pct);
            }
          },
          (err) => {
            console.error('Error loading GLB:', err);
            setIsLoading(false);
            setIsModelReady(false);
            // Graceful degradation: do not show scary red error banner; keep high-res poster visual active!
            if (isInitial && onModelLoaded) {
              onModelLoaded();
            }
          }
        );
      } catch (err) {
        console.error('Decoder init error:', err);
        setErrorMsg('3D Decoder initialization failed.');
        setIsLoading(false);
        if (isInitial && onModelLoaded) {
          onModelLoaded();
        }
      }
    };

    switchProductRef.current = (nextId) => {
      loadProductModel(nextId, false);
    };

    triggerIntroRef.current = () => {
      const now = getElapsedTime();
      introStartTime = now;
      isIntroActive = true;
      modelTransitionStartTime = now;

      revealTimers.forEach(clearTimeout);
      revealTimers.length = 0;

      // Silky, lightweight staggered UI emergence synchronized with preloader dissolve
      setRevealPhase(2);
      revealTimers.push(setTimeout(() => setRevealPhase(4), 180));
      revealTimers.push(setTimeout(() => setRevealPhase(8), 460));
      revealTimers.push(setTimeout(() => updateCardPositions(), 520));
    };

    loadProductModel(selectedProductId, true);

    // Pre-calculate and cache card screen coordinates to eliminate DOM reflows
    const updateCardPositions = () => {
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const currentSpecs = activeSpecsRef.current || specifications;
      currentSpecs.forEach((spec) => {
        const el = cardsRef.current[spec.id];
        if (el) {
          const r = el.getBoundingClientRect();
          const coords = {
            left: r.left - cRect.left,
            right: r.right - cRect.left,
            top: r.top - cRect.top,
            height: r.height,
          };
          cardPositionsRef.current[spec.id] = coords;
          cardPositionsRef.current[spec.order] = coords;
        }
      });
    };
    updateCardPositionsRef.current = updateCardPositions;

    // 9. Resize Handling
    let lastW = 0;
    let lastH = 0;
    let resizeRafId = null;
    const handleResize = () => {
      const width = getWidth();
      const height = getHeight();
      if (!width || !height || (Math.abs(width - lastW) < 2 && Math.abs(height - lastH) < 2)) return;
      lastW = width;
      lastH = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      try {
        renderer.render(scene, camera);
      } catch (e) { }
      if (resizeRafId) cancelAnimationFrame(resizeRafId);
      resizeRafId = requestAnimationFrame(() => {
        updateCardPositions();
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // If user interacts/drags early during intro, hand over to OrbitControls immediately
    const handlePointerDown = () => {
      if (isIntroActive) {
        isIntroActive = false;
        camera.position.copy(camEndPos);
        controls.enabled = true;
        controls.update();
      }
    };
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true });

    // 10. High-Performance Render Loop with Zero DOM Reflows & 60 FPS Camera Controls
    const tempVec = new THREE.Vector3();
    const tempFeaturePos = new THREE.Vector3();
    const domLineCache = {};
    const domMarkerCache = {};
    let frameCounter = 0;

    let isVisible = true;
    let isTabVisible = typeof document !== 'undefined' ? !document.hidden : true;

    const checkAndResume = () => {
      if (isVisible && isTabVisible && !animationFrameId && !isDisposed) {
        animate();
      }
    };

    const pauseAnimation = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          checkAndResume();
        } else if (!isVisible && wasVisible) {
          pauseAnimation();
        }
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(container);

    const handleDocVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        checkAndResume();
      } else {
        pauseAnimation();
      }
    };
    document.addEventListener('visibilitychange', handleDocVisibilityChange);

    const animate = () => {
      if (!isVisible || !isTabVisible || isDisposed) {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = getElapsedTime();
      const isMobile = window.innerWidth < 768;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Camera Intro Animation: Smooth descent from above view towards front view
      if (isIntroActive && !prefersReduced) {
        if (introStartTime === null) introStartTime = elapsedTime;
        const progress = Math.min((elapsedTime - introStartTime) / INTRO_DURATION, 1);
        // High-end smooth cubic easing
        const ease = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(camStartPos, camEndPos, ease);
        camera.lookAt(targetLookAt);
        controls.target.copy(targetLookAt);

        if (progress >= 1) {
          isIntroActive = false;
          camera.position.copy(camEndPos);
          controls.enabled = true;
          controls.update();
        }
      } else {
        // OrbitControls handles rotation with constant zoom and smooth damping
        controls.update();
      }

      // Subtle mechanical idle float motion on the machine
      const targetIdleWeight = prefersReduced ? 0 : 1;
      idleWeightRef.current += (targetIdleWeight - idleWeightRef.current) * 0.03;
      const idleFloatAmplitude = isMobile ? 0.005 : 0.011;
      const idleFloatY = Math.sin(elapsedTime * 0.65) * idleFloatAmplitude * idleWeightRef.current;

      // Model transition animation when shifting between machines
      let activeBaseY = baseModelY;
      if (modelTransitionStartTime !== null && !prefersReduced) {
        const transElapsed = elapsedTime - modelTransitionStartTime;
        const transProgress = Math.min(transElapsed / MODEL_TRANSITION_DURATION, 1);
        // Silky quartic ease-out
        const transEase = 1 - Math.pow(1 - transProgress, 4);

        if (loadedModel) {
          loadedModel.rotation.y = THREE.MathUtils.lerp(modelStartRotY, baseRotationY, transEase);
          activeBaseY = THREE.MathUtils.lerp(modelStartPosY, baseModelY, transEase);
          loadedModel.scale.setScalar(modelBaseScale);
        }
        if (transProgress >= 1) {
          modelTransitionStartTime = null;
        }
      }

      if (loadedModel) {
        loadedModel.position.x = -modelCenter.x;
        loadedModel.position.y = activeBaseY + idleFloatY;
        loadedModel.position.z = -modelCenter.z;

        contactShadowMesh.scale.setScalar(1 - idleFloatY * 3.2);
        contactShadowMat.opacity = 0.90 - idleFloatY * 4.0;
      }

      // Dynamic 3D Component Highlight on Hover
      if (activeHoverSpecRef.current && loadedModel) {
        const anchor = activeHoverSpecRef.current.anchor;
        tempFeaturePos.set(anchor.x, anchor.y, anchor.z);
        tempFeaturePos.applyMatrix4(loadedModel.matrixWorld);
        featureHighlightLight.position.lerp(tempFeaturePos, 0.18);
        featureHighlightLight.intensity = THREE.MathUtils.lerp(featureHighlightLight.intensity, 0.95, 0.12);
      } else {
        featureHighlightLight.intensity = THREE.MathUtils.lerp(featureHighlightLight.intensity, 0, 0.12);
      }

      // Smart Shadow Map Update: Recalculate shadow depth map every frame during active animations,
      // and throttle to 15fps when idle to save GPU fill rate with zero visual degradation
      const isDynamicAction = modelTransitionStartTime !== null || isIntroActive;
      if (isDynamicAction) {
        renderer.shadowMap.autoUpdate = true;
      } else {
        frameCounter++;
        renderer.shadowMap.autoUpdate = (frameCounter % 4 === 0);
      }

      // Render 3D scene smoothly
      renderer.render(scene, camera);

      // Dynamic 3D Anchor Projection: Uses CACHED card coordinates & CACHED DOM elements (Desktop only)
      if (loadedModel && svgRef.current && !isMobile) {
        const width = getWidth();
        const height = getHeight();
        const currentSpecs = activeSpecsRef.current || specifications;

        currentSpecs.forEach((spec, idx) => {
          if (!animatedAnchors[idx]) {
            animatedAnchors[idx] = new THREE.Vector3(spec.anchor.x, spec.anchor.y, spec.anchor.z);
          }
          const targetAnchor = spec.anchor;

          if (!isAnchorsInitialized) {
            animatedAnchors[idx].set(targetAnchor.x, targetAnchor.y, targetAnchor.z);
          } else {
            // Smoothly move the 3D yellow dot anchor to align with the active model
            animatedAnchors[idx].lerp(targetAnchor, 0.08);
          }

          tempVec.copy(animatedAnchors[idx]);
          tempVec.applyMatrix4(loadedModel.matrixWorld);
          tempVec.project(camera);

          const screenX = (tempVec.x * 0.5 + 0.5) * width;
          const screenY = (-tempVec.y * 0.5 + 0.5) * height;
          const isBehind = tempVec.z > 1;

          const specKey = spec.order || spec.id;
          let lineEl = domLineCache[specKey];
          if (!lineEl) {
            lineEl = document.getElementById(`connector-line-${spec.order}`) || document.getElementById(`connector-line-${spec.id}`);
            if (lineEl) domLineCache[specKey] = lineEl;
          }
          let markerEl = domMarkerCache[specKey];
          if (!markerEl) {
            markerEl = document.getElementById(`spec-marker-${spec.order}`) || document.getElementById(`spec-marker-${spec.id}`);
            if (markerEl) domMarkerCache[specKey] = markerEl;
          }
          const cachedCard = cardPositionsRef.current[spec.id] || cardPositionsRef.current[spec.order];

          // Check if coordinate changed by more than 0.25px before touching DOM
          const lastCoords = lastScreenCoordsRef.current[specKey];
          const hasMoved = !lastCoords || Math.abs(lastCoords.x - screenX) > 0.25 || Math.abs(lastCoords.y - screenY) > 0.25 || lastCoords.isBehind !== isBehind;

          if (hasMoved) {
            lastScreenCoordsRef.current[specKey] = { x: screenX, y: screenY, isBehind };

            if (markerEl) {
              markerEl.style.transform = `translate(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px)`;
              markerEl.style.opacity = isBehind ? '0' : '1';
            }

            if (lineEl && cachedCard) {
              if (isBehind) {
                lineEl.style.opacity = '0';
              } else {
                lineEl.style.opacity = '0.75';
                const targetX = spec.side === 'left' ? cachedCard.right : cachedCard.left;
                const targetY = cachedCard.top + cachedCard.height * 0.42;

                const elbowX = spec.side === 'left' ? targetX + 38 : targetX - 38;
                const pathD = `M ${screenX.toFixed(1)} ${screenY.toFixed(1)} L ${elbowX.toFixed(1)} ${targetY.toFixed(1)} L ${targetX.toFixed(1)} ${targetY.toFixed(1)}`;
                lineEl.setAttribute('d', pathD);
              }
            }
          }
        });
        isAnchorsInitialized = true;
      }
    };
    animate();

    return () => {
      isDisposed = true;
      document.removeEventListener('visibilitychange', handleDocVisibilityChange);
      triggerIntroRef.current = null;
      visibilityObserver.disconnect();
      revealTimers.forEach((t) => clearTimeout(t));
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (controls) controls.dispose();
      if (renderer) renderer.dispose();
      if (pmremGenerator) pmremGenerator.dispose();
      if (envTexture) envTexture.dispose();
      contactShadowTexture.dispose();
    };
  }, []);

  // Smooth scroll down to the next section
  const handleScrollDown = () => {
    const heroEl = containerRef.current?.closest('#hero-experience') || containerRef.current;
    if (heroEl) {
      const nextEl = heroEl.nextElementSibling;
      if (nextEl) {
        nextEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const registerCardRef = (id, el) => {
    if (el) {
      cardsRef.current[id] = el;
      if (containerRef.current) {
        const cRect = containerRef.current.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        cardPositionsRef.current[id] = {
          left: r.left - cRect.left,
          right: r.right - cRect.left,
          top: r.top - cRect.top,
          height: r.height,
        };
      }
    }
  };

  const leftSpecs = specifications.filter((s) => s.side === 'left');
  const rightSpecs = specifications.filter((s) => s.side === 'right');

  return (
    <div
      ref={containerRef}
      className="disd-hero-3d-container"
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 84px)',
        minHeight: '680px',
        overflow: 'hidden',
        backgroundColor: '#211F1C',
        background: 'radial-gradient(ellipse at 50% 48%, #36322B 0%, #2B2925 42%, #211F1C 74%, #181714 100%)',
        userSelect: 'none',
        cursor: 'grab',
        opacity: revealPhase >= 1 ? 1 : 0.82,
        transition: reducedMotion ? 'none' : 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
        contain: 'paint',
        transform: 'translateZ(0)',
      }}
    >
      {/* 0. PRODUCT MODEL SWITCHER BUTTON (Top Right Corner) */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(28px, 4.5vh, 44px)',
          right: 'clamp(24px, 4.5vw, 68px)',
          zIndex: 25,
          pointerEvents: 'auto',
        }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          id="disd-model-switcher-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleProduct();
          }}
          aria-label={selectedProductId === 'breaker' ? 'Switch to Forklift' : 'Switch to Breaker'}
          className="disd-model-switcher-btn"
        >
          <span className="switcher-btn-text">
            {selectedProductId === 'breaker' ? 'FORKLIFT' : 'BREAKER'}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8A1A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="switcher-btn-arrow"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* DYNAMIC PRODUCT VIEW (Smooth crossfade between machines) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: isCrossfading ? 0 : 1,
          transform: isCrossfading ? 'scale(0.985)' : 'scale(1)',
          transition: reducedMotion
            ? 'none'
            : isCrossfading
              ? 'opacity 0.24s cubic-bezier(0.4, 0, 1, 1), transform 0.24s cubic-bezier(0.4, 0, 1, 1)'
              : 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isCrossfading ? 'none' : 'auto',
        }}
      >
        {/* 1. ATMOSPHERIC BACKGROUND TYPOGRAPHY (zIndex 1) */}
        <HeroTypography
          heroWord={product.backgroundWord}
          revealPhase={revealPhase}
          reducedMotion={reducedMotion}
          innerRef={bgTextRef}
        />

        {/* 2. THREE.JS 3D CANVAS (Continuous WebGL Canvas, zIndex 3) */}
        {!webglUnavailable && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'block',
              width: '100%',
              height: '100%',
              outline: 'none',
              zIndex: 3,
              opacity: (revealPhase >= 2 && isModelReady) ? 1 : 0,
              transform: (revealPhase >= 2 && isModelReady)
                ? 'scale(1) translateY(0)'
                : 'scale(0.975) translateY(10px)',
              transition: reducedMotion
                ? 'opacity 0.3s ease'
                : 'opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'opacity, transform',
              contain: 'strict',
            }}
          />
        )}

        {/* 3. DYNAMIC TECHNICAL CONNECTOR LINES (zIndex 3) */}
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          <defs>
            <linearGradient id="connectorGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#857C70" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#857C70" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FF8A1A" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="connectorGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#FF8A1A" stopOpacity="0.65" />
              <stop offset="30%" stopColor="#857C70" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FF8A1A" stopOpacity="0.65" />
            </linearGradient>
          </defs>

          {specifications.map((spec) => (
            <HeroSpecificationConnector
              key={spec.order || spec.id}
              spec={spec}
              isHovered={activeHoverId === spec.id}
              isOtherHovered={activeHoverId && activeHoverId !== spec.id}
              revealPhase={revealPhase}
              reducedMotion={reducedMotion}
            />
          ))}
        </svg>

        {/* 4. CIRCULAR SPECIFICATION MARKERS (zIndex 4) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
          {specifications.map((spec) => (
            <HeroSpecificationMarker
              key={spec.order || spec.id}
              spec={spec}
              isHovered={activeHoverId === spec.id}
              isOtherHovered={activeHoverId && activeHoverId !== spec.id}
              revealPhase={revealPhase}
              reducedMotion={reducedMotion}
              onMouseEnter={setActiveHoverId}
              onMouseLeave={() => setActiveHoverId(null)}
              onClick={handleSpecSelect}
            />
          ))}
        </div>

        {/* 5. CENTERED PRODUCT TITLE HIERARCHY (zIndex 5) */}
        <HeroProductTitle
          product={product}
          revealPhase={revealPhase}
          reducedMotion={reducedMotion}
          innerRef={headerRef}
        />

        {/* 6. SPECIFICATION CALLOUTS: LEFT & RIGHT COLUMNS (zIndex 5) */}
        <div
          ref={specsContainerRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 clamp(20px, 4.5vw, 90px)',
            transition: 'opacity 0.25s ease',
          }}
        >
          {/* LEFT COLUMN: 2 Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(60px, 12vh, 120px)' }}>
            {leftSpecs.map((spec) => (
              <div key={spec.id} className={spec.order > 2 ? 'hero-spec-secondary' : ''}>
                <HeroSpecification
                  spec={spec}
                  isHovered={activeHoverId === spec.id}
                  isOtherHovered={activeHoverId && activeHoverId !== spec.id}
                  revealPhase={revealPhase}
                  reducedMotion={reducedMotion}
                  onMouseEnter={setActiveHoverId}
                  onMouseLeave={() => setActiveHoverId(null)}
                  onClick={handleSpecSelect}
                  registerCardRef={registerCardRef}
                />
              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: 2 Specifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(60px, 12vh, 120px)' }}>
            {rightSpecs.map((spec) => (
              <div key={spec.id} className={spec.order > 2 ? 'hero-spec-secondary' : ''}>
                <HeroSpecification
                  spec={spec}
                  isHovered={activeHoverId === spec.id}
                  isOtherHovered={activeHoverId && activeHoverId !== spec.id}
                  revealPhase={revealPhase}
                  reducedMotion={reducedMotion}
                  onMouseEnter={setActiveHoverId}
                  onMouseLeave={() => setActiveHoverId(null)}
                  onClick={handleSpecSelect}
                  registerCardRef={registerCardRef}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 7. SCROLL TO EXPLORE TRIGGER */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Scroll to explore"
        onClick={handleScrollDown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleScrollDown();
          }
        }}
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: revealPhase >= 8 ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          cursor: 'pointer',
          pointerEvents: 'auto',
          zIndex: 5,
          opacity: revealPhase >= 8 ? 1 : 0,
          transition: reducedMotion
            ? 'opacity 0.3s ease'
            : 'opacity 1.4s ease, transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
        }}
        className="disd-explore-trigger"
      >
        <span style={{ letterSpacing: '2.2px', fontSize: 10, color: '#A3998D', fontWeight: 700, textTransform: 'uppercase', transition: 'color 0.25s ease' }}>
          SCROLL TO EXPLORE
        </span>
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ animation: reducedMotion ? 'none' : 'bounceSlow 3.4s infinite ease-in-out' }}>
          <path
            d="M6 1V10M6 10L2 6.5M6 10L10 6.5"
            stroke="#FF8A1A"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>



      {/* 10. ERROR BANNER */}
      {errorMsg && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(220, 38, 38, 0.9)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 8,
            fontSize: 13,
            zIndex: 20,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* 11. WEBGL SUSPENDED / UNAVAILABLE NOTIFICATION */}
      {webglUnavailable && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 110,
            background: 'rgba(27, 25, 22, 0.94)',
            border: '1.5px solid rgba(255, 138, 26, 0.6)',
            borderRadius: '9999px',
            padding: '10px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#ECE5DB',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span>WebGL context suspended by browser.</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: '#FF8A1A',
              color: '#12100E',
              border: 'none',
              borderRadius: '9999px',
              padding: '5px 14px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: '11px',
              letterSpacing: '0.8px',
              cursor: 'pointer',
            }}
          >
            RELOAD TAB
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes markerPulseUnderstated {
          0%, 100% {
            transform: scale(1);
            opacity: 0.65;
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
          }
        }
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          50% {
            transform: translateY(3px);
            opacity: 1;
          }
        }
        @keyframes pulseDot {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.35);
            opacity: 1;
            box-shadow: 0 0 12px #FF8A1A, 0 0 20px rgba(255, 138, 26, 0.95);
          }
        }
        .disd-hero-3d-container {
          cursor: grab;
        }
        .disd-hero-3d-container:active {
          cursor: grabbing;
        }
        .disd-explore-trigger:hover span {
          color: #FF8A1A !important;
        }
        .disd-model-switcher-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: rgba(27, 25, 22, 0.94);
          border: 1.5px solid #FF8A1A;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.45), 0 0 16px rgba(255, 138, 26, 0.25);
          color: #FFFFFF;
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          backdrop-filter: blur(8px);
        }
        .disd-model-switcher-btn:hover {
          background: rgba(38, 34, 29, 0.98);
          border-color: #FFA238;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6), 0 0 22px rgba(255, 138, 26, 0.5);
          transform: translateY(-1px) scale(1.03);
          color: #FFFFFF;
        }
        .disd-model-switcher-btn:active {
          transform: translateY(0) scale(0.98);
        }
        .switcher-btn-text {
          display: inline-block;
          line-height: 1;
          color: #FFFFFF;
          font-weight: 800;
          letter-spacing: 1.2px;
        }
        .switcher-btn-arrow {
          display: inline-block;
          transition: transform 0.25s ease;
          stroke: #FF8A1A;
        }
        .disd-model-switcher-btn:hover .switcher-btn-arrow {
          transform: translateX(3px);
        }
        @media (max-width: 640px) {
          .hero-spec-secondary {
            display: none !important;
          }
          .disd-model-switcher-btn {
            padding: 6px 14px;
            font-size: 11px;
            letter-spacing: 0.9px;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}
