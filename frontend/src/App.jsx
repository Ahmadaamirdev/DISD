import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import StatsTicker from './components/StatsTicker.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import EngineeringAdvantage from './components/EngineeringAdvantage.jsx';
import GlobalPresence from './components/GlobalPresence.jsx';
import QuoteEstimator from './components/QuoteEstimator.jsx';
import Footer from './components/Footer.jsx';
import SectionDivider from './components/SectionDivider.jsx';
import SitePreloader from './components/SitePreloader.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#FF8A1A', background: '#211F1C', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Website Runtime Error</h2>
          <pre style={{ background: '#181714', padding: 20, borderRadius: 8, color: '#f87171' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: 20, padding: '10px 20px', background: '#FF8A1A', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quoteTargetProduct, setQuoteTargetProduct] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);
  const [isSiteReady, setIsSiteReady] = useState(false);

  const handleModelLoaded = () => {
    setIsModelLoaded(true);
  };

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  const handleSelectProductForQuote = (product) => {
    setQuoteTargetProduct(product);
    const quoteElement = document.getElementById('quote-estimator');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenQuoteGeneral = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const quoteElement = document.getElementById('quote-estimator');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryNavClick = (category) => {
    setSelectedCategory(category);
    const prodElement = document.getElementById('products');
    if (prodElement) {
      prodElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ErrorBoundary>
      {/* Cinematic 3-4s Website Loading Animation with DISD Logo */}
      {showPreloader && (
        <SitePreloader 
          isModelLoaded={isModelLoaded}
          onStartExit={() => setIsSiteReady(true)}
          onComplete={handlePreloaderComplete} 
        />
      )}

      <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
        {/* 1. Header / Navigation with Hero Dark Backdrop for Transparent Effect */}
        <div style={{ backgroundColor: '#211F1C', position: 'sticky', top: 0, zIndex: 1000 }}>
          <Navbar 
            onSelectCategory={handleCategoryNavClick}
            onOpenQuoteModal={handleOpenQuoteGeneral}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          {/* 2. Hero Section filled with 3D Studio Model Environment */}
          <Hero 
            onOpenQuoteModal={handleOpenQuoteGeneral} 
            onModelLoaded={handleModelLoaded}
            isSiteReady={isSiteReady}
          />

          {/* Modern Animated Divider */}
          <SectionDivider />

          {/* 3. Company Overview & 5-Category Product Range */}
          <StatsTicker onSelectCategory={handleCategoryNavClick} />

          {/* Modern Animated Divider */}
          <SectionDivider />

          {/* 4. Products Portfolio */}
          <ProductCatalog 
            selectedCategory={selectedCategory}
            onSelectForQuote={handleSelectProductForQuote}
          />

          {/* Modern Animated Divider */}
          <SectionDivider />

          {/* 5. Why Choose DISD */}
          <EngineeringAdvantage />

          {/* Modern Animated Divider */}
          <SectionDivider />

          {/* 6. Explore More DISD Machinery & Global Distribution */}
          <GlobalPresence />

          {/* Modern Animated Divider */}
          <SectionDivider />

          {/* 7. Direct Factory RFQ Quotation Builder */}
          <QuoteEstimator 
            selectedProduct={quoteTargetProduct}
            onClearSelectedProduct={() => setQuoteTargetProduct(null)}
          />
        </main>

        {/* 8. Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}


