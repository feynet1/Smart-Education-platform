import sharp from 'sharp';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const source = join(root, 'public', 'logo.png');

const sizes = [
  { size: 64, name: 'pwa-64x64.png' },
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
];

for (const { size, name } of sizes) {
  await sharp(source)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(join(root, 'public', name));
  console.log(`✅ Generated ${name}`);
}

// Also generate a maskable icon (512x512 with padding for safe zone)
await sharp(source)
  .resize(412, 412, { fit: 'contain', background: { r: 25, g: 118, b: 210, alpha: 1 } })
  .extend({ top: 50, bottom: 50, left: 50, right: 50, background: { r: 25, g: 118, b: 210, alpha: 1 } })
  .png()
  .toFile(join(root, 'public', 'pwa-maskable-512x512.png'));
console.log('✅ Generated pwa-maskable-512x512.png');

console.log('\nAll PWA icons generated!');
