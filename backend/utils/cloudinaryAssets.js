import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_JSON_PATH = path.resolve(__dirname, '../data/cloudinaryAssets.json');

let assetMap = {};
try {
  if (fs.existsSync(ASSETS_JSON_PATH)) {
    assetMap = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, 'utf-8'));
  }
} catch (e) {
  console.error('[Cloudinary Assets] Error loading cloudinaryAssets.json:', e.message);
}

export const cloudinaryAssets = assetMap;

/**
 * Cloudinary asset lookup helper for backend.
 * Resolves filenames or local paths to Cloudinary CDN URLs.
 * 
 * @param {string} pathOrName - e.g. "loader_bg_ambient.png", "/assets/hero_video.mp4"
 * @returns {string} Cloudinary CDN URL or original string fallback
 */
export function getAssetUrl(pathOrName) {
  if (!pathOrName) return pathOrName;
  const filename = pathOrName.split('/').pop().split('?')[0];
  return cloudinaryAssets[filename] || pathOrName;
}

export default cloudinaryAssets;
