import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve(process.cwd(), 'data', 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'openfarm-cache.json');

type OpenFarmCrop = any;

async function ensureCache() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }

  try {
    await fs.access(CACHE_FILE);
  } catch (err) {
    await fs.writeFile(CACHE_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
}

async function readCache(): Promise<Record<string, any>> {
  await ensureCache();
  const raw = await fs.readFile(CACHE_FILE, 'utf-8');
  try {
    return JSON.parse(raw || '{}');
  } catch (err) {
    return {};
  }
}

async function writeCache(obj: Record<string, any>) {
  await ensureCache();
  await fs.writeFile(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
}

export async function fetchFromOpenFarm(name: string): Promise<OpenFarmCrop | null> {
  const q = encodeURIComponent(name);
  const url = `https://openfarm.cc/api/v1/crops/?filter=${q}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const body = await res.json();
    if (body && Array.isArray(body.data) && body.data.length > 0) {
      return body.data[0];
    }
    return null;
  } catch (err) {
    return null;
  }
}

function mapOpenFarmToCrop(open: OpenFarmCrop) {
  if (!open) return null;
  const attributes = open.attributes || {};

  // Map to a partial Crop object compatible with your types
  const crop: Record<string, any> = {
    name: attributes.name || attributes.common_name || null,
    scientific_name: attributes.binomial_name || null,
    ph_range: undefined, // unavailable in OpenFarm
    ec_range: undefined,
    temperature: undefined,
    light_hours: undefined,
    germination_days: undefined,
    harvest_days: undefined,
    growth_stages: [],
    common_issues: [],
    tips: [],
    // include raw attributes for reference
    _source: 'openfarm',
    _raw: attributes,
  };

  // Attempt to extract any useful textual hints
  if (attributes.description) {
    crop.tips.push(attributes.description);
  }

  return crop;
}

export async function getOrFetchCrop(name: string): Promise<Record<string, any> | null> {
  const key = name.toLowerCase().trim();
  const cache = await readCache();
  if (cache[key]) return cache[key];

  const open = await fetchFromOpenFarm(name);
  if (!open) return null;

  const mapped = mapOpenFarmToCrop(open);
  if (!mapped) return null;

  cache[key] = mapped;
  await writeCache(cache);
  return mapped;
}
