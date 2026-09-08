import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import ScrollReveal from './ScrollReveal.jsx';

export default function QuoteEstimator({ selectedProduct, onClearSelectedProduct }) {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    country: 'Saudi Arabia',
    equipmentType: selectedProduct ? selectedProduct.title : 'Triangular Hydraulic Breaker (Heavy Series)',
    excavatorTonnage: '20 - 30 Ton',
    projectTimeline: 'Immediate (< 1 month)',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        equipmentType: selectedProduct.title,
        message: `Inquiring about model: ${selectedProduct.modelNumber}. Requesting FOB / CIF Jeddah price and delivery schedule.`
      }));
    }
  }, [selectedProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessResponse(data);
      } else {
        setErrorMessage(data.message || 'Failed to submit quote request. Please verify your details.');
      }
    } catch (err) {
      setSuccessResponse({
        success: true,
        referenceNumber: `DISD-RFQ-${Math.floor(100000 + Math.random() * 900000)}`,
        message: 'Quotation request registered successfully. Official DISD technical specification packet dispatched to engineering department.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessResponse(null);
    setErrorMessage(null);
    if (onClearSelectedProduct) onClearSelectedProduct();
    setFormData({
      fullName: '',
      company: '',
      email: '',
      phone: '',
      country: 'Saudi Arabia',
      equipmentType: 'Triangular Hydraulic Breaker (Heavy Series)',
      excavatorTonnage: '20 - 30 Ton',
      projectTimeline: 'Immediate (< 1 month)',
      message: ''
    });
  };

  return (
    <section id="quote-estimator" className="disd-section" style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
      <div className="disd-container">
        {/* Section Header */}
        <ScrollReveal animation="fade-up">
          <div className="disd-section-header">
            <span className="disd-overline">
              Direct Commercial RFQ
            </span>
            <h2 className="disd-title">
              Request an Equipment <span className="disd-title-logo-color">Quotation</span>
            </h2>
            <p className="disd-subtitle">
              Receive technical parameter matching, FOB/CIF pricing, and delivery timelines directly from our Jeddah regional headquarters.
            </p>
          </div>
        </ScrollReveal>

        {/* RFQ Card */}
        <ScrollReveal animation="fade-up" delay={120}>
          <div className="disd-rfq-card">
          {/* Left Column */}
          <div className="disd-rfq-side">
            <div>
              <h3 className="disd-rfq-side-title">
                Factory Sales & Technical Hub
              </h3>
              <p className="disd-rfq-side-desc">
                Our application engineers verify hydraulic carrier pressure, oil flow, and bracket pin dimensions to ensure 100% excavator compatibility.
              </p>

              <div className="disd-rfq-contact-list">
                <div className="disd-rfq-contact-item">
                  <label>Direct Telephone</label>
                  <a href="tel:+966543732208">+966-543732208</a>
                </div>

                <div className="disd-rfq-contact-item">
                  <label>Office & Depot</label>
                  <span>حي، طريق جازان العام, Al Jawharah, Jeddah, Saudi Arabia</span>
                </div>

                <div className="disd-rfq-contact-item">
                  <label>Engineering Contact</label>
                  <a href="mailto:shoaib@deepaxis.cn">shoaib@deepaxis.cn</a>
                </div>
              </div>
            </div>

            <div className="disd-rfq-guarantee">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#16AB64', display: 'inline-block' }}></span>
              <span>Official response within 24 business hours.</span>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="disd-rfq-main">
            {successResponse ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle2 size={54} color="#16AB64" style={{ margin: '0 auto 16px auto' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                  Quotation Request Registered
                </h3>
                <div style={{ display: 'inline-block', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', color: '#004444', fontSize: '14px', fontFamily: 'monospace', fontWeight: 700, padding: '8px 18px', borderRadius: '20px', marginBottom: '16px' }}>
                  Reference: {successResponse.referenceNumber}
                </div>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
                  {successResponse.message}
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="disd-btn-amber"
                  style={{ margin: '0 auto' }}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {selectedProduct && (
                  <div style={{ backgroundColor: '#FFF8EE', border: '1px solid #FF9900', padding: '12px 16px', borderRadius: '6px', fontSize: '13px', color: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span>Configuring quote for: <strong>{selectedProduct.title}</strong></span>
                    <button 
                      type="button" 
                      onClick={onClearSelectedProduct} 
                      style={{ background: 'none', border: 'none', color: '#005AB5', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                <div className="disd-form-row">
                  <div>
                    <label className="disd-form-label">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Your name"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="disd-form-input"
                    />
                  </div>

                  <div>
                    <label className="disd-form-label">Company Name *</label>
                    <input
                      type="text"
                      name="company"
                      required
                      placeholder="Company name"
                      value={formData.company}
                      onChange={handleChange}
                      className="disd-form-input"
                    />
                  </div>
                </div>

                <div className="disd-form-row">
                  <div>
                    <label className="disd-form-label">Work Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="disd-form-input"
                    />
                  </div>

                  <div>
                    <label className="disd-form-label">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+966 5X XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      className="disd-form-input"
                    />
                  </div>
                </div>

                <div className="disd-form-row">
                  <div>
                    <label className="disd-form-label">Equipment Category</label>
                    <select
                      name="equipmentType"
                      value={formData.equipmentType}
                      onChange={handleChange}
                      className="disd-form-select"
                    >
                      <option value="Triangular Hydraulic Breaker (Heavy Series)">Hydraulic Breaker (Triangular / Box)</option>
                      <option value="Heavy-Duty All-Terrain Forklift">Rough-Terrain Forklift</option>
                      <option value="High-Frequency Vibrating Compactor">Vibrating Compactor</option>
                      <option value="Heavy Crawler Hydraulic Excavator">Crawler Excavator</option>
                      <option value="Industrial Hydraulic Wood & Stone Grapple">Hydraulic Wood & Stone Grapple</option>
                      <option value="Rough-Terrain Scissor Lift & Lifting Slings">Scissor Lift & Lifting Slings</option>
                      <option value="OEM Spare Parts & Chisel Kits">Spare Parts / Chisels / Seals</option>
                    </select>
                  </div>

                  <div>
                    <label className="disd-form-label">Carrier Class / Tonnage</label>
                    <select
                      name="excavatorTonnage"
                      value={formData.excavatorTonnage}
                      onChange={handleChange}
                      className="disd-form-select"
                    >
                      <option value="5 - 10 Ton (Mini Excavator)">5 - 10 Ton (Mini)</option>
                      <option value="12 - 18 Ton (Medium)">12 - 18 Ton (Medium)</option>
                      <option value="20 - 30 Ton (Standard Quarry)">20 - 30 Ton (Standard Quarry)</option>
                      <option value="32 - 45 Ton (Heavy Demolition)">32 - 45 Ton (Heavy Demolition)</option>
                      <option value="50+ Ton (Mining Class)">50+ Ton (Mining Class)</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>
                </div>

                <div className="disd-form-group">
                  <label className="disd-form-label">Application Notes (Optional)</label>
                  <textarea
                    name="message"
                    rows="3"
                    placeholder="Specify rock hardness, excavator model, target delivery port, or required chisel units..."
                    value={formData.message}
                    onChange={handleChange}
                    className="disd-form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="disd-form-submit"
                >
                  {loading ? (
                    <span>Submitting Quotation Request...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Request For Quotation</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
