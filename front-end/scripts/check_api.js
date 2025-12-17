// Simple connectivity check to backend /docs
const base = process.env.API_BASE_URL || 'http://localhost:8000';

(async () => {
  try {
    const res = await fetch(`${base}/docs`, { method: 'GET' });
    console.log(`GET ${base}/docs -> status: ${res.status}`);
    const text = await res.text();
    console.log('Response length:', text.length);
  } catch (err) {
    console.error('Error connecting to backend:', err.message || err);
    process.exit(1);
  }
})();
