import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('@playwright/test');
const base = process.env.WEB_URL;
if (!base) throw new Error('WEB_URL is required');
const output = process.env.MEASUREMENT_OUTPUT || 'menu-measurement.json';
const screenshots = join(dirname(output), 'layout-screenshots');
await mkdir(screenshots, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { measuredAt: new Date().toISOString(), base, browser: browser.version(), mode: process.env.WEB_MODE || 'must be recorded by operator', network: 'unthrottled; no CPU throttling', samples: [], layouts: [] };
try {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__brewliteLcp = 0;
      new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__brewliteLcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await page.goto(`${base}/menu`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'Hôm nay uống gì?' }).waitFor();
    await page.waitForTimeout(1000);
    report.samples.push({ run, lcpMs: await page.evaluate(() => window.__brewliteLcp), viewport: '375x812', cache: 'new browser context' });
    await context.close();
  }
  const values = report.samples.map(s => s.lcpMs).sort((a,b) => a-b);
  report.medianLcpMs = values[1];
  report.performancePassed = values.every(x => x > 0) && report.medianLcpMs < 2000;
  for (const viewport of [{ width: 375, height: 812 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto(`${base}/menu`, { waitUntil: 'networkidle' });
    const product = page.locator('a[href^="/products/"]').first();
    const href = await product.getAttribute('href');
    for (const route of ['/menu', href, '/cart', '/checkout']) {
      if (!route) throw new Error('No product link for layout measurement');
      await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
      const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
      report.layouts.push({ viewport, route, widths, noHorizontalOverflow: widths.document <= widths.viewport });
      await page.screenshot({ path: join(screenshots, `${viewport.width}-${route.startsWith('/products/') ? 'product' : route.slice(1)}.png`), fullPage: true });
    }
    const manifest = await (await page.request.get(`${base}/manifest.webmanifest`)).json();
    report.manifestValid = Boolean(manifest.name && manifest.start_url && manifest.icons?.length);
    await context.close();
  }
  report.layoutPassed = report.layouts.every(x => x.noHorizontalOverflow);
} finally { await browser.close(); }
await writeFile(output, JSON.stringify(report,null,2));
console.log(JSON.stringify({medianLcpMs:report.medianLcpMs,performancePassed:report.performancePassed,layoutPassed:report.layoutPassed,manifestValid:report.manifestValid}));
if (!report.performancePassed || !report.layoutPassed || !report.manifestValid) process.exitCode = 1;
