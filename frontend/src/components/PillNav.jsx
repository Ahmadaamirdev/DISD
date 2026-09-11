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
  const dropdownTimeoutRef = useRef(null);
  const cssEase = resolveEase(ease);

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Detect scroll to transition from transparent on hero to colored on scroll (RAF throttled)
  useEffect(() => {
    let ticking = false;
    let lastScrolled = window.scrollY > 40;
    setIsScrolled(lastScrolled);

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 40;
          if (scrolled !== lastScrolled) {
            lastScrolled = scrolled;
            setIsScrolled(scrolled);
          }
          ticking = false;
        });
      }
    };

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
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [hoveredIndex]);

  const handleMouseEnterItem = (index) => {
    setHoveredIndex(index);
    updatePillPosition(index);
  };

  const handleDropdownEnter = (index) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    handleMouseEnterItem(index);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
      setHoveredIndex(null);
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }, 280);
  };

  const handleMouseLeaveMenu = () => {
    if (!dropdownOpen) {
      setHoveredIndex(null);
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
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
                  onMouseEnter={() => handleDropdownEnter(index)}
                  onMouseLeave={handleDropdownLeave}
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

                  {/* Dropdown Menu with Continuous Hover Bridge */}
                  {dropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        paddingTop: 6, // Zero-gap hover bridge
                        zIndex: 200,
                      }}
                      onMouseEnter={() => handleDropdownEnter(index)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div
                        className="disd-dropdown-menu"
                        style={{
                          position: 'relative',
                          top: 0,
                          left: 0,
                          width: 270,
                          backgroundColor: isScrolled
                            ? 'rgba(0, 45, 45, 0.98)'
                            : 'rgba(0, 30, 30, 0.45)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: isScrolled
                            ? '1px solid rgba(0, 85, 85, 0.65)'
                            : '1px solid rgba(255, 255, 255, 0.15)',
                          borderTop: '2px solid #FF9900',
                          borderRadius: 12,
                          boxShadow: isScrolled
                            ? '0 20px 40px -8px rgba(0, 0, 0, 0.55), 0 0 25px rgba(0, 68, 68, 0.35)'
                            : '0 16px 36px rgba(0, 0, 0, 0.35)',
                          padding: '6px 0',
                          zIndex: 200,
                          animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          overflow: 'hidden',
                          transition: 'background-color 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
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
                              padding: '10px 18px',
                              fontSize: 13,
                              fontWeight: 500,
                              color: '#F1F5F9',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: sIdx === item.submenu.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              fontFamily: 'inherit',
                            }}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
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
                  } else if (item.href && item.href.startsWith('#')) {
                    e.preventDefault();
                    handleItemClick(item, index);
                    const targetId = item.href.replace('#', '');
                    if (targetId) {
                      const targetEl = document.getElementById(targetId);
                      if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth' });
                      }
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  } else {
                    handleItemClick(item, index);
                  }
                  if (e.currentTarget && e.currentTarget.blur) {
                    e.currentTarget.blur();
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
        <div style={{
          backgroundColor: '#002B2B',
          borderTop: '1px solid rgba(255,153,0,0.25)',
          padding: '8px 0 16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {items.map((it, idx) => (
            <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {it.submenu ? (
                <div>
                  <div style={{
                    padding: '12px 24px',
                    color: '#FF9900',
                    fontWeight: 700,
                    fontSize: '13px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}>
                    {it.label}
                  </div>
                  <div style={{ paddingLeft: '24px', paddingBottom: '8px', display: 'flex', flexDirection: 'column' }}>
                    {it.submenu.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (sub.onClick) sub.onClick();
                          else if (onSelectCategory && sub.category) onSelectCategory(sub.category);
                        }}
                        style={{
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          borderBottom: sIdx < it.submenu.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          color: '#CBD5E1',
                          fontSize: '14px',
                          padding: '11px 0',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'color 0.15s ease',
                        }}
                        onTouchStart={(e) => { e.currentTarget.style.color = '#FF9900'; }}
                        onTouchEnd={(e) => { e.currentTarget.style.color = '#CBD5E1'; }}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <a
                  href={it.href || '#'}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (it.onClick) {
                      e.preventDefault();
                      it.onClick();
                    } else if (it.href && it.href.startsWith('#')) {
                      e.preventDefault();
                      const targetId = it.href.replace('#', '');
                      if (targetId) {
                        const targetEl = document.getElementById(targetId);
                        if (targetEl) {
                          targetEl.scrollIntoView({ behavior: 'smooth' });
                        }
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }
                  }}
                  style={{
                    display: 'block',
                    color: '#FFFFFF',
                    padding: '14px 24px',
                    fontWeight: 600,
                    fontSize: '15px',
                    textDecoration: 'none',
                  }}
                >
                  {it.label}
                </a>
              )}
            </div>
          ))}
          {ctaText && (
            <div style={{ padding: '16px 24px 4px' }}>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onCtaClick) onCtaClick();
                }}
                className="disd-nav-cta"
                style={{ width: '100%', textAlign: 'center', display: 'block' }}
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
        .disd-dropdown-item {
          color: #F1F5F9 !important;
          transition: all 0.18s ease !important;
        }
        .disd-dropdown-item:hover {
          background-color: rgba(255, 153, 0, 0.14) !important;
          color: #FF9900 !important;
          padding-left: 22px !important;
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
