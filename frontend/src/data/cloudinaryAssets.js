import assetMap from './cloudinaryAssets.json';

/**
 * Single source of truth for Cloudinary asset CDN mappings.
 * Generated/updated via scripts/upload_to_cloudinary.cjs.
 */
export const cloudinaryAssets = assetMap;

/**
 * Cloudinary asset lookup helper.
 * Resolves local relative paths to high-performance Cloudinary CDN URLs.
 * 
 * @param {string} pathOrName - e.g. "/assets/logo.png", "logo.png", or "/assets/tripo_pbr_model...glb"
 * @returns {string} Cloudinary CDN URL or original path fallback
 */
export function getAssetUrl(pathOrName) {
  if (!pathOrName) return pathOrName;
  
  const filename = pathOrName.split('/').pop().split('?')[0];
  
  if (cloudinaryAssets[filename]) {
    return cloudinaryAssets[filename];
  }
  
  return pathOrName;
}

export default cloudinaryAssets;
