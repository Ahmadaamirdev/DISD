/**
 * Device Tier & WebGL Capability Detection Utility
 * 
 * Accurately classifies client hardware into 'high', 'medium', or 'low' performance tiers.
 * Allows adaptive 3D rendering:
 * - High Tier: Full dynamic PCF shadows, PMREM HDR environment reflections, capped 1.35 pixel ratio.
 * - Medium / Low Tier: Zero dynamic shadow overhead (uses soft baked contact shadow plane),
 *   capped 1.0 pixel ratio (saving 50-75% GPU fill-rate on high-DPI average screens),
 *   and on-demand asset fetching without network saturation.
 */

let cachedTier = null;

export function getDeviceTier() {
  if (cachedTier) return cachedTier;

  if (typeof window === 'undefined') {
    return {
      tier: 'high',
      isMobile: false,
      isLowEnd: false,
      maxPixelRatio: 1.0,
      enableShadows: true,
      enablePMREM: true,
      preloadAlternateModel: false,
    };
  }

  const isMobile = window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches;
  const memory = navigator.deviceMemory || 4; // GB (if supported)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check network connection constraints
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection ? (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === '3g') : false;

  // Lightweight WebGL GPU Query
  let gpuRenderer = '';
  let isSoftwareGpu = false;
  let isIntegratedGpu = false;
  let isDedicatedGpu = false;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const gl = canvas.getContext('webgl', { powerPreference: 'default' }) || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
      }
      
      isSoftwareGpu = /swiftshader|llvmpipe|software|virtualbox|mesa generic/i.test(gpuRenderer);
      isIntegratedGpu = /intel|mali-4|mali-t|adreno \(tm\) [345]|powervr/i.test(gpuRenderer);
      isDedicatedGpu = /nvidia|geforce|rtx|gtx|radeon|apple m|apple a1[5-9]|apple gpu/i.test(gpuRenderer);

      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.loseContext();
    }
  } catch {
    // Ignore WebGL detection error
  }

  let tier = 'medium';

  if (isSoftwareGpu || isSlowConnection || (isMobile && (memory <= 3 || cores <= 4))) {
    tier = 'low';
  } else if (!isMobile && isDedicatedGpu && cores >= 6 && memory >= 6) {
    tier = 'high';
  } else if (isMobile && (isDedicatedGpu || (cores >= 8 && memory >= 6))) {
    tier = 'medium';
  } else if (isIntegratedGpu) {
    tier = 'medium';
  } else {
    tier = 'medium';
  }

  cachedTier = {
    tier,
    isMobile,
    isLowEnd: tier === 'low',
    maxPixelRatio: tier === 'high' ? Math.min(window.devicePixelRatio || 1, 1.35) : 1.0,
    enableShadows: tier === 'high',
    enablePMREM: tier !== 'low',
    preloadAlternateModel: tier === 'high',
  };

  return cachedTier;
}
