const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'nol4eyyl',
  secure: true
});

const ASSETS_DIR = path.join(__dirname, '../frontend/public/assets');
const OUTPUT_FILE = path.join(__dirname, '../frontend/src/data/cloudinaryAssets.json');
const PRESET = 'yine2gxn';

async function uploadFile(fileName) {
  const filePath = path.join(ASSETS_DIR, fileName);
  const ext = path.extname(fileName).toLowerCase();

  let resource_type = 'image';
  if (ext === '.mp4' || ext === '.webm' || ext === '.mov') {
    resource_type = 'video';
  } else if (ext === '.glb' || ext === '.gltf' || ext === '.bin') {
    resource_type = 'raw';
  }

  const cleanName = path.parse(fileName).name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const public_id = resource_type === 'raw' 
    ? `disd_assets/${fileName}`
    : `disd_assets/${cleanName}`;

  console.log(`Uploading [${resource_type}] ${fileName}...`);

  const options = {
    resource_type,
    public_id
  };

  const result = await cloudinary.uploader.unsigned_upload(filePath, PRESET, options);
  console.log(`✓ Uploaded ${fileName} -> ${result.secure_url}`);
  return result.secure_url;
}

async function run() {
  const files = fs.readdirSync(ASSETS_DIR);
  console.log(`Found ${files.length} assets to upload to Cloudinary.`);

  let map = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      map = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch (e) {}
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (map[file]) {
      console.log(`[${i + 1}/${files.length}] Skipping already uploaded: ${file}`);
      continue;
    }

    let success = false;
    let retries = 3;
    while (!success && retries > 0) {
      try {
        console.log(`[${i + 1}/${files.length}] Starting: ${file}`);
        const url = await uploadFile(file);
        map[file] = url;
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(map, null, 2), 'utf8');
        success = true;
      } catch (err) {
        retries--;
        console.error(`Error uploading ${file}:`, err.message || err);
        if (retries > 0) {
          console.log(`Retrying in 3s (${retries} attempts left)...`);
          await new Promise(r => setTimeout(r, 3000));
        } else {
          console.error(`FAILED permanently: ${file}`);
        }
      }
    }
  }

  console.log('\nAll uploads finished! Total assets in map:', Object.keys(map).length);
}

run().catch(console.error);
