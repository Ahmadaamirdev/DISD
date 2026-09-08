import Inquiry from '../models/Inquiry.js';
import { isConnected } from '../config/db.js';
import { getInquiries as getInquiriesFromJson, addInquiry as addInquiryToJson } from '../utils/jsonStore.js';

export const createInquiry = async (req, res, next) => {
  try {
    const {
      fullName,
      company,
      email,
      phone,
      country,
      equipmentType,
      excavatorTonnage,
      projectTimeline,
      message
    } = req.body;

    if (!fullName || !company || !email || !phone || !equipmentType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, company, email, phone number, and required equipment type.'
      });
    }

    const inquiryData = {
      fullName,
      company,
      email,
      phone,
      country: country || 'Saudi Arabia',
      equipmentType,
      excavatorTonnage: excavatorTonnage || 'Unspecified',
      projectTimeline: projectTimeline || '1-3 Months',
      message: message || '',
      status: 'Pending Review',
      referenceNumber: `DISD-RFQ-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };

    if (isConnected) {
      try {
        const saved = await Inquiry.create(inquiryData);
        // Also keep JSON file in sync
        addInquiryToJson(inquiryData);
        return res.status(201).json({
          success: true,
          message: 'Quotation request submitted successfully. Our engineering specialist in Jeddah will contact you within 24 hours.',
          referenceNumber: inquiryData.referenceNumber,
          data: saved,
          source: 'mongodb-atlas'
        });
      } catch (err) {
        console.warn('[Inquiry] Atlas save error, persisting to JSON file store:', err.message);
      }
    }

    // Persist inquiry to JSON file (backend/data/inquiries.json)
    const savedInquiry = addInquiryToJson(inquiryData);

    return res.status(201).json({
      success: true,
      message: 'Quotation request registered successfully. Official DISD technical specification packet dispatched to engineering department.',
      referenceNumber: savedInquiry.referenceNumber,
      data: savedInquiry,
      source: 'json-file'
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req, res, next) => {
  try {
    if (isConnected) {
      const records = await Inquiry.find().sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: records.length,
        data: records,
        source: 'mongodb-atlas'
      });
    }

    const records = getInquiriesFromJson();
    return res.json({
      success: true,
      count: records.length,
      data: records,
      source: 'json-file'
    });
  } catch (error) {
    next(error);
  }
};
