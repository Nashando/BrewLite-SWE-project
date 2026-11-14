import { pathToFileURL } from 'node:url';

/** Read-only QA smoke. SHA verification is optional for applications without version endpoints. */
export async function verifyServices({ apiUrl, webUrl, expectedCommit, fetchImpl = fetch }) {
  if (expectedCommit === 'unknown') throw new Error('Unknown expected commit cannot be verified');
  async function get(base, suffix) {
    if (!base) throw new Error('API_URL/WEB_URL is required');
    const response = await fetchImpl(`${base.replace(/\/$/, '')}${suffix}`, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`${suffix}: HTTP ${response.status}`);
    return response;
  }
  const health = await (await get(apiUrl, '/health')).json();
  if (health.status !== 'ok' || health.details?.database?.status !== 'up') throw new Error('Database is not up');
  const products = await (await get(apiUrl, '/products')).json();
  if (!Array.isArray(products) || products.length === 0) throw new Error('Products are empty or invalid');
  const menu = await get(webUrl, '/menu');
  if (!(await menu.text()).includes('BrewLite')) throw new Error('Web menu is not BrewLite');
  if (expectedCommit) {
    const apiVersion = await (await get(apiUrl, '/version')).json();
    const webVersion = await (await get(webUrl, '/api/version')).json();
    if (apiVersion.commit !== expectedCommit) throw new Error('API commit does not match expected commit');
    if (webVersion.commit !== expectedCommit) throw new Error('Web commit does not match expected commit');
  }
  return { database: 'up', products: products.length, webVerified: true, commitVerified: Boolean(expectedCommit), expectedCommit: expectedCommit || null };
}

export async function waitForServices(options) {
  const { attempts = 30, intervalMs = 2000, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)) } = options;
  if (!Number.isInteger(attempts) || attempts < 1) throw new Error('Invalid attempts');
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try { return await verifyServices(options); } catch (error) { lastError = error; }
    if (attempt < attempts) await sleep(intervalMs);
  }
  throw new Error(`Services did not become ready: ${lastError?.message}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(JSON.stringify(await waitForServices({ apiUrl: process.env.API_URL, webUrl: process.env.WEB_URL, expectedCommit: process.env.EXPECTED_COMMIT })));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
