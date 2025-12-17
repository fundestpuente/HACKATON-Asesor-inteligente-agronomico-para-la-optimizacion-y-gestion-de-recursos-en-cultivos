const base = process.env.API_BASE_URL || 'http://192.168.100.31:8000';

(async () => {
  try {
    // Primero, hacer login para obtener token
    console.log('🔐 Testing Crop Creation');
    console.log('Base URL:', base);

    // Login payload
    const loginBody = {
      username: 'testuser',
      password: 'TestPass123',
    };

    console.log('\n📝 POST /auth/login');
    console.log('  Body:', JSON.stringify(loginBody, null, 2));

    let res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginBody),
    });

    console.log('  Status:', res.status);

    if (res.status !== 200) {
      const errorText = await res.text();
      console.log('  Error:', errorText);
      return;
    }

    const authData = await res.json();
    const token = authData.access_token;
    console.log('  ✅ Token obtenido');

    // Ahora crear un cultivo
    const cropBody = {
      name: 'Mi Primer Cultivo',
      crop_type: 'tomate',
      area: 50,
      location_lat: 4.7110,
      location_long: -74.0721,
      planting_date: '2025-12-17T00:00:00Z',
      notes: 'Cultivo de prueba',
    };

    console.log('\n🌾 POST /crops');
    console.log('  Body:', JSON.stringify(cropBody, null, 2));

    res = await fetch(`${base}/crops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(cropBody),
    });

    console.log('  Status:', res.status);

    try {
      const json = await res.json();
      console.log('  Response:', JSON.stringify(json, null, 2));
    } catch (e) {
      const txt = await res.text();
      console.log('  Response text:', txt);
    }

    console.log('\n✅ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exitCode = 1;
  }
})();
