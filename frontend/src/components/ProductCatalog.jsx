import React, { useState, useEffect } from 'react';
import { initialProducts, equipmentCategories } from '../data/productsData.js';
import ProductDetailModal from './ProductDetailModal.jsx';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';
import { getAssetUrl } from '../data/cloudinaryAssets.js';

export default function ProductCatalog({ selectedCategory: propCategory, onSelectForQuote }) {
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(propCategory || 'All');
  const [activeModalProduct, setActiveModalProduct] = useState(null);

  useEffect(() => {
    if (propCategory) {
      setSelectedCategory(propCategory);
    }
  }, [propCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const query = selectedCategory !== 'All' ? `?category=${encodeURIComponent(selectedCategory)}` : '';
        const res = await fetch(`/api/products${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.length > 0) {
            setProducts(data.data);
          }
        }
      } catch (err) {
        console.log('Using initial products data:', err.message);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

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
        <ScrollReveal animation="fade-up" delay={80}>
          <div className="disd-filter-tabs">
            {equipmentCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`disd-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Products Grid */}
        <ScrollReveal animation="fade-up" stagger={true} delay={120}>
          <div className="disd-products-grid">
            {filteredProducts.map((prod) => {
              const cardId = prod.id || prod.slug;

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
                  >
                    <span>Spec Sheet</span>
                    <ArrowUpRight size={14} />
                  </button>

                  <button
                    onClick={() => onSelectForQuote(prod)}
                    className="disd-btn-quote"
                  >
                    <span>Get Quote</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
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
