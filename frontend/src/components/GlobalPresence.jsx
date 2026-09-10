import React from 'react';
import { ArrowRight, Hammer, Globe, Handshake } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';
import { getAssetUrl } from '../data/cloudinaryAssets';

export default function GlobalPresence() {
  const exploreCards = [
    {
      image: getAssetUrl("/assets/E-IMG_A.jpg"),
      icon: <Hammer size={18} />,
      title: "Products",
      description: "Explore our comprehensive range of hydraulic breakers, rough-terrain forklifts, excavators, and precision demolition tools.",
      link: "#products"
    },
    {
      image: getAssetUrl("/assets/E-IMG_B.jpg"),
      icon: <Globe size={18} />,
      title: "Where to Buy",
      description: "Locate authorized distributors, spare parts dealers, and global logistics corridors across Saudi Arabia and worldwide.",
      link: "#where-to-buy"
    },
    {
      image: getAssetUrl("/assets/LX.jpg"),
      icon: <Handshake size={18} />,
      title: "Contact Us",
      description: "Consult directly with our Jeddah regional headquarters engineers to configure attachments tailored to your project rock formations.",
      link: "#quote-estimator"
    }
  ];

  return (
    <section id="where-to-buy" className="disd-section" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
      <div className="disd-container">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="disd-section-header">
            <span className="disd-overline">
              Global Reach &amp; Distribution
            </span>
            <h2 className="disd-title">
              Explore More <span className="disd-title-logo-color">DISD Heavy Machinery</span>
            </h2>
            <p className="disd-subtitle">
              It has now developed into a cross domain enterprise that integrates production, sales, and global technical service.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Exploration Cards */}
        <ScrollReveal animation="fade-up" stagger={true} delay={120}>
          <div className="disd-explore-grid">
            {exploreCards.map((item, idx) => (
              <div key={idx} className="disd-explore-card">
                <div className="disd-explore-img-wrap">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="disd-explore-img"
                    loading="lazy"
                    decoding="async"
                    width="380"
                    height="220"
                  />
                </div>

                <div className="disd-explore-body">
                  <div>
                    <h3 className="disd-explore-title">
                      <span className="disd-explore-icon-box">
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </h3>
                    <p className="disd-explore-desc">
                      {item.description}
                    </p>
                  </div>

                  <div>
                    <a href={item.link} className="disd-explore-btn">
                      <span>View More</span>
                      <ArrowRight size={14} className="disd-explore-arrow" />
                    </a>
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
