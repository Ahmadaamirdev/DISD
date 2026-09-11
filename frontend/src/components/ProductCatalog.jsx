import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initialProducts, equipmentCategories } from '../data/productsData.js';
import ProductDetailModal from './ProductDetailModal.jsx';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';
import { getAssetUrl } from '../data/cloudinaryAssets.js';

export default function ProductCatalog({ selectedCategory: propCategory, onSelectForQuote }) {
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(propCategory || 'All');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  // Sync with parent prop if navigation triggers category change
  useEffect(() => {
    if (propCategory && propCategory !== selectedCategory) {
      setSelectedCategory(propCategory);
    }
  }, [propCategory]);

  // Single-flight background pre-fetch: caches all products once on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAllProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.data?.length > 0) {
            setAllProducts(data.data);
          }
        }
      } catch (err) {
        // Fallback gracefully to bundled initialProducts
      }
    };

    fetchAllProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Instantaneous 0ms in-memory filtering
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return allProducts;
    const target = selectedCategory.toLowerCase();
    return allProducts.filter(p => p.category && p.category.toLowerCase() === target);
  }, [allProducts, selectedCategory]);

  const handleCategorySelect = useCallback((cat) => {
    setSelectedCategory(cat);
  }, []);

  return (
    <section id="products" className="disd-section" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
      <div className="disd-container">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="disd-section-header">
            <span className="disd-overline">
              Heavy Equipment Catalog
            </span>
            <h2 className="disd-title">
              Hydraulic Breakers &amp; <span className="disd-title-logo-color">Machinery Portfolio</span>
            </h2>
            <p className="disd-subtitle">
              Manufactured to Japan's Komatsu KES standards and CE/ISO certifications. Delivering maximum kinetic impact with minimum recoil for quarry, tunneling, and civil infrastructure.
            </p>
          </div>
        </ScrollReveal>

        {/* Category Filter Tabs */}
        <ScrollReveal animation="fade-up" delay={60}>
          <div className="disd-filter-tabs">
            {equipmentCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`disd-tab-btn ${isActive ? 'active' : ''}`}
                  type="button"
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Products Grid - Keyed by category for buttery-smooth transition */}
        <div 
          key={selectedCategory}
          className="disd-products-grid disd-products-fade-in"
        >
          {filteredProducts.map((prod, idx) => {
            const cardId = prod.id || prod.slug || idx;
            const isHighPriority = idx < 3;

            return (
              <div 
                key={cardId} 
                className="disd-product-card"
              >
                <div>
                  {/* Photo Viewport */}
                  <div className="disd-prod-img-wrap">
                    <img
                      src={getAssetUrl(prod.image)}
                      alt={prod.title}
                      className="disd-prod-img"
                      loading={isHighPriority ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchpriority={isHighPriority ? 'high' : 'auto'}
                      width="320"
                      height="240"
                    />

                    <span className="disd-model-badge">
                      {prod.modelNumber}
                    </span>
                  </div>

                  {/* Title Strip (#ECECEC) */}
                  <div className="disd-prod-title-bar">
                    <h3 className="disd-prod-title">
                      {prod.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="disd-prod-body">
                    <p className="disd-prod-desc">
                      {prod.description}
                    </p>

                    {/* Specifications Table */}
                    <div className="disd-specs-table">
                      {prod.specifications?.operatingWeight && (
                        <div className="disd-spec-row">
                          <span className="disd-spec-label">Operating Weight:</span>
                          <span className="disd-spec-val">{prod.specifications.operatingWeight}</span>
                        </div>
                      )}
                      {prod.specifications?.operatingPressure && (
                        <div className="disd-spec-row">
                          <span className="disd-spec-label">Pressure:</span>
                          <span className="disd-spec-val">{prod.specifications.operatingPressure}</span>
                        </div>
                      )}
                      {prod.specifications?.chiselDiameter && (
                        <div className="disd-spec-row">
                          <span className="disd-spec-label">Tool / Chisel Dim:</span>
                          <span className="disd-spec-val">{prod.specifications.chiselDiameter}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="disd-prod-actions">
                  <button
                    onClick={() => setActiveModalProduct(prod)}
                    className="disd-btn-sheet"
                    type="button"
                  >
                    <span>Spec Sheet</span>
                    <ArrowUpRight size={14} />
                  </button>

                  <button
                    onClick={() => onSelectForQuote(prod)}
                    className="disd-btn-quote"
                    type="button"
                  >
                    <span>Get Quote</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technical Spec Sheet Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onSelectForQuote={onSelectForQuote}
        />
      )}
    </section>
  );
}
