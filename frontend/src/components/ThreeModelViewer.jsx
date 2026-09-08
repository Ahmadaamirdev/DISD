import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

export default function ThreeModelViewer({ 
  models = [], 
  activeIndex = 0,
  isAutoRotate = true
}) {
  const mountRef = useRef(null);
  const [loadError, setLoadError] = useState(null);

  const modelGroupsRef = useRef([]);

  // Sync visibility when activeIndex changes (instant switch with zero reload/spinner)
  useEffect(() => {
    if (modelGroupsRef.current && modelGroupsRef.current.length > 0) {
      modelGroupsRef.current.forEach((grp, idx) => {
        if (grp) {
          grp.visible = (idx === activeIndex);
        }
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !models || models.length === 0) return;

    setLoadError(null);

    let animationFrameId;
    let renderer;
    let scene;
    let camera;
    let controls;
    let isDisposed = false;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 580;

    // 1. Scene Setup
    scene = new THREE.Scene();

    // 2. Camera Setup (Perspective, 38 deg FOV for realistic perspective depth)
    camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

    // 3. WebGL Renderer with clean transparent background
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = false;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. OrbitControls (Rotation only - Zoom strictly disabled)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.target.set(0, -0.06, 0);

    // 5. Clean, Realistic High-Impact Lighting matching quarry environment
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ea, 2.8);
    sunLight.position.set(7, 9, 6);
    scene.add(sunLight);

    const skyFillLight = new THREE.DirectionalLight(0xe8f0fa, 1.2);
    skyFillLight.position.set(-6, 5, -3);
    scene.add(skyFillLight);

    const groundBounceLight = new THREE.DirectionalLight(0xd9c8b0, 0.8);
    groundBounceLight.position.set(0, -4, 2);
    scene.add(groundBounceLight);

    // Rim light from rear to highlight the boom arm and create 3D separation
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.6);
    rimLight.position.set(-5, 6, -5);
    scene.add(rimLight);

    // Main parent turntable group for synchronized 360 degree rotation
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);

    const loadedGroups = [];

    // Formula to maximize model size on screen so it towers and leaps out of the screen
    const updateCameraDistance = () => {
      const vFovRad = (camera.fov * Math.PI) / 360;
      const hFovRad = Math.atan(Math.tan(vFovRad) * camera.aspect);
      const minFovRad = Math.min(vFovRad, hFovRad);
      
      // Scaled up to fit beautifully inside the viewport
      const targetRadius = 1.0;
      const distance = (targetRadius / Math.sin(minFovRad)) * 0.78;

      // Imposing heroic low-angle perspective looking slightly upward at the boom
      const dir = new THREE.Vector3(1.22, 0.40, 1.30).normalize();
      camera.position.copy(dir.multiplyScalar(distance));
      const lookTarget = new THREE.Vector3(0, -0.04, 0);
      camera.lookAt(lookTarget);
      controls.target.copy(lookTarget);
      controls.update();
    };

    updateCameraDistance();

    // 6. Preload ALL models into the turntableGroup for instantaneous 3s shifting
    const loadAllModels = async () => {
      try {
        await MeshoptDecoder.ready;
        if (isDisposed) return;

        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);

        let completedCount = 0;

        for (let i = 0; i < models.length; i++) {
          const modelObj = models[i];
          const subGroup = new THREE.Group();
          subGroup.visible = (i === activeIndex);
          turntableGroup.add(subGroup);
          loadedGroups.push(subGroup);

          loader.load(
            modelObj.file,
            (gltf) => {
              if (isDisposed) return;

              const modelScene = gltf.scene;

              modelScene.traverse((child) => {
                if (child.isMesh) {
                  if (child.material) {
                    child.material.envMapIntensity = 1.35;
                    child.material.roughness = Math.max(0.18, (child.material.roughness ?? 0.5) * 0.86);
                    child.material.metalness = Math.min(1.0, (child.material.metalness ?? 0.2) * 1.18);
                    child.material.needsUpdate = true;
                  }
                }
              });

              // Bounding sphere calculation to normalize model scale to radius 1.0
              const box = new THREE.Box3().setFromObject(modelScene);
              const sphere = box.getBoundingSphere(new THREE.Sphere());
              const center = box.getCenter(new THREE.Vector3());

              const radius = sphere.radius || 1;
              const targetRadius = 1.0;
              const scale = targetRadius / radius;
              modelScene.scale.setScalar(scale);

              // Center model strictly at origin (0, 0, 0)
              modelScene.position.set(
                -center.x * scale,
                -center.y * scale,
                -center.z * scale
              );

              subGroup.add(modelScene);
              completedCount++;
            },
            undefined,
            (error) => {
              console.error(`Error loading model ${modelObj.name}:`, error);
              completedCount++;
              if (completedCount === models.length && loadedGroups.length === 0) {
                setLoadError('Failed to load 3D equipment.');
              }
            }
          );
        }

        modelGroupsRef.current = loadedGroups;
      } catch (err) {
        console.error('Meshopt initialization error:', err);
        if (!isDisposed) {
          setLoadError('3D Decoder initialization failed.');
        }
      }
    };

    loadAllModels();

    // 7. Viewport Visibility Observer (Pauses WebGL when scrolled off-screen for 60fps page scroll)
    let isVisibleOnScreen = true;
    const visibilityObserver = new IntersectionObserver((entries) => {
      if (entries[0]) {
        isVisibleOnScreen = entries[0].isIntersecting;
        if (isVisibleOnScreen) {
          lastTime = performance.now();
        }
      }
    }, { threshold: 0.05 });
    visibilityObserver.observe(container);

    // 8. Turntable Animation Loop
    let lastTime = performance.now();
    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Do zero work and zero render if off-screen
      if (!isVisibleOnScreen) return;

      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (isAutoRotate && turntableGroup) {
        turntableGroup.rotation.y += delta * 0.35;
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate(performance.now());

    // 9. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
          updateCameraDistance();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();

      loadedGroups.forEach((grp) => {
        grp.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [models]);

  return (
    <div className="disd-three-canvas-wrap">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={mountRef} 
        className="disd-three-canvas" 
        tabIndex="0"
        aria-label="Interactive 3D viewport for DISD Equipment"
      />



      {/* Error State */}
      {loadError && (
        <div className="disd-three-error">
          <p>⚠️ Unable to render 3D model: {loadError}</p>
        </div>
      )}
    </div>
  );
}
