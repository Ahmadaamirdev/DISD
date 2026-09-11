const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'nol4eyyl',
  secure: true
});

const PRESET = 'yine2gxn';
const ASSETS_DIR = path.join(__dirname, '../frontend/public/assets');
const FRONTEND_MAP = path.join(__dirname, '../frontend/src/data/cloudinaryAssets.json');
const BACKEND_MAP = path.join(__dirname, '../backend/data/cloudinaryAssets.json');

const modelsToOptimize = [
  'tripo_pbr_model_003af8d7-9e6e-4ee6-a122-b9971804e582_meshopt.glb',
  'tripo_pbr_model_056f077c-e0e5-4fc8-9e06-1e2d0d78fbd2_meshopt.glb',
  'tripo_pbr_model_67a24335-d80a-4bef-978a-3c607204e711_meshopt.glb',
  'tripo_base_model_384f6ea7-7cd5-40dd-8e0f-d5c22654ab44_meshopt.glb'
];

async function main() {
  let frontendMap = JSON.parse(fs.readFileSync(FRONTEND_MAP, 'utf8'));

  for (const fileName of modelsToOptimize) {
    const inputPath = path.join(ASSETS_DIR, fileName);
    const optimizedTempPath = path.join(ASSETS_DIR, `opt_${fileName}`);
    
    console.log(`\n======================================================`);
    console.log(`Optimizing: ${fileName}`);
    const beforeBytes = fs.statSync(inputPath).size;
    const beforeMB = (beforeBytes / (1024 * 1024)).toFixed(2);
    console.log(`Original Size: ${beforeMB} MB`);

    // 1. Optimize GLB: 2048 textures, mesh simplification with 0.0005 error tolerance, meshopt compression
    const optCmd = `npx --yes @gltf-transform/cli optimize "${inputPath}" "${optimizedTempPath}" --compress meshopt --texture-size 2048 --texture-compress auto --simplify true --simplify-ratio 0.25 --simplify-error 0.0005`;
    execSync(optCmd, { stdio: 'inherit' });

    const afterBytes = fs.statSync(optimizedTempPath).size;
    const afterMB = (afterBytes / (1024 * 1024)).toFixed(2);
    console.log(`Optimized Size: ${afterMB} MB (${Math.round((1 - afterBytes / beforeBytes) * 100)}% reduction)`);

    // 2. Upload to Cloudinary
    const baseName = path.parse(fileName).name;
    const newPublicId = `disd_assets/${baseName}_v2.glb`;
    console.log(`Uploading to Cloudinary: ${newPublicId}...`);

    const result = await cloudinary.uploader.unsigned_upload(optimizedTempPath, PRESET, {
      resource_type: 'raw',
      public_id: newPublicId
    });

    console.log(`✓ Cloudinary Uploaded -> ${result.secure_url} (${result.bytes} bytes)`);

    // 3. Update mapping in frontend and backend
    frontendMap[fileName] = result.secure_url;

    // 4. Overwrite local file with optimized version and clean up temp
    fs.copyFileSync(optimizedTempPath, inputPath);
    fs.unlinkSync(optimizedTempPath);
    console.log(`✓ Replaced local file with optimized build.`);
  }

  // Save synced maps
  const jsonContent = JSON.stringify(frontendMap, null, 2);
  fs.writeFileSync(FRONTEND_MAP, jsonContent, 'utf8');
  fs.writeFileSync(BACKEND_MAP, jsonContent, 'utf8');
  console.log(`\n======================================================`);
  console.log(`✓ All mappings synced between Frontend and Backend!`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
