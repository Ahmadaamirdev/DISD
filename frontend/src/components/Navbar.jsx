import React from 'react';
import PillNav from './PillNav';
const logo = 'https://res.cloudinary.com/nol4eyyl/image/upload/v1788845152/disd_assets/logo.png';

export default function Navbar({ onSelectCategory, onOpenQuoteModal }) {
  const productSubmenu = [
    { label: 'Hydraulic Breaker', category: 'Hydraulic Breaker' },
    { label: 'Hydraulic wood grapple', category: 'Attachments' },
    { label: 'Vibrating compactor', category: 'Compaction Equipment' },
    { label: 'Hydraulic pulverizer', category: 'Attachments' },
    { label: 'Hydraulic quick coupler', category: 'Attachments' },
    { label: 'Compaction Equipment', category: 'Compaction Equipment' },
    { label: 'Excavator', category: 'Excavator' },
    { label: 'Forklift', category: 'Forklift' },
    { label: 'Scissor Lift', category: 'Scissor Lift' }
  ];

  const navItems = [
    { label: 'Home', href: '#' },
    {
      label: 'Products',
      href: '#products',
      submenu: productSubmenu.map((sub) => ({
        label: sub.label,
        category: sub.category,
        onClick: () => {
          if (onSelectCategory) {
            onSelectCategory(sub.category);
          }
          const element = document.getElementById('products');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        },
      })),
    },
    { label: 'Company Profile', href: '#company-profile' },
    { label: 'Applications', href: '#applications' },
    { label: 'Parts & Services', href: '#parts-services' },
    { label: 'Where to Buy', href: '#where-to-buy' },
  ];

  return (
    <PillNav
      logo={logo}
      logoAlt="Dragon International Services and Development LLC"
      items={navItems}
      activeHref=""
      className="custom-nav"
      ease="power2.easeOut"
      baseColor="#004444"
      pillColor="rgba(255, 255, 255, 0.16)"
      hoveredPillTextColor="#FF9900"
      pillTextColor="#FFFFFF"
      theme="dark"
      initialLoadAnimation={false}
      ctaText="Get Quote"
      ctaHref="#quote-estimator"
      onCtaClick={onOpenQuoteModal}
      onSelectCategory={onSelectCategory}
    />
  );
}
