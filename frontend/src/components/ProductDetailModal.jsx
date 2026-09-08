import React from 'react';
import { X, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { getAssetUrl } from '../data/cloudinaryAssets.js';

export default function ProductDetailModal({ product, onClose, onSelectForQuote }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-[#F8F9FA]">
          <div>
            <div className="text-xs font-bold text-[#004444] uppercase tracking-wider">
              {product.category} • Model: {product.modelNumber}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {product.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Image & Certifications */}
          <div>
            <div className="h-64 bg-gray-50 rounded border border-gray-200 flex items-center justify-center p-2 mb-4 overflow-hidden">
              <img 
                src={getAssetUrl(product.image)} 
                alt={product.title} 
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="bg-[#F1F5F9] border border-gray-200 p-3 rounded text-xs text-gray-700 space-y-1">
              <div className="font-semibold text-[#004444]">Manufacturing Standard:</div>
              <div>{product.specifications?.manufacturingStandard || '6S Lean / Japan Komatsu KES Standard'}</div>
              <div className="font-semibold text-[#004444] pt-1">Warranty:</div>
              <div>{product.specifications?.standardWarranty || '24 Months Comprehensive'}</div>
            </div>
          </div>

          {/* Right: Technical Specifications */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#004444] uppercase tracking-wide mb-2">
                Equipment Description
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#004444] uppercase tracking-wide mb-2">
                Technical Specifications
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded divide-y divide-gray-200 text-xs">
                {product.specifications?.operatingWeight && (
                  <div className="flex justify-between p-2.5">
                    <span className="text-gray-500">Operating Weight:</span>
                    <span className="font-semibold text-gray-900">{product.specifications.operatingWeight}</span>
                  </div>
                )}
                {product.specifications?.applicableExcavator && (
                  <div className="flex justify-between p-2.5">
                    <span className="text-gray-500">Applicable Carrier:</span>
                    <span className="font-semibold text-gray-900">{product.specifications.applicableExcavator}</span>
                  </div>
                )}
                {product.specifications?.operatingPressure && (
                  <div className="flex justify-between p-2.5">
                    <span className="text-gray-500">Operating Pressure:</span>
                    <span className="font-semibold text-gray-900">{product.specifications.operatingPressure}</span>
                  </div>
                )}
                {product.specifications?.oilFlowRate && (
                  <div className="flex justify-between p-2.5">
                    <span className="text-gray-500">Oil Flow Rate:</span>
                    <span className="font-semibold text-gray-900">{product.specifications.oilFlowRate}</span>
                  </div>
                )}
                {product.specifications?.impactRate && (
                  <div className="flex justify-between p-2.5">
                    <span className="text-gray-500">Impact Rate / Capacity:</span>
                    <span className="font-semibold text-gray-900">{product.specifications.impactRate}</span>
                  </div>
                )}
                {product.specifications?.chiselDiameter && (
                  <div className="flex justify-between p-2.5">
                    <span className="text-gray-500">Chisel / Tool Dim.:</span>
                    <span className="font-semibold text-gray-900">{product.specifications.chiselDiameter}</span>
                  </div>
                )}
              </div>
            </div>

            {product.features && (
              <div>
                <h3 className="text-sm font-bold text-[#004444] uppercase tracking-wide mb-2">
                  Key Features
                </h3>
                <ul className="space-y-1 text-xs text-gray-600">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle size={14} className="text-[#16AB64] mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-100 transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onSelectForQuote(product);
              onClose();
            }}
            className="px-5 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-black text-xs font-bold uppercase tracking-wider rounded transition shadow flex items-center gap-1.5"
          >
            <span>Request Price Quote</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
