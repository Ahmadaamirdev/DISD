import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  fullName: { type: String, required: [true, 'Full name is required'] },
  company: { type: String, required: [true, 'Company name is required'] },
  email: { type: String, required: [true, 'Work email is required'] },
  phone: { type: String, required: [true, 'Phone number is required'] },
  country: { type: String, default: 'Saudi Arabia' },
  equipmentType: { type: String, required: true },
  excavatorTonnage: { type: String },
  projectTimeline: { type: String, enum: ['Immediate (< 1 month)', '1-3 Months', 'Exploring/Tender', 'Parts & Service'] },
  message: { type: String },
  status: { type: String, default: 'Pending Review', enum: ['Pending Review', 'Contacted', 'Quoted', 'Archived'] }
}, {
  timestamps: true
});

export default mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);
