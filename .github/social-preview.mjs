/**
 * Generates .github/social-preview.png — the image GitHub shows when this repo is
 * shared on social, in chat and in search previews.
 *
 * A bare crop of the storefront is pretty but says nothing: a reader seeing it in a
 * feed cannot tell it is a Shopify theme, or free. So the card keeps the design as the
 * hero — that is what sells a fashion theme — and lays the name, the platform and the
 * facts over a scrim.
 *
 * 1280x640 at deviceScaleFactor 1. Do not render at 2x: GitHub caps the upload at 1MB
 * and the extra pixels buy nothing at this display size.
 *
 * There is no API for uploading it. Settings -> General -> Social preview, in a browser.
 *
 * Playwright is not a dependency of a Shopify theme, so point at an install elsewhere.
 * ESM will not import a bare directory — give it the entry file, not the package folder:
 *
 *   PLAYWRIGHT_PATH="/path/to/node_modules/playwright/index.js" node .github/social-preview.mjs
 */

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
// Playwright is CommonJS; imported by path its exports land on `default`, not as named ones.
const pw = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;

const hero = readFileSync(join(here, 'screenshots/hero.jpg')).toString('base64');

const html = `<!doctype html><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1280px; height: 640px; overflow: hidden;
         font-family: Jost, -apple-system, "Helvetica Neue", Arial, sans-serif; }
  /* Split rather than an overlay: the storefront screenshot has its own header, headline
     and buttons, and laying type over it puts two competing designs in one frame. */
  .card { position: relative; width: 1280px; height: 640px; background: #14100f;
          display: grid; grid-template-columns: 738px 542px; }
  .body { padding: 74px 56px 62px 76px; display: flex; flex-direction: column; }
  .shot { position: relative; background: url(data:image/jpeg;base64,${hero}) 64% 14% / cover no-repeat; }
  /* Feathers the seam so the crop does not read as a pasted rectangle. */
  .shot::before { content: ''; position: absolute; inset: 0;
                  background: linear-gradient(90deg, #14100f 0%, rgba(20,16,15,.55) 12%, rgba(20,16,15,0) 34%); }
  .kicker { font-size: 19px; letter-spacing: .34em; text-transform: uppercase;
            color: #d9b48a; font-weight: 500; }
  h1 { font-size: 126px; line-height: .95; font-weight: 300; color: #fff;
       letter-spacing: -.02em; margin-top: 22px; }
  h1 b { font-weight: 600; }
  p { font-size: 28px; line-height: 1.36; color: rgba(255,255,255,.8);
      font-weight: 300; margin-top: 24px; }
  .chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto; }
  .chip { font-size: 17px; font-weight: 400; color: rgba(255,255,255,.9); white-space: nowrap;
          border: 1px solid rgba(255,255,255,.28); border-radius: 999px; padding: 8px 18px; }
  .chip--on { background: #d9b48a; border-color: #d9b48a; color: #14100f; font-weight: 600; }
  .by { position: absolute; right: 46px; bottom: 40px; font-size: 17px;
        letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.72);
        text-shadow: 0 1px 12px rgba(0,0,0,.85); }
</style>
<div class="card">
  <div class="body">
    <div class="kicker">Free Shopify theme</div>
    <h1>Fas<b>he</b></h1>
    <p>For fashion, apparel and boutique stores — rebuilt on Online&nbsp;Store&nbsp;2.0 theme blocks.</p>
    <div class="chips">
      <span class="chip chip--on">Free &amp; open source</span>
      <span class="chip">Theme blocks</span>
      <span class="chip">Ajax cart</span>
    </div>
  </div>
  <div class="shot"><div class="by">Colorlib</div></div>
</div>`;

const tmp = join(here, '.social-preview.tmp.html');
writeFileSync(tmp, html);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 640 }, deviceScaleFactor: 1 });
await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: join(here, 'social-preview.png') });
await browser.close();
unlinkSync(tmp);

console.log('wrote .github/social-preview.png (1280x640)');
