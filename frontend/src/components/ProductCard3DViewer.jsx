import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { getAssetUrl } from '../data/cloudinaryAssets';

// Materials Palette
const matDISDOrange = new THREE.MeshStandardMaterial({ color: 0xFF9900, roughness: 0.35, metalness: 0.4 });
const matDarkGreen = new THREE.MeshStandardMaterial({ color: 0x043927, roughness: 0.4, metalness: 0.3 });
const matDarkSteel = new THREE.MeshStandardMaterial({ color: 0x242D38, roughness: 0.5, metalness: 0.7 });
const matChrome = new THREE.MeshStandardMaterial({ color: 0xEEF2F6, roughness: 0.12, metalness: 0.95 });
const matRubber = new THREE.MeshStandardMaterial({ color: 0x18181B, roughness: 0.85, metalness: 0.1 });
const matGlass = new THREE.MeshStandardMaterial({ color: 0x67E8F9, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.55 });
const matWarningYellow = new THREE.MeshStandardMaterial({ color: 0xF59E0B, roughness: 0.35, metalness: 0.3 });

// Procedural 3D Excavator
function buildExcavator() {
  const group = new THREE.Group();

  // Tracks (Left & Right)
  const trackGeo = new THREE.BoxGeometry(0.24, 0.28, 1.4);
  const leftTrack = new THREE.Mesh(trackGeo, matRubber);
  leftTrack.position.set(-0.45, -0.4, 0);
  const rightTrack = new THREE.Mesh(trackGeo, matRubber);
  rightTrack.position.set(0.45, -0.4, 0);
  group.add(leftTrack, rightTrack);

  // Sprockets
  const wheelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.25, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const w1 = new THREE.Mesh(wheelGeo, matDarkSteel);
  w1.position.set(-0.45, -0.4, 0.55);
  const w2 = new THREE.Mesh(wheelGeo, matDarkSteel);
  w2.position.set(-0.45, -0.4, -0.55);
  const w3 = new THREE.Mesh(wheelGeo, matDarkSteel);
  w3.position.set(0.45, -0.4, 0.55);
  const w4 = new THREE.Mesh(wheelGeo, matDarkSteel);
  w4.position.set(0.45, -0.4, -0.55);
  group.add(w1, w2, w3, w4);

  // Chassis Center Bridge
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.9), matDarkSteel);
  chassis.position.set(0, -0.32, 0);
  group.add(chassis);

  // Upper Rotating Deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 1.1), matDISDOrange);
  deck.position.set(0, 0.02, -0.05);
  group.add(deck);

  // Counterweight
  const cw = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.42, 0.35), matDarkGreen);
  cw.position.set(0, 0.05, -0.52);
  group.add(cw);

  // Operator Cabin
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.48, 0.48), matGlass);
  cab.position.set(-0.25, 0.4, 0.2);
  group.add(cab);

  // Boom (Arm 1)
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 0.16), matDISDOrange);
  boom.position.set(0.18, 0.55, 0.45);
  boom.rotation.x = -Math.PI / 4;
  group.add(boom);

  // Dipper Arm (Arm 2)
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.85, 0.14), matDarkSteel);
  stick.position.set(0.18, 0.8, 1.05);
  stick.rotation.x = Math.PI / 4;
  group.add(stick);

  // Hydraulic Cylinder
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), matChrome);
  cyl.position.set(0.18, 0.45, 0.3);
  cyl.rotation.x = -Math.PI / 3.2;
  group.add(cyl);

  // Heavy Bucket
  const bucket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.35, 0.35), matDarkSteel);
  bucket.position.set(0.18, 0.42, 1.35);
  bucket.rotation.x = -Math.PI / 3;
  group.add(bucket);

  return group;
}

