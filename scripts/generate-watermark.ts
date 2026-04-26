import sharp from 'sharp';
import path from 'path';

const svgText = `<svg width="240" height="36" xmlns="http://www.w3.org/2000/svg">
  <text x="120" y="26" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="bold"
    stroke="white" stroke-width="3" stroke-linejoin="round" fill="black" opacity="0.6">notion-avatar.app</text>
</svg>`;

sharp(Buffer.from(svgText))
  .png()
  .toFile(path.join(process.cwd(), 'public', 'watermark.png'))
  .then(() => console.log('Watermark generated'))
  .catch(console.error);
