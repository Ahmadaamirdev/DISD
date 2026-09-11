/**
 * Device Tier & WebGL Capability Detection Utility
 * 
 * Accurately classifies client hardware into 'high', 'medium', 'low', or 'fallback' performance tiers.
 * Uses multi-signal hardware profiling:
 * - CPU Concurrency (navigator.hardwareConcurrency)
 * - Device Memory (navigator.deviceMemory)
 * - GPU Architecture & Vendor (WEBGL_debug_renderer_info)
 * - WebGL Capabilities (MAX_TEXTURE_SIZE, MAX_RENDERBUFFER_SIZE)
 * - Network Constraints (SaveData / Effective Type)
 * - Screen Pixel Density & Touch/Mobile Form Factor
 */

let cachedTier = null;

export function getDeviceTier() {
  if (cachedTier) return cachedTier;

  if (typeof window === 'undefined') {
    return {
      tier: 'high',
      quality: 'high',
      isMobile: false,
      isLowEnd: false,
      isFallback: false,
      maxPixelRatio: 1.0,
      enableShadows: true,
      enablePMREM: true,
      preloadAlternateModel: false,
      maxTextureSize: 8192,
    };
  }

  const isMobile = window.innerWidth < 1024 || window.matchMedia('(pointer: coarse)').matches;
  const memory = navigator.deviceMemory || 4; // GB (if supported)
  const cores = navigator.hardwareConcurrency || 4;
  
  // Check network connection constraints
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection ? (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === '3g') : false;

  // Multi-signal WebGL GPU Query
  let gpuRenderer = '';
  let isSoftwareGpu = false;
  let isIntegratedGpu = false;
  let isDedicatedGpu = false;
  let maxTextureSize = 4096;
  let maxRenderBufferSize = 4096;
  let hasWebgl = false;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const gl = canvas.getContext('webgl', { powerPreference: 'default' }) || canvas.getContext('experimental-webgl');
    
    if (gl) {
      hasWebgl = true;
      maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
      maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) || 4096;

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
      }
      
      isSoftwareGpu = /swiftshader|llvmpipe|software|virtualbox|mesa generic/i.test(gpuRenderer);
      isIntegratedGpu = /intel|mali-4|mali-t|mali-g5|adreno \(tm\) [345]|powervr/i.test(gpuRenderer);
      isDedicatedGpu = /nvidia|geforce|rtx|gtx|radeon|apple m|apple a1[5-9]|apple gpu/i.test(gpuRenderer);

      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.loseContext();
    }
  } catch {
    hasWebgl = false;
  }

  let tier = 'medium';

  if (!hasWebgl || isSoftwareGpu) {
    tier = 'fallback';
  } else if (isSlowConnection || maxTextureSize < 4096 || (isMobile && (memory <= 3 || cores <= 4))) {
    tier = 'low';
  } else if (!isMobile && isDedicatedGpu && cores >= 6 && memory >= 6 && maxTextureSize >= 8192) {
    tier = 'high';
  } else if (isMobile && (isDedicatedGpu || (cores >= 8 && memory >= 6))) {
    tier = 'medium';
  } else if (isIntegratedGpu) {
    tier = cores <= 4 || memory <= 4 ? 'low' : 'medium';
  } else {
    tier = 'medium';
  }

  const quality = tier === 'fallback' ? 'fallback' : tier;

  cachedTier = {
    tier,
    quality,
    isMobile,
    isLowEnd: tier === 'low' || tier === 'fallback',
    isFallback: tier === 'fallback',
    maxPixelRatio: tier === 'high' ? Math.min(window.devicePixelRatio || 1, 1.35) : (tier === 'low' ? 0.85 : 1.0),
    enableShadows: tier === 'high',
    enablePMREM: tier === 'high' || tier === 'medium',
    preloadAlternateModel: tier === 'high',
    maxTextureSize,
    maxRenderBufferSize,
    gpuRenderer,
  };

  return cachedTier;
}

export default getDeviceTier;