// Procedural 3D Forklift
function buildForklift() {
  const group = new THREE.Group();

  // Heavy Body & Chassis
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.48, 1.1), matDISDOrange);
  body.position.set(0, -0.05, -0.1);
  group.add(body);

  // Counterweight
  const cw = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.52, 0.38), matDarkGreen);
  cw.position.set(0, 0, -0.55);
  group.add(cw);

  // 4 Heavy Deep-Lug Wheels
  const tireGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 14);
  tireGeo.rotateZ(Math.PI / 2);
  const t1 = new THREE.Mesh(tireGeo, matRubber);
  t1.position.set(-0.48, -0.28, 0.4);
  const t2 = new THREE.Mesh(tireGeo, matRubber);
  t2.position.set(0.48, -0.28, 0.4);
  const t3 = new THREE.Mesh(tireGeo, matRubber);
  t3.position.set(-0.48, -0.28, -0.4);
  const t4 = new THREE.Mesh(tireGeo, matRubber);
  t4.position.set(0.48, -0.28, -0.4);
  group.add(t1, t2, t3, t4);

  // ROPS Overhead Safety Cage
  const cagePillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.7, 6);
  const cp1 = new THREE.Mesh(cagePillarGeo, matDarkSteel);
  cp1.position.set(-0.35, 0.45, 0.2);
  const cp2 = new THREE.Mesh(cagePillarGeo, matDarkSteel);
  cp2.position.set(0.35, 0.45, 0.2);
  const cp3 = new THREE.Mesh(cagePillarGeo, matDarkSteel);
  cp3.position.set(-0.35, 0.45, -0.35);
  const cp4 = new THREE.Mesh(cagePillarGeo, matDarkSteel);
  cp4.position.set(0.35, 0.45, -0.35);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 0.6), matDarkSteel);
  roof.position.set(0, 0.8, -0.08);
  group.add(cp1, cp2, cp3, cp4, roof);

  // Vertical Mast (Dual Rails)
  const mastGeo = new THREE.BoxGeometry(0.06, 1.4, 0.08);
  const mastL = new THREE.Mesh(mastGeo, matDarkSteel);
  mastL.position.set(-0.25, 0.4, 0.52);
  const mastR = new THREE.Mesh(mastGeo, matDarkSteel);
  mastR.position.set(0.25, 0.4, 0.52);
  group.add(mastL, mastR);

  // Hydraulic Mast Cylinder
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), matChrome);
  cyl.position.set(0, 0.35, 0.5);
  group.add(cyl);

  // Carriage Plate
  const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.05), matDarkSteel);
  carriage.position.set(0, 0.1, 0.57);
  group.add(carriage);

  // Dual Lifting Forks
  const forkGeo = new THREE.BoxGeometry(0.08, 0.03, 0.7);
  const fL = new THREE.Mesh(forkGeo, matChrome);
  fL.position.set(-0.18, 0.02, 0.9);
  const fR = new THREE.Mesh(forkGeo, matChrome);
  fR.position.set(0.18, 0.02, 0.9);
  group.add(fL, fR);

  return group;
}

// Procedural 3D Vibrating Compactor
function buildCompactor() {
  const group = new THREE.Group();

  // Heavy Bottom Compactor Plate
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.85), matDarkSteel);
  plate.position.set(0, -0.45, 0);
  group.add(plate);

  // Swedish Rubber Shock Dampers (4 corners)
  const damperGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.2, 8);
  const d1 = new THREE.Mesh(damperGeo, matRubber);
  d1.position.set(-0.45, -0.3, 0.3);
  const d2 = new THREE.Mesh(damperGeo, matRubber);
  d2.position.set(0.45, -0.3, 0.3);
  const d3 = new THREE.Mesh(damperGeo, matRubber);
  d3.position.set(-0.45, -0.3, -0.3);
  const d4 = new THREE.Mesh(damperGeo, matRubber);
  d4.position.set(0.45, -0.3, -0.3);
  group.add(d1, d2, d3, d4);

  // Vibration Motor Housing Block
  const motor = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.55), matDISDOrange);
  motor.position.set(0, -0.05, 0);
  group.add(motor);

  // Dual Eccentric Weight Bearing Caps
  const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.92, 12);
  capGeo.rotateZ(Math.PI / 2);
  const cap = new THREE.Mesh(capGeo, matDarkGreen);
  cap.position.set(0, -0.05, 0);
  group.add(cap);

  // Hydraulic Manifold & Pressure Valve
  const valve = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.24), matChrome);
  valve.position.set(0.3, 0.22, 0);
  group.add(valve);

  // Top Universal Quick-Coupler Adapter Hitch
  const hitchBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.45), matDarkSteel);
  hitchBase.position.set(0, 0.28, 0);
  group.add(hitchBase);

  // Dual Excavator Mounting Steel Pins
  const pinGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.6, 12);
  pinGeo.rotateX(Math.PI / 2);
  const p1 = new THREE.Mesh(pinGeo, matChrome);
  p1.position.set(-0.2, 0.42, 0);
  const p2 = new THREE.Mesh(pinGeo, matChrome);
  p2.position.set(0.2, 0.42, 0);
  group.add(p1, p2);

  return group;
}

