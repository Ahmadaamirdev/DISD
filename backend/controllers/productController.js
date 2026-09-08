import Product from '../models/Product.js';
import { isConnected } from '../config/db.js';
import { getProducts as getProductsFromJson } from '../utils/jsonStore.js';

export const getProducts = async (req, res, next) => {
  try {
    const { category, featured } = req.query;

    if (isConnected) {
      const filter = {};
      if (category && category !== 'All') filter.category = category;
      if (featured === 'true') filter.featured = true;

      const products = await Product.find(filter);
      if (products.length > 0) {
        return res.json({
          success: true,
          count: products.length,
          data: products,
          source: 'mongodb-atlas'
        });
      }
    }

    // Read from JSON file
    const allProducts = getProductsFromJson();
    let filtered = [...allProducts];

    if (category && category !== 'All') {
      filtered = filtered.filter(
        p => p.category && p.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (featured === 'true') {
      filtered = filtered.filter(p => p.featured);
    }

    return res.json({
      success: true,
      count: filtered.length,
      data: filtered,
      source: isConnected ? 'mongodb-atlas' : 'json-file'
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isConnected) {
      const product = await Product.findOne({
        $or: [{ _id: id }, { slug: id }, { id }]
      });
      if (product) {
        return res.json({ success: true, data: product, source: 'mongodb-atlas' });
      }
    }

    const allProducts = getProductsFromJson();
    const item = allProducts.find(p => p.id === id || p.slug === id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment specification not found'
      });
    }

    return res.json({ success: true, data: item, source: 'json-file' });
  } catch (error) {
    next(error);
  }
};
