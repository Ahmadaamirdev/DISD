const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'nol4eyyl',
  secure: true
});

const ASSETS_DIR = path.join(__dirname, '../frontend/public/assets');
const VIDEOS_DIR = path.join(__dirname, '../frontend/public/videos');
const FRONTEND_OUTPUT = path.join(__dirname, '../frontend/src/data/cloudinaryAssets.json');
const BACKEND_OUTPUT = path.join(__dirname, '../backend/data/cloudinaryAssets.json');
const PRESET = 'yine2gxn';

async function uploadFile(filePath, fileName) {
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

function saveMap(map) {
  const jsonContent = JSON.stringify(map, null, 2);
  fs.writeFileSync(FRONTEND_OUTPUT, jsonContent, 'utf8');
  
  // Ensure backend data directory exists and sync mapping
  const backendDir = path.dirname(BACKEND_OUTPUT);
  if (!fs.existsSync(backendDir)) {
    fs.mkdirSync(backendDir, { recursive: true });
  }
  fs.writeFileSync(BACKEND_OUTPUT, jsonContent, 'utf8');
}

async function run() {
  const targetFiles = [];

  if (fs.existsSync(ASSETS_DIR)) {
    fs.readdirSync(ASSETS_DIR).forEach(f => {
      const full = path.join(ASSETS_DIR, f);
      if (fs.statSync(full).isFile()) {
        targetFiles.push({ name: f, path: full });
      }
    });
  }

  if (fs.existsSync(VIDEOS_DIR)) {
    fs.readdirSync(VIDEOS_DIR).forEach(f => {
      const full = path.join(VIDEOS_DIR, f);
      if (fs.statSync(full).isFile()) {
        targetFiles.push({ name: f, path: full });
      }
    });
  }

  console.log(`Found ${targetFiles.length} total asset files across assets & videos.`);

  let map = {};
  if (fs.existsSync(FRONTEND_OUTPUT)) {
    try {
      map = JSON.parse(fs.readFileSync(FRONTEND_OUTPUT, 'utf8'));
    } catch (e) {}
  }

  for (let i = 0; i < targetFiles.length; i++) {
    const { name, path: filePath } = targetFiles[i];
    if (map[name]) {
      console.log(`[${i + 1}/${targetFiles.length}] Skipping already uploaded: ${name}`);
      continue;
    }

    let success = false;
    let retries = 3;
    while (!success && retries > 0) {
      try {
        console.log(`[${i + 1}/${targetFiles.length}] Starting: ${name}`);
        const url = await uploadFile(filePath, name);
        map[name] = url;
        saveMap(map);
        success = true;
      } catch (err) {
        retries--;
        console.error(`Error uploading ${name}:`, err.message || err);
        if (retries > 0) {
          console.log(`Retrying in 3s (${retries} attempts left)...`);
          await new Promise(r => setTimeout(r, 3000));
        } else {
          console.error(`FAILED permanently: ${name}`);
        }
      }
    }
  }

  saveMap(map);
  console.log('\nAll uploads finished! Total assets in map:', Object.keys(map).length);
}

run().catch(console.error);
