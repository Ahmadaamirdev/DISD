import assetMap from './cloudinaryAssets.json';

/**
 * Single source of truth for Cloudinary asset CDN mappings.
 * Generated/updated via scripts/upload_to_cloudinary.cjs.
 */
export const cloudinaryAssets = assetMap;

/**
 * Cloudinary asset lookup helper.
 * Resolves local relative paths to high-performance Cloudinary CDN URLs.
 * Automatically injects next-gen auto-format & quality (f_auto,q_auto) for WebP/AVIF delivery.
 * 
 * @param {string} pathOrName - e.g. "/assets/logo.png", "logo.png", or "/assets/tripo_pbr_model...glb"
 * @returns {string} Cloudinary CDN URL or original path fallback
 */
export function getAssetUrl(pathOrName) {
  if (!pathOrName) return pathOrName;
  
  const filename = pathOrName.split('/').pop().split('?')[0];
  let url = cloudinaryAssets[filename] || pathOrName;

  // Automatically serve modern WebP/AVIF images and compressed video streams
  if (typeof url === 'string') {
    if (url.includes('/image/upload/') && !url.includes('/f_auto')) {
      url = url.replace('/image/upload/', '/image/upload/f_auto,q_auto/');
    } else if (url.includes('/video/upload/') && !url.includes('/f_auto') && !url.includes('/q_auto')) {
      url = url.replace('/video/upload/', '/video/upload/f_auto,q_auto/');
    }
  }

  return url;
}

export default cloudinaryAssets;
