const base = process.env.API_BASE_URL || 'http://localhost:8000';

(async () => {
  try {
    let accessToken = process.env.ACCESS_TOKEN || null;

    if (!accessToken && process.env.AUTH_EMAIL && process.env.AUTH_PASSWORD) {
      console.log('Attempting login with provided credentials...');
      const loginRes = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: process.env.AUTH_EMAIL, password: process.env.AUTH_PASSWORD }),
      });
      console.log('  login status:', loginRes.status);
      const loginJson = await loginRes.json();
      console.log('  login body:', JSON.stringify(loginJson, null, 2));
      accessToken = loginJson?.access_token || null;
    }

    if (!accessToken) {
      console.log('No access token available. You can set ACCESS_TOKEN env var or AUTH_EMAIL/AUTH_PASSWORD. Proceeding without token...');
    } else {
      console.log('Using access token (length):', accessToken.length);
    }

    const headersBase = { 'Content-Type': 'application/json' };
    if (accessToken) headersBase['Authorization'] = `Bearer ${accessToken}`;

    console.log('\nGET /docs ->', `${base}/docs`);
    let res = await fetch(`${base}/docs`, { method: 'GET' });
    console.log('  status:', res.status);

    // Test POST /predict
    const predictBody = { ph: 6.5, crop: 'tomate', latitud: 4.6, longitud: -74.08 };
    console.log('\nPOST /predict ->', `${base}/predict`);
    res = await fetch(`${base}/predict`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify(predictBody),
    });
    console.log('  status:', res.status);
    try { console.log('  body:', JSON.stringify(await res.json(), null, 2)); } catch (e) { console.log('  non-json body'); }

    // Test POST /generate-recipe
    const recipeBody = { week: 2, tank_liters: 100, ph_water: 6.0, crop: 'lechuga', lat:4.6, long:-74.08 };
    console.log('\nPOST /generate-recipe ->', `${base}/generate-recipe`);
    res = await fetch(`${base}/generate-recipe`, {
      method: 'POST',
      headers: headersBase,
      body: JSON.stringify(recipeBody),
    });
    console.log('  status:', res.status);
    try { console.log('  body:', JSON.stringify(await res.json(), null, 2)); } catch (e) { console.log('  non-json body'); }

    // Test GET /auth/me if we have token
    if (accessToken) {
      console.log('\nGET /auth/me ->', `${base}/auth/me`);
      res = await fetch(`${base}/auth/me`, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}` } });
      console.log('  status:', res.status);
      try { console.log('  body:', JSON.stringify(await res.json(), null, 2)); } catch (e) { console.log('  non-json body'); }
    }

    console.log('\nDone');
  } catch (err) {
    console.error('Error in auth test:', err);
    process.exitCode = 1;
  }
})();
