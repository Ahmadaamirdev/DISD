# Dragon International Services & Development LLC (DISD)
## Enterprise Pitch Redesign Landing Page (React + Vite + Node.js + Tailwind CSS)

A modern, high-conversion industrial landing platform redesigned for **Dragon International Services and Development LLC (DISD)** to win client pitches.

---

### Clean & Professional Folder Structure

```
DISD/
├── frontend/                   # React 18 + Vite + Tailwind CSS Frontend
│   ├── public/
│   │   ├── assets/             # Authentic brand logos, photos, and certificates
│   │   └── videos/             # hero_video.mp4 (Heavy hydraulic chisel demo)
│   ├── src/
│   │   ├── components/         # Modular React components
│   │   │   ├── Navbar.jsx              # Sticky frosted header with hotline and RFQ trigger
│   │   │   ├── Hero.jsx                # Cinematic video hero with live telemetry HUD
│   │   │   ├── StatsTicker.jsx         # 6S Lean, Komatsu KES, CE/ISO certifications
│   │   │   ├── ProductCatalog.jsx      # Filterable equipment grid (Breakers, Excavators, etc.)
│   │   │   ├── ProductDetailModal.jsx  # Technical spec modal with full engineering tolerances
│   │   │   ├── EngineeringAdvantage.jsx# 3 Core pillars + national TV media benchmarks
│   │   │   ├── VideoShowcase.jsx       # Field test cinema frame with playback controls
│   │   │   ├── QuoteEstimator.jsx      # Direct factory RFQ generator connected to Express
│   │   │   ├── GlobalPresence.jsx      # Jeddah Regional HQ, contact depot & export cards
│   │   │   ├── SectionDivider.jsx      # SVG angular & wave dividers with glowing edges
│   │   │   └── Footer.jsx              # Authentic branding, Jeddah address & product links
│   │   ├── styles/             # Tailwind CSS & design system tokens
│   │   ├── data/               # Product catalog specifications & fallbacks
│   │   ├── App.jsx             # Main application layout with section dividers
│   │   └── main.jsx            # React root entrypoint
│   ├── index.html              # HTML shell with Google Fonts & SEO metadata
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite config with @tailwindcss/vite & API proxy
│
├── backend/                    # Node.js + Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection with resilient in-memory demo fallback
│   ├── controllers/
│   │   ├── productController.js# Equipment catalog and spec search controller
│   │   └── inquiryController.js# RFQ quote submission controller with reference numbering
│   ├── models/
│   │   ├── Product.js          # Product Mongoose schema
│   │   └── Inquiry.js          # RFQ Inquiry Mongoose schema
│   ├── routes/
│   │   ├── productRoutes.js    # /api/products endpoints
│   │   ├── inquiryRoutes.js    # /api/inquiries endpoints
│   │   └── healthRoutes.js     # /api/health endpoint
│   ├── middleware/
│   │   └── errorHandler.js     # Centralized error handling
│   ├── server.js               # Express server listener
│   └── package.json            # Backend dependencies
│
├── package.json                # Root concurrently development runner
└── README.md                   # Project documentation
```

---

### Key Features
- **Authentic Brand Theme**:
  - Deep Petroleum Teal (`#004444`, `#003838`)
  - High-Visibility Safety Amber / Gold (`#FF9900` / `#F90`)
  - Precision Engineering Blue (`#005AB5`)
  - Authentic logos (`logo.png`, `foot_logo.png`)
  - Authentic Jeddah Regional HQ details (+966-543732208, Al Jawharah, Jazan Road)
- **Cinematic Video Hero**:
  - Direct integration of `the_chisel_should_also_explode_gwr_video_mvp.mp4` as `hero_video.mp4` with audio/video controls
  - Real-time engineering telemetry HUD (Operating Pressure, Impact Frequency, Chisel Metallurgy, Carrier Rating)
- **Tailwind CSS & Decent Animations**:
  - Clean styling with modern Tailwind CSS utilities and custom SVG section dividers
  - No AI-chopped artifacts or sloppy placeholders
- **Resilient Full-Stack RFQ Inquiries**:
  - Users can configure machinery and request instant quotes
  - Automatic fallback mode ensures presentation pitches work even without an active local MongoDB instance

---

### Quick Start Commands

From the project root (`c:\Users\user\DISD`):

1. **Install All Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start Dev Servers (Both Frontend & Backend)**:
   ```bash
   npm run dev
   ```

3. **Access URLs**:
   - **Frontend App**: [http://localhost:5173/](http://localhost:5173/)
   - **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - **Products API**: [http://localhost:5000/api/products](http://localhost:5000/api/products)
