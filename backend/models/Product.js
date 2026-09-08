import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Hydraulic Breaker', 'Compaction Equipment', 'Excavator', 'Forklift', 'Attachments', 'Scissor Lift']
  },
  modelNumber: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  specifications: {
    operatingWeight: String,
    applicableExcavator: String,
    operatingPressure: String,
    oilFlowRate: String,
    impactRate: String,
    chiselDiameter: String,
    standardWarranty: String,
    manufacturingStandard: String
  },
  features: [String],
  applications: [String],
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
