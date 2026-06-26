import fs from 'fs';
import path from 'path';

const API_BASE = 'https://backend-sigma-liard-92.vercel.app/api';

async function testUploads() {
  console.log('🧪 Starting Fabric Uploads Verification Test...');

  // 1. Authenticate
  console.log('🔑 Logging in as Pam Professional...');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo.pro@threadcounty.app', password: 'Demo@1234' })
  });

  if (!loginRes.ok) {
    console.error('❌ Failed to authenticate:', await loginRes.text());
    return;
  }

  const { token } = await loginRes.json() as any;
  console.log('✅ Authenticated successfully.');

  // 2. Prepare files
  const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');
  const filesToUpload = [
    { name: 'sample_cotton.png', original: 'cotton_shirting.png' },
    { name: 'sample_denim.png', original: 'raw_denim_micro.png' },
    { name: 'sample_linen.png', original: 'linen_weave_opt.png' },
    { name: 'sample_silk.png', original: 'satin_weave_fine.png' },
    { name: 'sample_wool.png', original: 'merino_wool_heavy.png' },
    { name: 'generated_cotton_micro.png', original: 'generated_cotton_micro.png' },
    { name: 'generated_denim_micro.png', original: 'generated_denim_micro.png' }
  ];

  console.log(`📂 Scanning uploads directory: ${uploadsDir}`);

  for (const fileInfo of filesToUpload) {
    const filePath = path.join(uploadsDir, fileInfo.name);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ File ${fileInfo.name} not found, skipping.`);
      continue;
    }

    console.log(`\n📤 Uploading ${fileInfo.name} (${fs.statSync(filePath).size} bytes)...`);

    try {
      // Read file into Buffer
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer], { type: 'image/png' });

      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, fileInfo.original);

      // Upload file
      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: status ${uploadRes.status}, error: ${await uploadRes.text()}`);
      }

      const uploadData = await uploadRes.json() as any;
      const uploadId = uploadData.upload.id;
      console.log(`✅ Upload success! ID: ${uploadId}`);

      // Analyze image
      console.log(`🧠 Triggering AI vision analysis for upload ID: ${uploadId}...`);
      const analyzeRes = await fetch(`${API_BASE}/report/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ uploadId })
      });

      if (!analyzeRes.ok) {
        throw new Error(`Analysis failed: status ${analyzeRes.status}, error: ${await analyzeRes.text()}`);
      }

      const analyzeData = await analyzeRes.json() as any;
      console.log(`🎉 Analysis Complete:`);
      console.log(`   - Fabric Type: ${analyzeData.report.fabric_type}`);
      console.log(`   - Warp Count: ${analyzeData.report.warp_count} TPI`);
      console.log(`   - Weft Count: ${analyzeData.report.weft_count} TPI`);
      console.log(`   - Total Density: ${analyzeData.report.thread_density} TPI²`);
      console.log(`   - AI Confidence: ${(analyzeData.report.confidence * 100).toFixed(1)}%`);

    } catch (err: any) {
      console.error(`❌ Error processing ${fileInfo.name}:`, err.message);
    }
  }

  console.log('\n🏁 Fabric Upload verification run finished.');
}

testUploads();
