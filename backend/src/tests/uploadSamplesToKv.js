const fs = require('fs');
const path = require('path');
const https = require('https');

const samples = [
  'sample_cotton.png',
  'sample_denim.png',
  'sample_linen.png',
  'sample_silk.png',
  'sample_wool.png'
];

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

async function uploadFile(filename) {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist`);
    return;
  }
  
  console.log(`Reading ${filename}...`);
  const buffer = fs.readFileSync(filePath);
  const base64Data = buffer.toString('base64');
  const mimeType = 'image/png';
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  
  const kvKey = `img_${filename}`;
  console.log(`Uploading ${filename} to https://kvdb.io/tcdakshbucket92929292/${kvKey}...`);
  
  return new Promise((resolve, reject) => {
    const req = https.request(`https://kvdb.io/tcdakshbucket92929292/${kvKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        'Content-Length': Buffer.byteLength(dataUrl)
      }
    }, (res) => {
      if (res.statusCode === 200) {
        console.log(`Successfully uploaded ${filename}`);
        resolve();
      } else {
        reject(new Error(`Failed to upload ${filename}. Status: ${res.statusCode}`));
      }
    });
    req.on('error', reject);
    req.write(dataUrl);
    req.end();
  });
}

async function run() {
  try {
    for (const sample of samples) {
      await uploadFile(sample);
    }
    console.log('All samples successfully uploaded to KV store!');
  } catch (err) {
    console.error('Error uploading samples:', err);
  }
}

run();