// Procedural 3D Hydraulic Grapple
function buildGrapple() {
  const group = new THREE.Group();

  // Slewing Rotation Motor Head
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.28, 16), matDarkGreen);
  head.position.set(0, 0.55, 0);
  group.add(head);

  // Rotation Swivel Flange
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12), matChrome);
  flange.position.set(0, 0.72, 0);
  group.add(flange);

  // Central Pivot Body
  const centerBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.45), matDISDOrange);
  centerBody.position.set(0, 0.25, 0);
  group.add(centerBody);

  // Dual Enclosed Hydraulic Cylinders
  const cylGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8);
  const cL = new THREE.Mesh(cylGeo, matDarkSteel);
  cL.position.set(-0.25, 0.15, 0);
  cL.rotation.z = Math.PI / 6;
  const cR = new THREE.Mesh(cylGeo, matDarkSteel);
  cR.position.set(0.25, 0.15, 0);
  cR.rotation.z = -Math.PI / 6;
  group.add(cL, cR);

  // Chrome Piston Shafts
  const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
  const sL = new THREE.Mesh(shaftGeo, matChrome);
  sL.position.set(-0.35, -0.08, 0);
  sL.rotation.z = Math.PI / 6;
  const sR = new THREE.Mesh(shaftGeo, matChrome);
  sR.position.set(0.35, -0.08, 0);
  sR.rotation.z = -Math.PI / 6;
  group.add(sL, sR);

  // Left Claw Assembly (3 curved tines)
  const clawL = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.09, 8, 16, Math.PI * 0.7), matDarkSteel);
  clawL.position.set(-0.15, -0.22, 0);
  clawL.rotation.z = Math.PI * 0.95;
  group.add(clawL);

  // Right Claw Assembly (Opposing tines)
  const clawR = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.09, 8, 16, Math.PI * 0.7), matDarkSteel);
  clawR.position.set(0.15, -0.22, 0);
  clawR.rotation.z = -Math.PI * 0.25;
  clawR.scale.x = -1;
  group.add(clawR);

  return group;
}

// Procedural 3D Scissor Lift
function buildScissorLift() {
  const group = new THREE.Group();

  // Wheeled Base Chassis
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 1.25), matDarkGreen);
  base.position.set(0, -0.45, 0);
  group.add(base);

  // 4 Outrigger Pads & Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.12, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  const w1 = new THREE.Mesh(wheelGeo, matRubber);
  w1.position.set(-0.52, -0.48, 0.45);
  const w2 = new THREE.Mesh(wheelGeo, matRubber);
  w2.position.set(0.52, -0.48, 0.45);
  const w3 = new THREE.Mesh(wheelGeo, matRubber);
  w3.position.set(-0.52, -0.48, -0.45);
  const w4 = new THREE.Mesh(wheelGeo, matRubber);
  w4.position.set(0.52, -0.48, -0.45);
  group.add(w1, w2, w3, w4);

  // Scissor Linkages (Criss-Cross X Arms)
  const armGeo = new THREE.BoxGeometry(0.05, 0.65, 0.07);
  // Tier 1
  const arm1a = new THREE.Mesh(armGeo, matWarningYellow);
  arm1a.position.set(-0.35, -0.15, 0);
  arm1a.rotation.x = Math.PI / 4;
  const arm1b = new THREE.Mesh(armGeo, matWarningYellow);
  arm1b.position.set(-0.35, -0.15, 0);
  arm1b.rotation.x = -Math.PI / 4;

  const arm2a = new THREE.Mesh(armGeo, matWarningYellow);
  arm2a.position.set(0.35, -0.15, 0);
  arm2a.rotation.x = Math.PI / 4;
  const arm2b = new THREE.Mesh(armGeo, matWarningYellow);
  arm2b.position.set(0.35, -0.15, 0);
  arm2b.rotation.x = -Math.PI / 4;
  group.add(arm1a, arm1b, arm2a, arm2b);

  // Center Hydraulic Ram Cylinder
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8), matChrome);
  cyl.position.set(0, -0.15, 0);
  cyl.rotation.x = Math.PI / 5;
  group.add(cyl);

  // Top Working Platform
  const platform = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 1.25), matDarkSteel);
  platform.position.set(0, 0.2, 0);
  group.add(platform);

  // Safety Perimeter Railing
  const railGeo = new THREE.BoxGeometry(0.93, 0.25, 1.23);
  const wireframe = new THREE.WireframeGeometry(railGeo);
  const railLines = new THREE.LineSegments(wireframe);
  railLines.material.color.setHex(0xFF9900);
  railLines.position.set(0, 0.35, 0);
  group.add(railLines);

  return group;
}

