const axios = require('axios');

async function runTests() {
  const baseURL = 'http://localhost:5000/api';
  console.log('🧪 Starting WebsiteScout Backend API Verification Tests...\n');

  try {
    // 1. Health check
    console.log('1️⃣ Testing Health Endpoint...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Health Response:', health.data);

    // 2. Search endpoint
    console.log('\n2️⃣ Testing POST /api/search (category: "bookshops", area: "Kurunegala")...');
    const searchRes = await axios.post(`${baseURL}/search`, {
      category: 'bookshops',
      area: 'Kurunegala',
      bypassCache: true
    });
    console.log(`✅ Search Success! Source: ${searchRes.data.meta.source}`);
    console.log(`   Total Found: ${searchRes.data.meta.totalFound}, No Website Leads: ${searchRes.data.meta.noWebsiteCount}`);
    
    if (searchRes.data.data.length === 0) {
      throw new Error('No leads returned by search!');
    }
    const sampleLead = searchRes.data.data[0];
    console.log(`   Sample Lead: "${sampleLead.name}" | Website: ${sampleLead.hasWebsite ? sampleLead.websiteUrl : 'NONE (QUALIFIED)'} | Status: ${sampleLead.status}`);

    // 3. Get businesses with filter
    console.log('\n3️⃣ Testing GET /api/businesses (hasWebsite: false)...');
    const businessesRes = await axios.get(`${baseURL}/businesses`, {
      params: { hasWebsite: false, area: 'Kurunegala' }
    });
    console.log(`✅ Fetched ${businessesRes.data.data.length} businesses matching filter.`);

    // 4. Update status
    console.log(`\n4️⃣ Testing PATCH /api/businesses/${sampleLead._id}/status to "contacted"...`);
    const statusRes = await axios.patch(`${baseURL}/businesses/${sampleLead._id}/status`, {
      status: 'contacted'
    });
    console.log(`✅ Status updated to: ${statusRes.data.data.status} (contactedAt: ${statusRes.data.data.contactedAt})`);

    // 5. Update notes
    console.log(`\n5️⃣ Testing PATCH /api/businesses/${sampleLead._id}/notes...`);
    const notesRes = await axios.patch(`${baseURL}/businesses/${sampleLead._id}/notes`, {
      notes: 'Spoke with manager - requested website quote and package details.'
    });
    console.log(`✅ Notes updated to: "${notesRes.data.data.notes}"`);

    // 6. CSV Export
    console.log('\n6️⃣ Testing GET /api/businesses/export...');
    const exportRes = await axios.get(`${baseURL}/businesses/export`, {
      params: { area: 'Kurunegala' }
    });
    console.log('✅ CSV Export received! Size:', exportRes.data.length, 'bytes');
    console.log('   CSV Sample Header & Row:\n' + exportRes.data.split('\n').slice(0, 3).join('\n'));

    // 7. Analytics Dashboard
    console.log('\n7️⃣ Testing GET /api/analytics/dashboard...');
    const dashRes = await axios.get(`${baseURL}/analytics/dashboard`);
    console.log('✅ Dashboard Analytics:', JSON.stringify(dashRes.data.data.summary, null, 2));

    // 8. Auth Register & Login
    console.log('\n8️⃣ Testing Authentication (Register & Login)...');
    const testEmail = `tester_${Date.now()}@agency.com`;
    const regRes = await axios.post(`${baseURL}/auth/register`, {
      name: 'Sarah Connor',
      email: testEmail,
      password: 'password123',
      agencyName: 'Future Web Solutions'
    });
    console.log(`✅ User Registered: ${regRes.data.user.name} (${regRes.data.user.email}) | Token: ${regRes.data.token.slice(0, 20)}...`);

    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    console.log(`✅ Login Verified! User: ${loginRes.data.user.name}`);

    console.log('\n🎉 ALL BACKEND API ENDPOINT VERIFICATION TESTS PASSED SUCCESSFULLY! 🚀');
  } catch (err) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
