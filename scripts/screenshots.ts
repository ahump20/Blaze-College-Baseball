// scripts/screenshots.ts
import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  try {
    if (!fs.existsSync('archive/designs/routes.json')) {
      console.error('❌ routes.json not found. Run route-map.ts first.');
      process.exit(1);
    }
    
    const routes = JSON.parse(fs.readFileSync('archive/designs/routes.json', 'utf8'));
    const out = 'archive/designs/screenshots';
    fs.mkdirSync(out, { recursive: true });
    
    console.log(`📸 Taking screenshots for ${routes.length} routes...`);
    
    const browser = await chromium.launch();
    const context = await browser.newContext({ 
      viewport: { width: 390, height: 844 } 
    });
    const page = await context.newPage();
    
    for (const url of routes) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const safe = url.replace(/https?:\/\//, '').replace(/[^\w.-]/g, '_');
        await page.screenshot({ path: `${out}/${safe}.png`, fullPage: true });
        console.log(`  ✅ ${url}`);
      } catch (e) {
        console.error(`  ❌ ${url}:`, e.message);
      }
    }
    
    await browser.close();
    console.log(`✅ Screenshots saved to ${out}`);
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
    process.exit(1);
  }
})();
