import sharp from 'sharp';

function createWatermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(12, Math.round(width * 0.028));
  const x = Math.round(width * 0.9);
  const y = Math.round(height * 0.88);

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <text x="${x}" y="${y}" text-anchor="end"
      font-family="'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
      font-size="${fontSize}" font-weight="300"
      letter-spacing="1"
      stroke="white" stroke-width="2" stroke-linejoin="round" paint-order="stroke"
      fill="rgba(0,0,0,0.4)">notion-avatar.app</text>
  </svg>`;

  return Buffer.from(svg);
}

export async function addWatermark(base64Image: string): Promise<string> {
  const raw = base64Image.replace(/^data:[^;]+;base64,/, '');
  const imageBuffer = Buffer.from(raw, 'base64');

  let metadata;
  try {
    metadata = await sharp(imageBuffer).metadata();
  } catch {
    return base64Image;
  }

  const imgWidth = metadata.width || 512;
  const imgHeight = metadata.height || 512;

  const watermarkSvg = createWatermarkSvg(imgWidth, imgHeight);

  try {
    const result = await sharp(imageBuffer)
      .composite([{ input: watermarkSvg, top: 0, left: 0 }])
      .png()
      .toBuffer();

    const resultBase64 = result.toString('base64');
    const hadPrefix = base64Image.startsWith('data:');
    return hadPrefix ? `data:image/png;base64,${resultBase64}` : resultBase64;
  } catch {
    return base64Image;
  }
}
