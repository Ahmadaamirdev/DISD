import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read JSON file safely
 */
export const readJson = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`[JSON Store] Error reading ${filePath}:`, err.message);
    return fallback;
  }
};

/**
 * Write JSON file safely
 */
export const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[JSON Store] Error writing to ${filePath}:`, err.message);
    return false;
  }
};

export const getProducts = () => readJson(PRODUCTS_FILE, []);
export const getInquiries = () => readJson(INQUIRIES_FILE, []);

export const addInquiry = (inquiry) => {
  const current = getInquiries();
  current.unshift(inquiry);
  writeJson(INQUIRIES_FILE, current);
  return inquiry;
};
