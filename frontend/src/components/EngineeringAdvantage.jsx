import React, { useEffect, useRef } from 'react';
import { Users, Settings, ShieldCheck, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';
import { getAssetUrl } from '../data/cloudinaryAssets';

export default function EngineeringAdvantage() {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElem = videoRef.current;
    if (!videoElem) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoElem.play().catch(() => {});
        } else {
          videoElem.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(videoElem);
    return () => observer.disconnect();
  }, []);

  const pillars = [
    {
      icon: <Users size={26} />,
      title: "Professional Team",
      description: "Our team brings years of experience in the heavy equipment industry, ensuring professional guidance and responsive support at every step.",
      link: "#company-profile"
    },
    {
      icon: <Settings size={26} />,
      title: "Exquisite Craftsmanship",
      description: "We work with world-leading manufacturers and follow strict quality control processes to ensure every machine meets the highest standards of performance and durability.",
      link: "#products"
    },
    {
      icon: <ShieldCheck size={26} />,
      title: "Reputation Throughout the World",
      description: "Our products and services are trusted in many countries, supported by long-term partnerships and a strong global network of clients and contractors.",
      link: "#where-to-buy"
    }
  ];

  return (
    <section id="applications" className="disd-why-us-section">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="disd-why-us-bg-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={getAssetUrl('chisel_explode_video.mp4')} type="video/mp4" />
        <source src={getAssetUrl('hero_video.mp4')} type="video/mp4" />
      </video>

      <div className="disd-container" style={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="disd-why-us-header">
            <div className="disd-why-us-kicker">
              WHY CHOOSE DISD
            </div>
            <h2 className="disd-why-us-title">
              Global Expertise.<br />
              <span className="disd-title-logo-color">Local Commitment.</span>
            </h2>
            <p className="disd-why-us-subtitle">
              We combine international standards with deep regional understanding to deliver reliable equipment, expert support and long-term value for your business.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Value Cards */}
        <ScrollReveal animation="fade-up" stagger={true} delay={120}>
          <div className="disd-why-us-grid">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="disd-why-us-card">
                <div>
                  <div className="disd-why-us-icon-box">
                    {pillar.icon}
                  </div>

                  <h3 className="disd-why-us-card-title">{pillar.title}</h3>
                  <p className="disd-why-us-card-desc">{pillar.description}</p>
                </div>

                <a href={pillar.link} className="disd-why-us-card-link">
                  <span>Learn More</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