export default function ProductCard3DViewer({ product, isHovered = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId;
    let isDisposed = false;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 260;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(1.8, 1.2, 2.4);
    camera.lookAt(0, 0.05, 0);

    // 3. Renderer with high performance & transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xFFF8E7, 2.6);
    keyLight.position.set(4, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xE0F2FE, 1.2);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xFF9900, 1.8);
    rimLight.position.set(0, -3, -4);
    scene.add(rimLight);

    // 5. Contact Soft Shadow Disk on Floor
    const shadowGeo = new THREE.CircleGeometry(0.75, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18
    });
    const shadowDisk = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisk.position.y = -0.65;
    scene.add(shadowDisk);

    // 6. Master Hovering Group
    const hoverGroup = new THREE.Group();
    scene.add(hoverGroup);

    // 7. Load GLB Model OR Build Procedural Model
    const cat = (product.category || '').toLowerCase();
    const title = (product.title || '').toLowerCase();

    if (title.includes('breaker') || cat.includes('breaker')) {
      // Load Official GLTF Hydraulic Breaker Model
      MeshoptDecoder.ready.then(() => {
        if (isDisposed) return;
        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        loader.load(
          getAssetUrl('/assets/tripo_pbr_model_4be6fa61-73bb-4da0-b263-fd93bf51e0cc_meshopt.glb'),
          (gltf) => {
            if (isDisposed) return;
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const sphere = box.getBoundingSphere(new THREE.Sphere());
            const scale = 0.95 / (sphere.radius || 1);
            model.scale.setScalar(scale);
            model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
            hoverGroup.add(model);
          },
          undefined,
          () => {
            // Fallback to Chisel/Breaker model
            const fallback = buildExcavator();
            fallback.scale.setScalar(0.75);
            hoverGroup.add(fallback);
          }
        );
      });
    } else if (title.includes('forklift') || cat.includes('forklift')) {
      const model = buildForklift();
      model.scale.setScalar(0.85);
      hoverGroup.add(model);
    } else if (title.includes('compactor') || cat.includes('compaction')) {
      const model = buildCompactor();
      model.scale.setScalar(0.85);
      hoverGroup.add(model);
    } else if (title.includes('grapple') || cat.includes('attachment')) {
      const model = buildGrapple();
      model.scale.setScalar(0.9);
      hoverGroup.add(model);
    } else if (title.includes('scissor') || cat.includes('scissor')) {
      const model = buildScissorLift();
      model.scale.setScalar(0.85);
      hoverGroup.add(model);
    } else {
      // Excavator or general heavy machinery
      const model = buildExcavator();
      model.scale.setScalar(0.8);
      hoverGroup.add(model);
    }

    // 8. Mouse Interaction (Pointer drag to rotate in 3D)
    let isDragging = false;
    let prevPointerX = 0;
    let manualRotY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      prevPointerX = e.clientX;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevPointerX;
      prevPointerX = e.clientX;
      manualRotY += deltaX * 0.015;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 9. Animation Loop with Real 3D Hover (Levitation Physics)
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // PHYSICAL 3D HOVER (Levitating up and down smoothly)
      const hoverY = Math.sin(elapsedTime * 2.2) * 0.07;
      hoverGroup.position.y = hoverY;

      // Gentle continuous rotation + manual drag
      hoverGroup.rotation.y = elapsedTime * 0.4 + manualRotY;

      // Subtle aerodynamic tilt
      hoverGroup.rotation.z = Math.sin(elapsedTime * 1.6) * 0.03;
      hoverGroup.rotation.x = Math.sin(elapsedTime * 1.8) * 0.02;

      // Contact shadow breathes with hover height
      const shadowScale = 1.0 - hoverY * 1.4;
      shadowDisk.scale.set(shadowScale, shadowScale, shadowScale);
      shadowMat.opacity = Math.max(0.1, 0.22 - hoverY * 0.8);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      hoverGroup.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
        }
      });
      shadowGeo.dispose();
      shadowMat.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [product]);

  return (
    <div 
      ref={mountRef} 
      className="disd-card-3d-canvas"
      title="3D Model Hovering - Click & Drag to Orbit"
    />
  );
}
