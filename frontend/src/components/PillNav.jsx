import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';

/**
 * Map ease string (GSAP notation or CSS) to CSS transition timing function
 */
function resolveEase(ease) {
  const easeMap = {
    'power1.easeOut': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'power2.easeOut': 'cubic-bezier(0.25, 1, 0.5, 1)',
    'power3.easeOut': 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    'power4.easeOut': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'circ.easeOut': 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    'expo.easeOut': 'cubic-bezier(0.19, 1, 0.22, 1)',
  };
  return easeMap[ease] || ease || 'cubic-bezier(0.25, 1, 0.5, 1)';
}

/**
 * Modern Pill Navigation Component with smooth sliding pill indicator
 */
export default function PillNav({
  logo = 'https://res.cloudinary.com/nol4eyyl/image/upload/v1788845152/disd_assets/logo.png',
  logoAlt = 'DISD Logo',
  items = [],
  activeHref = '#',
  className = '',
  ease = 'power2.easeOut',
  baseColor = '#004444',
  pillColor = 'rgba(255, 255, 255, 0.16)',
  hoveredPillTextColor = '#FF9900',
  pillTextColor = '#FFFFFF',
  theme = 'dark',
  initialLoadAnimation = false,
  ctaText = 'Get Quote',
  ctaHref = '#quote-estimator',
  onCtaClick,
  onSelectCategory,
}) {
  const [currentActive, setCurrentActive] = useState(activeHref);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pillStyle, setPillStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const menuContainerRef = useRef(null);
  const itemRefs = useRef([]);
  const cssEase = resolveEase(ease);

  // Detect scroll to transition from transparent on hero to colored on scroll (RAF throttled)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 40;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Position pill over a given item index
  const updatePillPosition = (index) => {
    if (index === null || index === undefined || !itemRefs.current[index] || !menuContainerRef.current) {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const itemEl = itemRefs.current[index];
    const containerEl = menuContainerRef.current;
    const itemRect = itemEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    setPillStyle({
      left: itemRect.left - containerRect.left,
      top: itemRect.top - containerRect.top,
      width: itemRect.width,
      height: itemRect.height,
      opacity: 1,
    });
  };

  // Window resize handler to reposition the pill if hovered
  useEffect(() => {
    const handleResize = () => {
      if (hoveredIndex !== null) {
        updatePillPosition(hoveredIndex);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hoveredIndex]);

  const handleMouseEnterItem = (index) => {
    setHoveredIndex(index);
    updatePillPosition(index);
  };

  const handleMouseLeaveMenu = () => {
    setHoveredIndex(null);
    setDropdownOpen(false);
    setPillStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleItemClick = (item, index) => {
    setCurrentActive(item.href || '');
    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <nav
      className={`disd-navbar disd-pillnav-root ${className}`}
      style={{
        backgroundColor: mobileMenuOpen || isScrolled ? baseColor : 'transparent',
        boxShadow: isScrolled ? '0 4px 16px rgba(0, 0, 0, 0.18)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0, 85, 85, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        userSelect: 'none',
        transition: 'background-color 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
      }}
    >
      <div className="disd-container disd-nav-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 84 }}>
        {/* Logo */}
        <a href="#" aria-label={logoAlt} style={{ display: 'flex', alignItems: 'center', outline: 'none' }}>
          {typeof logo === 'string' ? (
            <img
              src={logo}
              alt={logoAlt}
              className="disd-logo-img"
              style={{ height: 54, width: 'auto', objectFit: 'contain' }}
            />
          ) : (
            logo
          )}
        </a>

        {/* Desktop Nav Items with Sliding Pill */}
        <div
          ref={menuContainerRef}
          className="disd-nav-menu disd-pillnav-menu"
          onMouseLeave={handleMouseLeaveMenu}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 6px',
            borderRadius: '9999px',
            backgroundColor: 'transparent',
          }}
        >
          {/* Animated Sliding Pill Background Indicator */}
          <div
            className="disd-pill-indicator"
            style={{
              position: 'absolute',
              left: pillStyle.left,
              top: pillStyle.top,
              width: pillStyle.width,
              height: pillStyle.height,
              backgroundColor: pillColor,
              borderRadius: '9999px',
              pointerEvents: 'none',
              zIndex: 0,
              opacity: pillStyle.opacity,
              transition: `left 0.32s ${cssEase}, top 0.32s ${cssEase}, width 0.32s ${cssEase}, height 0.32s ${cssEase}, opacity 0.22s ease`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            }}
          />

          {items.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;
            const textColor = isHovered ? hoveredPillTextColor : pillTextColor;

            if (hasSubmenu) {
              return (
                <div
                  key={item.label || index}
                  ref={(el) => (itemRefs.current[index] = el)}
                  className="disd-dropdown-wrapper"
                  onMouseEnter={() => {
                    handleMouseEnterItem(index);
                    setDropdownOpen(true);
                  }}
                  onMouseLeave={() => {
                    setDropdownOpen(false);
                  }}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  <button
                    type="button"
                    className="disd-nav-item"
                    onClick={() => {
                      setDropdownOpen(!dropdownOpen);
                      handleItemClick(item, index);
                    }}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      color: textColor,
                      fontSize: 14,
                      fontWeight: 600,
                      padding: '10px 18px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      transition: 'color 0.22s ease',
                    }}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      size={14}
                      style={{
                        transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="disd-dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        width: 260,
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 8,
                        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)',
                        padding: '10px 0',
                        zIndex: 200,
                        animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {item.submenu.map((sub, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => {
                            setDropdownOpen(false);
                            if (sub.onClick) {
                              sub.onClick();
                            } else if (onSelectCategory && sub.category) {
                              onSelectCategory(sub.category);
                              const element = document.getElementById('products');
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              }
                            }
                          }}
                          className="disd-dropdown-item"
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 20px',
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#1E293B',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <a
                key={item.label || index}
                ref={(el) => (itemRefs.current[index] = el)}
                href={item.href || '#'}
                onMouseEnter={() => handleMouseEnterItem(index)}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    handleItemClick(item, index);
                  } else {
                    handleItemClick(item, index);
                  }
                }}
                className="disd-nav-item"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  color: textColor,
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  textDecoration: 'none',
                  transition: 'color 0.22s ease',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>

        {/* CTA Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {ctaText && (
            <a
              href={ctaHref}
              onClick={(e) => {
                if (onCtaClick) {
                  e.preventDefault();
                  onCtaClick();
                }
              }}
              className="disd-nav-cta"
            >
              {ctaText}
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="disd-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: '#003333', padding: '16px 24px', borderTop: '1px solid #005555' }}>
          {items.map((it, idx) => (
            <div key={idx}>
              {it.submenu ? (
                <div style={{ padding: '8px 0', color: '#fff', fontWeight: 600 }}>
                  {it.label}
                  <div style={{ paddingLeft: '16px', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {it.submenu.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (sub.onClick) sub.onClick();
                          else if (onSelectCategory && sub.category) onSelectCategory(sub.category);
                        }}
                        style={{ textAlign: 'left', background: 'none', border: 'none', color: '#CBD5E1', fontSize: '13px', padding: '4px 0', cursor: 'pointer' }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  href={it.href || '#'}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (it.onClick) it.onClick();
                  }}
                  style={{ display: 'block', color: '#fff', padding: '8px 0', fontWeight: 600, textDecoration: 'none' }}
                >
                  {it.label}
                </a>
              )}
            </div>
          ))}
          {ctaText && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onCtaClick) onCtaClick();
                }}
                className="disd-nav-cta"
                style={{ width: '100%', textAlign: 'center' }}
              >
                {ctaText}
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .disd-dropdown-item:hover {
          background-color: #F1F5F9 !important;
          color: #FF8A1A !important;
          padding-left: 24px !important;
        }
        @media (max-width: 992px) {
          .disd-pillnav-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
