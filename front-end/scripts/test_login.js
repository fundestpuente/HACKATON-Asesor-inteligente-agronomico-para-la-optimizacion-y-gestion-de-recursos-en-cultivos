const base = 'http://192.168.100.31:8000';

(async () => {
  try {
    console.log('🔐 Testing Login');
    console.log('Base URL:', base);

    // Test 1: Login con UserTest/andres
    const loginBody = {
      username: 'UserTest',
      password: 'andres',
    };

    console.log('\n📝 POST /auth/login');
    console.log('  Username:', loginBody.username);
    console.log('  Password:', loginBody.password);

    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginBody),
    });

    console.log('\n  Status:', res.status);

    try {
      const json = await res.json();
      console.log('  Response:', JSON.stringify(json, null, 2));

      if (res.status === 200 && json.access_token) {
        console.log('\n✅ Login exitoso!');
        console.log('Token:', json.access_token.substring(0, 20) + '...');

        // Ahora probar crear un cultivo
        const cropBody = {
          name: 'Test Crop',
          crop_type: 'tomate',
          planting_date: '2025-12-17T00:00:00Z',
        };

        console.log('\n🌾 POST /crops');
        console.log('  Body:', JSON.stringify(cropBody, null, 2));

        const cropRes = await fetch(`${base}/crops`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${json.access_token}`,
          },
          body: JSON.stringify(cropBody),
        });

        console.log('\n  Status:', cropRes.status);

        try {
          const cropJson = await cropRes.json();
          console.log('  Response:', JSON.stringify(cropJson, null, 2));
        } catch (e) {
          const txt = await cropRes.text();
          console.log('  Response text:', txt);
        }
      }
    } catch (e) {
      const txt = await res.text();
      console.log('  Non-JSON Response:', txt);
    }

    console.log('\n✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  }
})();
