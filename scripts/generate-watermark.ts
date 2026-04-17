import sharp from 'sharp';
import path from 'path';

const svgText = `<svg width="200" height="40" xmlns="http://www.w3.org/2000/svg">
  <text x="100" y="28" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" opacity="0.7">notion-avatar.app</text>
</svg>`;

sharp(Buffer.from(svgText))
  .png()
  .toFile(path.join(process.cwd(), 'public', 'watermark.png'))
  .then(() => console.log('Watermark generated'))
  .catch(console.error);
