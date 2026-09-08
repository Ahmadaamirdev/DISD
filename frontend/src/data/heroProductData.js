/**
 * Centralized Product Configuration & Specification Data for 3D Hero and Detail Section.
 * 
 * Reusable data structure allowing any product model to be configured with:
 * - Product identity (category, name, model, background atmospheric words)
 * - Physical 3D specifications with local coordinate anchors on the GLB model
 * - Engineering detail section headlines, editorial narrative, and technical features
 */

import { getAssetUrl } from './cloudinaryAssets';

export const heroProducts = {
  breaker: {
    id: 'breaker',
    switcherLabel: 'Hydraulic Breaker',
    buttonPrompt: 'FORKLIFT',
    modelPath: getAssetUrl('/assets/tripo_pbr_model_4be6fa61-73bb-4da0-b263-fd93bf51e0cc_meshopt.glb'),
    targetDim: 2.65,
    cameraLookAtYRatio: 0.92,
    product: {
      category: 'DRAGON INTERNATIONAL SERVICES & DEVELOPMENT',
      name: 'HEAVY-DUTY HYDRAULIC BREAKER',
      model: 'SERIES 4BE • KOMATSU KES INDUSTRIAL STANDARD',
      backgroundWord: 'IMPACT',
      detailBackgroundWord: 'ENGINEERED',
      detail: {
        sectionNumber: '01 / PERFORMANCE',
        headline: 'ENGINEERED TO PERFORM.',
        lead: 'Built for demanding applications where power, reliability and control matter. Manufactured under strict Japanese Komatsu KES standards with high-alloy forged steel components.',
        badge: 'JAPAN KES INDUSTRIAL STANDARD // SERIES 4BE',
      },
    },
    specifications: [
      {
        id: 'weight',
        number: '01',
        label: 'OPERATING WEIGHT',
        value: '1,850',
        unit: 'KG',
        description: 'Applicable Carrier 20 – 32 Ton',
        side: 'left',
        order: 1,
        anchor: { x: -0.16, y: 0.18, z: 0.12 },
      },
      {
        id: 'flow',
        number: '02',
        label: 'OIL FLOW RATE',
        value: '150 – 190',
        unit: 'L/MIN',
        description: 'Dual Return Relief Valve System',
        side: 'left',
        order: 2,
        anchor: { x: -0.14, y: -0.04, z: 0.14 },
      },
      {
        id: 'pressure',
        number: '03',
        label: 'OPERATING PRESSURE',
        value: '160 – 180',
        unit: 'BAR',
        description: 'Nitrogen Charged Power Cell',
        side: 'right',
        order: 3,
        anchor: { x: 0.15, y: 0.12, z: -0.04 },
      },
      {
        id: 'chisel',
        number: '04',
        label: 'CHISEL DIAMETER',
        value: '140',
        unit: 'MM',
        description: 'High-Alloy Forged Chisel Core',
        side: 'right',
        order: 4,
        anchor: { x: 0.12, y: -0.26, z: 0.08 },
      },
    ],
    engineeringFeatures: [
      {
        id: 'housing',
        number: '01',
        title: 'HEAVY-DUTY FORGED HOUSING',
        description: 'Wear-resistant Hardox 500 side plates engineered for extreme quarrying, trenching, and reinforced concrete demolition without structural fatigue.',
        spec: 'HARDOX 500 ALLOY',
      },
      {
        id: 'valve',
        number: '02',
        title: 'PRECISION HYDRAULIC VALVE',
        description: 'Integrated anti-blank firing cushion system protects internal piston and cylinder, paired with dual-return relief to eliminate destructive recoil shock.',
        spec: 'AUTO-CUSHION VALVE',
      },
      {
        id: 'accumulator',
        number: '03',
        title: 'NITROGEN POWER ACCUMULATOR',
        description: 'High-capacity pressurized N2 cell provides 25% higher kinetic impact energy while smoothing hydraulic pulsation across the excavator arm.',
        spec: 'N2 CHARGED CELL',
      },
      {
        id: 'chisel',
        number: '04',
        title: 'KOMATSU KES CHISEL CORE',
        description: '140mm high-alloy forged tool steel hardened through multi-stage heat treatment for maximum rock penetration and long chisel lifespan.',
        spec: '140MM FORGED CORE',
      },
    ],
  },
  forklift: {
    id: 'forklift',
    switcherLabel: 'Electric Forklift',
    buttonPrompt: 'BREAKER',
    modelPath: getAssetUrl('/assets/tripo_pbr_model_ee9cdc69-76a0-42b8-8eea-c47ed3342c9a_meshopt.glb'),
    targetDim: 2.50,
    cameraLookAtYRatio: 0.88,
    product: {
      category: 'DRAGON INTERNATIONAL SERVICES & DEVELOPMENT',
      name: 'DISD LITHIUM ELECTRIC FORKLIFT',
      model: 'SERIES E-PRO • 80V LITHIUM-ION ZERO EMISSION',
      backgroundWord: 'ELECTRIC',
      detailBackgroundWord: 'INNOVATION',
      detail: {
        sectionNumber: '01 / EFFICIENCY',
        headline: 'ZERO EMISSIONS. MAXIMUM POWER.',
        lead: 'Equipped with rapid-charge lithium iron phosphate battery architecture, high-torque dual AC traction motors, and ergonomic full-suspension operator comfort.',
        badge: 'DISD 80V LITHIUM ARCHITECTURE // SERIES E-PRO',
      },
    },
    specifications: [
      {
        id: 'capacity',
        number: '01',
        label: 'RATED CAPACITY',
        value: '3,000',
        unit: 'KG',
        description: '3.0 – 3.5 Ton Industrial Payload',
        side: 'left',
        order: 1,
        anchor: { x: -0.06, y: -0.20, z: 0.10 }, // Front lifting carriage at chassis body base
      },
      {
        id: 'height',
        number: '02',
        label: 'MAX LIFT HEIGHT',
        value: '4,500',
        unit: 'MM',
        description: 'Triplex Full Free-Lift Mast',
        side: 'left',
        order: 2,
        anchor: { x: -0.04, y: 0.07, z: 0.02 }, // Upper left chassis body / mast mount
      },
      {
        id: 'voltage',
        number: '03',
        label: 'LITHIUM VOLTAGE',
        value: '80',
        unit: 'V',
        description: 'High-Density Fast-Charge Li-Ion',
        side: 'right',
        order: 3,
        anchor: { x: 0.14, y: 0.02, z: -0.06 }, // Mid chassis lithium battery bay
      },
      {
        id: 'speed',
        number: '04',
        label: 'TRAVEL SPEED',
        value: '18',
        unit: 'KM/H',
        description: 'Dual AC High-Torque Drive Motors',
        side: 'right',
        order: 4,
        anchor: { x: 0.16, y: -0.28, z: -0.22 }, // Lower drive wheel / axle
      },
    ],
    engineeringFeatures: [
      {
        id: 'battery',
        number: '01',
        title: '80V LITHIUM-ION POWER CELL',
        description: 'High-density LiFePO4 battery pack providing 2-hour opportunity fast charging, 4,000+ lifecycle durability, and zero toxic emissions.',
        spec: '80V LIFEPO4 ARCHITECTURE',
      },
      {
        id: 'drive',
        number: '02',
        title: 'DUAL AC TRACTION MOTORS',
        description: 'Independent dual front drive motors delivering regenerative braking, smooth ramp holding, and precise tight-radius maneuverability.',
        spec: 'DUAL AC MOTORS',
      },
      {
        id: 'mast',
        number: '03',
        title: 'WIDE-VIEW PANORAMIC MAST',
        description: 'High-rigidity cold-drawn channel steel mast with nested hydraulic hose routing for unobstructed forward visibility and safety.',
        spec: 'TRIPLEX FULL FREE-LIFT',
      },
      {
        id: 'cabin',
        number: '04',
        title: 'ERGONOMIC COMFORT COCKPIT',
        description: 'Floating operator cabin with multi-function color display, fingertip proportional hydraulic joysticks, and Grammer suspension seat.',
        spec: 'OPS SUSPENSION COCKPIT',
      },
    ],
  },
};

// Default export for backward compatibility
export const heroProductConfig = heroProducts.breaker;
