// Renders the launcher icons (Mortimer on a wallpaper tile) from the game's own art. Usage: node tools/render-icons.js
const { chromium } = require('playwright');
const path = require('path');
const SIZES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 192, height: 192 } });
  await p.goto('file://' + path.join(__dirname, '..', 'game', 'index.html') + '?icon');
  const html = await p.evaluate(() => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="192" height="192">${CO.defs}
    <clipPath id="tile"><rect width="192" height="192" rx="40"/></clipPath>
    <g clip-path="url(#tile)">
      <rect width="192" height="192" fill="url(#paper-plum)"/>
      <rect width="192" height="192" fill="#0a0610" opacity=".35"/>
      <ellipse cx="96" cy="100" rx="90" ry="80" fill="url(#cold)"/>
      <rect y="160" width="192" height="32" fill="url(#wood)"/><rect y="157" width="192" height="4" fill="#1d1218"/>
      <g transform="translate(96 168) scale(2.15)">${CO.mortimer()}</g>
    </g></svg>`);
  for (const [dir, size] of Object.entries(SIZES)) {
    await p.setViewportSize({ width: size, height: size });
    await p.setContent(`<style>body{margin:0;background:transparent}.o{stroke:#140d1c;stroke-width:1.6;stroke-linejoin:round}</style>${html.replace('width="192" height="192">', `width="${size}" height="${size}">`)}`);
    await p.screenshot({ path: path.join(__dirname, '..', 'android', 'res', 'mipmap-' + dir, 'ic_launcher.png'), omitBackground: true });
  }
  await b.close();
  console.log('icons written');
})();
