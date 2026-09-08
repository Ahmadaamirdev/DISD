import React from 'react';
import { MapPin, Phone, Mail, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const productLinks = [
    { label: 'Hydraulic Breaker', href: '#products' },
    { label: 'Hydraulic wood grapple', href: '#products' },
    { label: 'Vibrating compactor', href: '#products' },
    { label: 'Hydraulic pulverizer', href: '#products' },
    { label: 'Hydraulic quick coupler', href: '#products' },
    { label: 'Compaction Equipment', href: '#products' },
    { label: 'Excavator', href: '#products' },
    { label: 'Forklift', href: '#products' },
    { label: 'Scissor Lift', href: '#products' }
  ];

  return (
    <footer className="disd-footer">
      <div className="disd-container">
        <div className="disd-footer-grid">
          {/* Left Column: Brand Logo & Mission */}
          <div>
            <img 
              src="https://res.cloudinary.com/nol4eyyl/image/upload/v1788845149/disd_assets/foot_logo.png" 
              alt="Dragon International Services and Development LLC" 
              className="disd-footer-logo"
            />
            <p className="disd-footer-desc">
              Dragon International Services and Development LLC (DISD) is an international leader in hydraulic demolition machinery and heavy earthmoving attachments, implementing 6S lean management and Japan Komatsu KES standards.
            </p>
            <div>
              <a 
                href="#quote-estimator" 
                className="disd-btn-amber"
                style={{ fontSize: '12px', padding: '10px 20px' }}
              >
                Get a Quote
              </a>
            </div>
          </div>

          {/* Middle Column: Products Menu */}
          <div>
            <h4 className="disd-footer-title">
              Our Products
            </h4>
            <ul className="disd-footer-links">
              {productLinks.map((item, idx) => (
                <li key={idx}>
                  <a href={item.href} className="disd-footer-link">
                    <span style={{ color: '#FF9900', fontSize: '10px' }}>■</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Contact Details */}
          <div>
            <h4 className="disd-footer-title">
              Jeddah Office
            </h4>
            <ul className="disd-footer-contact">
              <li>
                <MapPin size={18} color="#FF9900" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>حي، طريق جازان العام, Al Jawharah, Jeddah, Saudi Arabia</span>
              </li>
              <li>
                <Phone size={18} color="#FF9900" style={{ flexShrink: 0 }} />
                <a href="tel:+966543732208" className="disd-footer-contact-link">
                  +966-543732208
                </a>
              </li>
              <li>
                <Mail size={18} color="#FF9900" style={{ flexShrink: 0 }} />
                <a href="mailto:shoaib@deepaxis.cn" className="disd-footer-contact-link">
                  shoaib@deepaxis.cn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="disd-footer-bottom">
          <div className="disd-footer-copy">
            © {new Date().getFullYear()} Dragon International Services and Development LLC. All Rights Reserved.
          </div>
          <button 
            type="button"
            onClick={scrollToTop}
            className="disd-footer-back-to-top"
          >
            <span>Back to Top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
