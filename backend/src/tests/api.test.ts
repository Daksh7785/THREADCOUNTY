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

    // Extract a report ID for downstream tests
    const testReportId = adminReportsData.reports[0]?.id;

    // Test 10: Input validation failure check
    console.log('Test 10: Input validation failure check...');
    const invalidLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' })
    });
    const invalidLoginData = await invalidLoginRes.json() as any;
    if (invalidLoginRes.status !== 400 || invalidLoginData.success !== false || !invalidLoginData.details) {
      throw new Error(`Validation failure check failed: status ${invalidLoginRes.status}, data: ${JSON.stringify(invalidLoginData)}`);
    }
    console.log('✅ Input validation failure check passed.');

    // Test 11: Notification endpoints
    console.log('Test 11: Notification list and preference endpoints...');
    const notifListRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const notifListData = await notifListRes.json() as any;
    if (notifListRes.status !== 200 || !Array.isArray(notifListData.notifications)) {
      throw new Error(`Notification listing failed: status ${notifListRes.status}, data: ${JSON.stringify(notifListData)}`);
    }

    const notifPrefRes = await fetch(`${BASE_URL}/api/notifications/preferences`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const notifPrefData = await notifPrefRes.json() as any;
    if (notifPrefRes.status !== 200 || notifPrefData.preferences.email_on_analysis_complete === undefined) {
      throw new Error(`Get notification preferences failed: status ${notifPrefRes.status}, data: ${JSON.stringify(notifPrefData)}`);
    }

    const updatePrefRes = await fetch(`${BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email_newsletter: true })
    });
    const updatePrefData = await updatePrefRes.json() as any;
    if (updatePrefRes.status !== 200 || updatePrefData.preferences.email_newsletter !== true) {
      throw new Error(`Update notification preferences failed: status ${updatePrefRes.status}, data: ${JSON.stringify(updatePrefData)}`);
    }
    console.log('✅ Notification endpoints passed.');

    // Test 12: PDF Report Generation download
    if (testReportId) {
      console.log(`Test 12: PDF Report download for report ID ${testReportId}...`);
      const downloadRes = await fetch(`${BASE_URL}/api/report/${testReportId}/download?format=pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (downloadRes.status !== 200 || downloadRes.headers.get('Content-Type') !== 'application/pdf') {
        throw new Error(`PDF Download failed: status ${downloadRes.status}, Content-Type: ${downloadRes.headers.get('Content-Type')}`);
      }
      console.log('✅ PDF Report download passed.');
    } else {
      console.log('Test 12: PDF Report download (SKIPPED — no reports seeded).');
    }

    // Test 13: Admin paginated user directory
    console.log('Test 13: Admin paginated user list...');
    const userDirRes = await fetch(`${BASE_URL}/api/admin/users?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const userDirData = await userDirRes.json() as any;
    if (userDirRes.status !== 200 || !userDirData.pagination || userDirData.pagination.limit !== 2) {
      throw new Error(`Admin paginated users failed: status ${userDirRes.status}, data: ${JSON.stringify(userDirData)}`);
    }
    console.log('✅ Admin paginated user list passed.');

    // Test 14: Admin impersonation & audit logs
    console.log('Test 14: Impersonation and Audit Logs...');
    const impersonateRes = await fetch(`${BASE_URL}/api/admin/impersonate/u-free-seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    const impersonateData = await impersonateRes.json() as any;
    if (impersonateRes.status !== 200 || !impersonateData.token || impersonateData.user.email !== 'demo.free@threadcounty.app') {
      throw new Error(`Impersonation failed: status ${impersonateRes.status}, data: ${JSON.stringify(impersonateData)}`);
    }

    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const auditData = await auditRes.json() as any;
    if (auditRes.status !== 200 || !Array.isArray(auditData.logs) || auditData.logs.length === 0) {
      throw new Error(`Audit log retrieval failed: status ${auditRes.status}, data: ${JSON.stringify(auditData)}`);
    }
    console.log('✅ Impersonation and Audit Logs passed.');

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
