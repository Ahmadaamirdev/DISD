import React, { useState } from 'react';
import { MapPin, Phone, Mail, ArrowUp, ExternalLink, Navigation } from 'lucide-react';

export default function Footer() {
  const [mapView, setMapView] = useState('roadmap'); // 'roadmap' | 'satellite'

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'Home', href: '#' },
    { label: 'Products', href: '#products' },
    { label: 'Company Profile', href: '#company-profile' },
    { label: 'Applications', href: '#applications' },
    { label: 'Parts & Services', href: '#parts-services' },
    { label: 'Where to Buy', href: '#where-to-buy' },
    { label: 'Get a Quote', href: '#quote-estimator' }
  ];

  const googleMapsUrl = mapView === 'satellite'
    ? 'https://www.google.com/maps/place/%D9%85%D8%B5%D8%AF%D8%B1+%D9%82%D8%B7%D8%B9+%D8%A7%D9%84%D8%B1%D9%88%D8%A7%D9%81%D8%B9+-+Spare+Parts+For+Forklifts%E2%80%AD/@21.4176875,39.2539375,17z/data=!3m1!1e3!4m10!1m2!2m1!1z2K3ZitiMINi32LHZitmCINis2KfYstin2YYg2KfZhNi52KfZhSwgQWwgSmF3aGFyYWgsIEplZGRhaCwgU2F1ZGkgQXJhYmlh!3m6!1s0x15c3cdb48dcb23e5:0x76e6f2161a6dea81!8m2!3d21.4176875!4d39.2539375!15sCkjYrdmK2Iwg2LfYsdmK2YIg2KzYp9iy2KfZhiDYp9mE2LnYp9mFLCBBbCBKYXdoYXJhaCwgSmVkZGFoLCBTYXVkaSBBcmFiaWFaRSJD2K3ZiiDYt9ix2YrZgiDYrNin2LLYp9mGINin2YTYudin2YUgYWwgamF3aGFyYWggamVkZGFoIHNhdWRpIGFyYWJpYZIBD2ZvcmtsaWZ0X2RlYWxlcuABAA!16s%2Fg%2F11pqqpff13?entry=ttu'
    : 'https://www.google.com/maps/place/%D9%85%D8%B5%D8%AF%D8%B1+%D9%82%D8%B7%D8%B9+%D8%A7%D9%84%D8%B1%D9%88%D8%A7%D9%81%D8%B9+-+Spare+Parts+For+Forklifts%E2%80%AD/@21.5876725,39.0528474,11z/data=!4m10!1m2!2m1!1z2K3ZitiMINi32LHZitmCINis2KfYstin2YYg2KfZhNi52KfZhSwgQWwgSmF3aGFyYWgsIEplZGRhaCwgU2F1ZGkgQXJhYmlh!3m6!1s0x15c3cdb48dcb23e5:0x76e6f2161a6dea81!8m2!3d21.4176875!4d39.2539375!15sCkjYrdmK2Iwg2LfYsdmK2YIg2KzYp9iy2KfZhiDYp9mE2LnYp9mFLCBBbCBKYXdoYXJhaCwgSmVkZGFoLCBTYXVkaSBBcmFiaWFaRSJD2K3ZiiDYt9ix2YrZgiDYrNin2LLYp9mGINin2YTYudin2YUgYWwgamF3aGFyYWggamVkZGFoIHNhdWRpIGFyYWJpYZIBD2ZvcmtsaWZ0X2RlYWxlcuABAA!16s%2Fg%2F11pqqpff13?entry=ttu&g_ep=EgoyMDI2MDkwOC4wIKXMDSoASAFQAw%3D%3D';

  const roadmapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14856.326260273767!2d39.2539375!3d21.4176875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3cdb48dcb23e5%3A0x76e6f2161a6dea81!2z2YXYtdiv2LEg2YLYt9i5INin2YTYsdmI2KfZgdi5IC0gU3BhcmUgUGFydHMgRm9yIEZvcmtsaWZ0c-KAqw!5e0!3m2!1sen!2ssa!4v1726056000000!5m2!1sen!2ssa';

  const satelliteEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14856.326260273767!2d39.2539375!3d21.4176875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15c3cdb48dcb23e5%3A0x76e6f2161a6dea81!2z2YXYtdiv2LEg2YLYt9i5INin2YTYsdmI2KfZgdi5IC0gU3BhcmUgUGFydHMgRm9yIEZvcmtsaWZ0c-KAqw!5e1!3m2!1sen!2ssa!4v1726056000000!5m2!1sen!2ssa';

  return (
    <footer className="disd-footer">
      <div className="disd-container">
        <div className="disd-footer-grid">
          {/* Column 1: Brand Logo & Mission */}
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

          {/* Column 2: Quick Links (Single Column) */}
          <div>
            <h4 className="disd-footer-title">
              Quick Links
            </h4>
            <ul className="disd-footer-links disd-footer-quicklinks">
              {quickLinks.map((item, idx) => (
                <li key={idx}>
                  <a href={item.href} className="disd-footer-link">
                    <span style={{ color: '#FF9900', fontSize: '10px' }}>■</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div>
            <h4 className="disd-footer-title">
              Jeddah Office
            </h4>
            <ul className="disd-footer-contact">
              <li>
                <MapPin size={18} color="#FF9900" style={{ flexShrink: 0, marginTop: '2px' }} />
                <a 
                  href={googleMapsUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="disd-footer-contact-link"
                  style={{ fontWeight: 400, color: '#CBD5E1', lineHeight: 1.5 }}
                  title="Open location in Google Maps"
                >
                  حي، طريق جازان العام, Al Jawharah, Jeddah, Saudi Arabia
                </a>
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

          {/* Column 4: Live Google Map */}
          <div>
            <h4 className="disd-footer-title">
              Location Map
            </h4>
            <div className="disd-footer-map-wrap">
              <div className="disd-footer-map-bar">
                <span className="disd-footer-map-hint">
                  <Navigation size={11} color="#FF9900" style={{ transform: 'rotate(45deg)' }} />
                  <span>Pan & Zoom Active</span>
                </span>
                <div className="disd-footer-map-toggles" role="tablist" aria-label="Map view mode">
                  <button
                    type="button"
                    onClick={() => setMapView('roadmap')}
                    className={`disd-footer-toggle-btn ${mapView === 'roadmap' ? 'active' : ''}`}
                    title="Switch to Standard Road Map"
                  >
                    Map
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapView('satellite')}
                    className={`disd-footer-toggle-btn ${mapView === 'satellite' ? 'active' : ''}`}
                    title="Switch to Satellite Imagery View"
                  >
                    Satellite
                  </button>
                </div>
              </div>

              <div className="disd-footer-map-frame">
                <iframe
                  key={mapView}
                  title={`DISD Location Map - Al Jawharah, Jeddah (${mapView === 'satellite' ? 'Satellite View' : 'Standard Map'})`}
                  src={mapView === 'satellite' ? satelliteEmbedUrl : roadmapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: 'block', width: '100%', height: '100%', pointerEvents: 'auto' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="fullscreen"
                />
              </div>

              <div className="disd-footer-map-actions">
                <a 
                  href={googleMapsUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="disd-footer-map-btn"
                  title="Open location in Google Maps"
                >
                  <MapPin size={14} color="#FF9900" />
                  <span>{mapView === 'satellite' ? 'View Satellite in Google Maps' : 'View on Google Maps'}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
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
