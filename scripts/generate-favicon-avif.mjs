import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const inputSvg = path.join(root, 'public', 'logo.svg');
const outputAvif = path.join(root, 'public', 'favicon.avif');

const svg = await fs.readFile(inputSvg);

// Render SVG at a sensible favicon resolution then encode AVIF.
// 256px gives good results for high-DPI tabs.
await sharp(svg, { density: 300 })
  .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .avif({ quality: 60, effort: 6 })
  .toFile(outputAvif);

console.log(`Wrote ${outputAvif}`);
