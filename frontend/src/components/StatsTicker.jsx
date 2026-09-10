import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';
import CategoryCard3DViewer, { preloadAllCategoryModels, preloadCategoryModel } from './CategoryCard3DViewer.jsx';
import { getAssetUrl } from '../data/cloudinaryAssets';

export default function StatsTicker({ onSelectCategory }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const sectionRef = useRef(null);

  const categories = [
    {
      title: "Hydraulic Breaker",
      category: "Hydraulic Breaker",
      description: "Maximum impact. Minimum downtime.",
      image: getAssetUrl("/assets/01.png"),
      model: getAssetUrl("/assets/tripo_pbr_model_4be6fa61-73bb-4da0-b263-fd93bf51e0cc_meshopt.glb")
    },
    {
      title: "Forklift",
      category: "Forklift",
      description: "Safe, strong and reliable material handling.",
      image: getAssetUrl("/assets/02.png"),
      model: getAssetUrl("/assets/tripo_pbr_model_ee9cdc69-76a0-42b8-8eea-c47ed3342c9a_meshopt.glb")
    },
    {
      title: "Compaction Equipment",
      category: "Compaction Equipment",
      description: "For a smoother, stronger foundation.",
      image: getAssetUrl("/assets/03.png"),
      model: getAssetUrl("/assets/tripo_pbr_model_003af8d7-9e6e-4ee6-a122-b9971804e582_meshopt.glb")
    },
    {
      title: "Excavator",
      category: "Excavator",
      description: "Power and precision in every move.",
      image: getAssetUrl("/assets/04.png"),
      model: getAssetUrl("/assets/tripo_pbr_model_056f077c-e0e5-4fc8-9e06-1e2d0d78fbd2_meshopt.glb")
    },
    {
      title: "Other Equipment",
      category: "Attachments",
      description: "Wide range of attachments and accessories.",
      image: getAssetUrl("/assets/E-IMG_A.jpg"),
      model: getAssetUrl("/assets/tripo_pbr_model_67a24335-d80a-4bef-978a-3c607204e711_meshopt.glb")
    }
  ];

  // Automatic high-performance preloading when section approaches the viewport
  useEffect(() => {
    const modelUrls = categories.map((c) => c.model).filter(Boolean);

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window && sectionRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              preloadAllCategoryModels(modelUrls);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '400px' }
      );

      observer.observe(sectionRef.current);
      return () => observer.disconnect();
    } else {
      preloadAllCategoryModels(modelUrls);
    }
  }, []);

  const handleCardClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  const handleMouseEnterCard = (idx, model) => {
    setHoveredIdx(idx);
    if (model) {
      preloadCategoryModel(model);
    }
  };

  const handleTouchCard = (idx, model) => {
    setHoveredIdx((prev) => (prev === idx ? null : idx));
    if (model) {
      preloadCategoryModel(model);
    }
  };

  return (
    <section id="company-profile" ref={sectionRef} className="disd-our-products-section">
      {/* 1. OUR PRODUCTS: Top Light Section with 5 Cards */}
      <div className="disd-container">
        {/* Two-Column Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="disd-products-header-row">
            <div className="disd-products-header-left">
              <div className="disd-products-kicker">
                OUR PRODUCTS
              </div>
              <h2 className="disd-products-title">
                Reliable Equipment<br />
                <span className="disd-title-logo-color">for Every Project</span>
              </h2>
            </div>
          </div>
        </ScrollReveal>

        {/* 5 Product Category Cards */}
        <ScrollReveal animation="fade-up" stagger={true} delay={120}>
          <div className="disd-products-five-grid">
            {categories.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <div
                  key={idx}
                  className={`disd-cat-five-card ${isHovered ? 'is-flipped' : ''}`}
                  onClick={() => handleCardClick(item.category)}
                  onMouseEnter={() => handleMouseEnterCard(idx, item.model)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onTouchStart={() => handleTouchCard(idx, item.model)}
                >
                  <div className="disd-cat-five-card-inner">
                    {/* FRONT FACE: Clean 2D Product Card */}
                    <div className="disd-cat-five-card-front">
                      <div className="disd-cat-five-img-wrap">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="disd-cat-five-img"
                          loading="eager"
                          decoding="async"
                          fetchPriority={idx < 2 ? 'high' : 'auto'}
                          width="260"
                          height="195"
                        />
                      </div>

                      <div className="disd-cat-five-body">
                        <h3 className="disd-cat-five-title">{item.title}</h3>
                        <p className="disd-cat-five-desc">{item.description}</p>

                        <div className="disd-cat-five-action">
                          <span className="disd-cat-five-learn">Learn More</span>
                          <div className="disd-cat-five-btn-icon">
                            <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BACK / REVERSED FACE: 3D Rotating Model */}
                    <div className="disd-cat-five-card-back">
                      <div className="disd-cat-five-back-header">
                        <h3 className="disd-cat-five-back-title">{item.title}</h3>
                      </div>

                      <div className="disd-cat-five-back-viewer-wrap">
                        {item.model && (
                          <CategoryCard3DViewer
                            modelPath={item.model}
                            isHovered={isHovered}
                            title={item.title}
                            posterImage={item.image}
                          />
                        )}
                      </div>

                      <div className="disd-cat-five-back-action">
                        <div className="disd-cat-five-btn-icon back-active">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
