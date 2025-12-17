const base = process.env.API_BASE_URL || 'http://localhost:8000';

(async () => {
  try {
    console.log('GET /docs ->', `${base}/docs`);
    let res = await fetch(`${base}/docs`, { method: 'GET' });
    console.log('  status:', res.status);

    // Test POST /predict
    const predictBody = { ph: 6.5, crop: 'tomate', latitud: 4.6, longitud: -74.08 };
    console.log('\nPOST /predict ->', `${base}/predict`);
    res = await fetch(`${base}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(predictBody),
    });
    console.log('  status:', res.status);
    try {
      const json = await res.json();
      console.log('  body:', JSON.stringify(json, null, 2));
    } catch (e) {
      const txt = await res.text();
      console.log('  non-json body length:', txt.length);
    }

    // Test POST /generate-recipe
    const recipeBody = { week: 2, tank_liters: 100, ph_water: 6.0, crop: 'lechuga', lat:4.6, long:-74.08 };
    console.log('\nPOST /generate-recipe ->', `${base}/generate-recipe`);
    res = await fetch(`${base}/generate-recipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipeBody),
    });
    console.log('  status:', res.status);
    try {
      const json = await res.json();
      console.log('  body:', JSON.stringify(json, null, 2));
    } catch (e) {
      const txt = await res.text();
      console.log('  non-json body length:', txt.length);
    }

    console.log('\nDone');
  } catch (err) {
    console.error('Error testing endpoints:', err);
    process.exitCode = 1;
  }
})();
