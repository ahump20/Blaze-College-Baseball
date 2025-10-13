// scripts/route-map.ts
import fs from 'fs';
import fetch from 'node-fetch';

const site = process.env.SITE || 'https://blazesportsintel.com';

(async () => {
  try {
    const res = await fetch(`${site}/sitemap.xml`);
    if (!res.ok) {
      console.warn('No sitemap.xml found, using default route list');
      // Default routes for legacy site
      const defaultRoutes = [
        `${site}/`,
        `${site}/about`,
        `${site}/privacy`,
        `${site}/terms`,
        `${site}/cookies`,
        `${site}/accessibility`,
        `${site}/analytics`,
        `${site}/college-baseball`,
        `${site}/features`,
        `${site}/contact`
      ];
      fs.mkdirSync('archive/designs', { recursive: true });
      fs.writeFileSync('archive/designs/routes.json', JSON.stringify(defaultRoutes, null, 2));
      console.log(`✅ Created route map with ${defaultRoutes.length} default routes`);
      return;
    }
    
    const xml = await res.text();
    const routes = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    fs.mkdirSync('archive/designs', { recursive: true });
    fs.writeFileSync('archive/designs/routes.json', JSON.stringify(routes, null, 2));
    console.log(`✅ Extracted ${routes.length} routes from sitemap`);
  } catch (error) {
    console.error('❌ Error generating route map:', error);
    process.exit(1);
  }
})();
