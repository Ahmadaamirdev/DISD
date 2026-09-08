import React from 'react';
import { ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';
import { getAssetUrl } from '../data/cloudinaryAssets';

export default function StatsTicker({ onSelectCategory }) {
  const categories = [
    {
      title: "Hydraulic Breaker",
      category: "Hydraulic Breaker",
      description: "Maximum impact. Minimum downtime.",
      image: getAssetUrl("/assets/01.png")
    },
    {
      title: "Forklift",
      category: "Forklift",
      description: "Safe, strong and reliable material handling.",
      image: getAssetUrl("/assets/02.png")
    },
    {
      title: "Compaction Equipment",
      category: "Compaction Equipment",
      description: "For a smoother, stronger foundation.",
      image: getAssetUrl("/assets/03.png")
    },
    {
      title: "Excavator",
      category: "Excavator",
      description: "Power and precision in every move.",
      image: getAssetUrl("/assets/04.png")
    },
    {
      title: "Other Equipment",
      category: "Attachments",
      description: "Wide range of attachments and accessories.",
      image: getAssetUrl("/assets/E-IMG_A.jpg")
    }
  ];

  const handleCardClick = (category) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
  };

  return (
    <section id="company-profile" className="disd-our-products-section">
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
            {categories.map((item, idx) => (
              <div
                key={idx}
                className="disd-cat-five-card"
                onClick={() => handleCardClick(item.category)}
              >
                {/* Card Image Container */}
                <div className="disd-cat-five-img-wrap">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="disd-cat-five-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Card Body */}
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
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
