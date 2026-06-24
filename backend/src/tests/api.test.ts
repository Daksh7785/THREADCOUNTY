import { spawn, ChildProcess } from 'child_process';
import path from 'path';

const TEST_PORT = '5002';
const BASE_URL = `http://localhost:${TEST_PORT}`;

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('🧪 Starting ThreadCounty API Integration Tests...');
  let serverProcess: ChildProcess | null = null;

  try {
    // 1. Spawn backend server on a custom test port
    const indexJsPath = path.resolve(__dirname, '..', 'index.js');
    console.log(`🚀 Spawning test server from: ${indexJsPath}`);
    
    serverProcess = spawn('node', [indexJsPath], {
      env: {
        ...process.env,
        PORT: TEST_PORT,
        NODE_ENV: 'test'
      },
      stdio: 'pipe'
    });

    // Capture logs to print if needed or to wait for startup
    serverProcess.stdout?.on('data', (data) => {
      // Uncomment to debug server logs during test
      // console.log(`[Server Log] ${data}`);
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`[Server Error] ${data}`);
    });

    // Wait 2 seconds for server to boot up
    await delay(2000);

    console.log('\n--- Running Assertions ---');

    // Test 1: Health check
    console.log('Test 1: Health check endpoint...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json() as any;
    if (healthRes.status !== 200 || healthData.status !== 'healthy') {
      throw new Error(`Health check failed: status ${healthRes.status}, data: ${JSON.stringify(healthData)}`);
    }
    console.log('✅ Health check passed.');

    // Test 2: SEO Robots.txt
    console.log('Test 2: Robots.txt...');
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    const robotsText = await robotsRes.text();
    if (robotsRes.status !== 200 || !robotsText.includes('User-agent')) {
      throw new Error(`Robots.txt failed: status ${robotsRes.status}`);
    }
    console.log('✅ Robots.txt passed.');

    // Test 3: SEO Sitemap.xml
    console.log('Test 3: Sitemap.xml...');
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    if (sitemapRes.status !== 200 || !sitemapText.includes('<urlset')) {
      throw new Error(`Sitemap.xml failed: status ${sitemapRes.status}`);
    }
    console.log('✅ Sitemap.xml passed.');

    // Test 4: Auth Login (Correct credentials)
    console.log('Test 4: Admin login with seeded credentials...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@threadcounty.app', password: 'Demo@1234' })
    });
    const loginData = await loginRes.json() as any;
    if (loginRes.status !== 200 || !loginData.token || loginData.user.role !== 'admin') {
      throw new Error(`Auth login failed: status ${loginRes.status}, data: ${JSON.stringify(loginData)}`);
    }
    const token = loginData.token;
    console.log('✅ Auth login passed.');

    // Test 5: Auth Login (Incorrect credentials)
    console.log('Test 5: Login rejection for invalid credentials...');
    const badLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@threadcounty.app', password: 'wrongpassword' })
    });
    const badLoginData = await badLoginRes.json() as any;
    if (badLoginRes.status !== 401 && badLoginRes.status !== 400) {
      throw new Error(`Auth login rejection failed: status ${badLoginRes.status}, data: ${JSON.stringify(badLoginData)}`);
    }
    console.log('✅ Auth rejection passed.');

    // Test 6: Get profile with token
    console.log('Test 6: Fetch profile with auth token...');
    const profileRes = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profileData = await profileRes.json() as any;
    if (profileRes.status !== 200 || profileData.email !== 'admin@threadcounty.app') {
      throw new Error(`Profile fetch failed: status ${profileRes.status}, data: ${JSON.stringify(profileData)}`);
    }
    console.log('✅ Profile fetch passed.');

    // Test 7: Fetch admin stats
    console.log('Test 7: Admin stats view...');
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const statsData = await statsRes.json() as any;
    if (statsRes.status !== 200 || statsData.totalUsers === undefined || statsData.activePlans === undefined) {
      throw new Error(`Admin stats failed: status ${statsRes.status}, data: ${JSON.stringify(statsData)}`);
    }
    console.log('✅ Admin stats passed.');

    // Test 8: Submit contact form
    console.log('Test 8: Contact form submission...');
    const contactRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester',
        email: 'test@example.com',
        subject: 'Automated Test',
        message: 'This is a message from the automated integration test suite.'
      })
    });
    const contactData = await contactRes.json() as any;
    if (contactRes.status !== 201 && contactRes.status !== 200) {
      throw new Error(`Contact form failed: status ${contactRes.status}, data: ${JSON.stringify(contactData)}`);
    }
    console.log('✅ Contact form passed.');

    // Test 9: Fetch admin reports
    console.log('Test 9: Admin reports inbox view...');
    const adminReportsRes = await fetch(`${BASE_URL}/api/admin/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const adminReportsData = await adminReportsRes.json() as any;
    if (adminReportsRes.status !== 200 || !Array.isArray(adminReportsData.reports)) {
      throw new Error(`Admin reports failed: status ${adminReportsRes.status}, data: ${JSON.stringify(adminReportsData)}`);
    }
    console.log('✅ Admin reports passed.');

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉');
    cleanup(serverProcess, 0);

  } catch (error: any) {
    console.error(`\n❌ TEST FAILURE: ${error.message}`);
    cleanup(serverProcess, 1);
  }
}

function cleanup(serverProcess: ChildProcess | null, exitCode: number) {
  if (serverProcess) {
    console.log('🛑 Shutting down test backend server...');
    const killed = serverProcess.kill('SIGTERM');
    if (!killed) {
      serverProcess.kill('SIGKILL');
    }
  }
  process.exit(exitCode);
}

runTests();
