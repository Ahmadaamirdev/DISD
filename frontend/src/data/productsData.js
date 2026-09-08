import { getAssetUrl } from './cloudinaryAssets';

export const initialProducts = [
  {
    id: "prod-1",
    title: "Triangular Hydraulic Breaker (Heavy Series)",
    slug: "triangular-hydraulic-breaker",
    category: "Hydraulic Breaker",
    modelNumber: "DISD-TB210",
    image: getAssetUrl("/assets/2025620852505638.jpg"),
    thumbnail: getAssetUrl("/assets/01.png"),
    description: "Engineered under Japanese Komatsu KES standards with high-alloy forged steel chisel. Delivers maximum impact energy with low hydraulic recoil for quarrying, tunneling, and reinforced concrete demolition.",
    specifications: {
      operatingWeight: "1,850 kg - 3,200 kg",
      applicableExcavator: "20 - 32 Ton",
      operatingPressure: "160 - 180 bar",
      oilFlowRate: "150 - 190 L/min",
      impactRate: "350 - 650 bpm",
      chiselDiameter: "140 mm",
      standardWarranty: "24 Months Structural / 12 Months Core Hydraulic",
      manufacturingStandard: "6S Lean / Japan Komatsu KES / CE & ISO Certified"
    },
    features: [
      "Anti-blank firing auto-cushion system to prevent internal piston damage",
      "Optimized nitrogen gas chamber providing 25% higher kinetic impact power",
      "Hardox 500 wear-resistant side plates engineered for extreme desert quarries",
      "Universal hydraulic plumbing compatible with CAT, Komatsu, Volvo, and Hyundai"
    ],
    applications: ["Quarry Mining", "Highway Trenching", "Reinforced Concrete Demolition", "Rock Excavation"],
    featured: true
  },
  {
    id: "prod-2",
    title: "Heavy-Duty All-Terrain Forklift",
    slug: "all-terrain-forklift",
    category: "Forklift",
    modelNumber: "DISD-FL500-4WD",
    image: getAssetUrl("/assets/2025572057496639.jpg"),
    thumbnail: getAssetUrl("/assets/02.png"),
    description: "Four-wheel-drive rough terrain forklift engineered for harsh construction sites, desert logistics, and uneven industrial yards with high ground clearance and reinforced mast.",
    specifications: {
      operatingWeight: "6,800 kg",
      applicableExcavator: "Self-Propelled 4WD Heavy Carrier",
      operatingPressure: "210 bar",
      oilFlowRate: "85 L/min",
      impactRate: "Lift Capacity: 5.0 Metric Tons",
      chiselDiameter: "Lift Height: 4,500 mm",
      standardWarranty: "18 Months / 2,000 Operating Hours",
      manufacturingStandard: "ISO 9001 / CE Certified / 6S Lean"
    },
    features: [
      "Electronic differential lock for sandy desert and mud traction",
      "Panoramic ROPS/FOPS certified operator safety cabin with climate control",
      "Heavy-duty deep-lug off-road industrial tires",
      "Integrated hydraulic fork side-shifter and tilt mast"
    ],
    applications: ["Desert Logistics", "Construction Yard Handling", "Quarry Supply Transport", "Port Logistics"],
    featured: true
  },
  {
    id: "prod-3",
    title: "High-Frequency Vibrating Compactor",
    slug: "vibrating-compactor",
    category: "Compaction Equipment",
    modelNumber: "DISD-VC80",
    image: getAssetUrl("/assets/2025571908367950.jpg"),
    thumbnail: getAssetUrl("/assets/03.png"),
    description: "Excavator-mounted vibrating compactor plate built for trench backfill, embankment consolidation, and roadbed preparation with vibration dampening technology.",
    specifications: {
      operatingWeight: "920 kg",
      applicableExcavator: "12 - 20 Ton",
      operatingPressure: "140 - 160 bar",
      oilFlowRate: "80 - 110 L/min",
      impactRate: "2,000 - 2,400 vpm",
      chiselDiameter: "Plate Dimensions: 1,100 x 800 mm",
      standardWarranty: "12 Months Comprehensive",
      manufacturingStandard: "Japan Komatsu KES Standard"
    },
    features: [
      "High-grade Swedish rubber shock absorbers isolate vibration from excavator boom",
      "Dual eccentric counter-rotating shafts deliver deep uniform compaction",
      "Heavy-duty continuous hydraulic drive motor with pressure relief",
      "Universal quick-coupler adapter bracket"
    ],
    applications: ["Pipe Trench Backfill", "Road Foundation Compaction", "Slope Stabilization", "Railway Bedding"],
    featured: true
  },
  {
    id: "prod-4",
    title: "Heavy Crawler Hydraulic Excavator",
    slug: "crawler-hydraulic-excavator",
    category: "Excavator",
    modelNumber: "DISD-EX360HD",
    image: getAssetUrl("/assets/2025572005225896.jpg"),
    thumbnail: getAssetUrl("/assets/04.png"),
    description: "High-efficiency 36-ton class hydraulic crawler excavator tailored for Middle Eastern high-temperature environments with tropicalized cooling radiators and heavy rock boom.",
    specifications: {
      operatingWeight: "35,800 kg",
      applicableExcavator: "Primary Heavy Earthmover",
      operatingPressure: "343 bar",
      oilFlowRate: "2 x 290 L/min",
      impactRate: "Bucket Digging Force: 235 kN",
      chiselDiameter: "Bucket Capacity: 1.8 - 2.2 m³",
      standardWarranty: "24 Months / 3,000 Operating Hours",
      manufacturingStandard: "6S Lean / ISO 14001 / CE Certified"
    },
    features: [
      "Tropicalized cooling radiator engineered for 55°C ambient desert heat",
      "Positive flow hydraulic management for instant boom responsiveness",
      "Reinforced heavy-duty X-frame undercarriage and forged track links",
      "Pre-installed auxiliary dual hydraulic lines for immediate breaker integration"
    ],
    applications: ["Open Pit Mining", "Mass Earthmoving", "Infrastructure Construction", "Quarry Trenching"],
    featured: true
  },
  {
    id: "prod-5",
    title: "Industrial Hydraulic Wood & Stone Grapple",
    slug: "hydraulic-grapple",
    category: "Attachments",
    modelNumber: "DISD-WG360",
    image: getAssetUrl("/assets/2025571927321350.jpg"),
    thumbnail: getAssetUrl("/assets/01.png"),
    description: "360-degree continuous rotation hydraulic grapple featuring dual cylinders with integrated counter-balance valves for rock handling, timber handling, and scrap demolition.",
    specifications: {
      operatingWeight: "1,450 kg",
      applicableExcavator: "18 - 26 Ton",
      operatingPressure: "180 - 210 bar",
      oilFlowRate: "100 - 130 L/min",
      impactRate: "Clamping Force: 115 kN",
      chiselDiameter: "Max Jaw Opening: 1,950 mm",
      standardWarranty: "12 Months Mechanical / Hydraulic",
      manufacturingStandard: "6S Lean / Komatsu KES Compatible"
    },
    features: [
      "Hardox 500 reinforced tine tips for maximum abrasion resistance",
      "Heavy-duty slewing bearing with sealed planetary reduction drive",
      "Enclosed dual hydraulic cylinders to prevent rock impact damage",
      "Integrated bi-directional pressure safety relief valves"
    ],
    applications: ["Riprap Rock Placement", "Scrap Demolition Sorting", "Forestry Handling", "Quarry Sorting"],
    featured: false
  },
  {
    id: "prod-6",
    title: "Rough-Terrain Scissor Lift & Lifting Slings",
    slug: "lifting-slings-scissor-lift",
    category: "Scissor Lift",
    modelNumber: "DISD-SL1400",
    image: getAssetUrl("/assets/2025572138453362.jpg"),
    thumbnail: getAssetUrl("/assets/02.png"),
    description: "High-reach aerial work platform and certified lifting equipment engineered for refinery maintenance, steel structure erection, and industrial plant servicing.",
    specifications: {
      operatingWeight: "4,200 kg",
      applicableExcavator: "Independent Mobile Aerial Platform",
      operatingPressure: "175 bar",
      oilFlowRate: "45 L/min",
      impactRate: "Working Height: Up to 16 Meters",
      chiselDiameter: "Platform Safe Load: 450 kg",
      standardWarranty: "18 Months Structural & Electrical",
      manufacturingStandard: "EN280 / CE / ISO 9001"
    },
    features: [
      "Automatic pothole protection and dynamic slope tilt alarm",
      "High ground clearance with 4 self-leveling hydraulic outriggers",
      "Heavy-duty certified lifting eyelets and forged rigging slings",
      "Auxiliary manual emergency platform lowering control valve"
    ],
    applications: ["Refinery Maintenance", "Commercial Facade Installation", "Industrial Warehousing", "Shipyard Servicing"],
    featured: false
  }
];

export const equipmentCategories = [
  "All",
  "Hydraulic Breaker",
  "Compaction Equipment",
  "Excavator",
  "Forklift",
  "Attachments",
  "Scissor Lift"
];
