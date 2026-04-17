import sharp from 'sharp';

function createWatermarkSvg(width: number, height: number): Buffer {
  const fontSize = Math.max(12, Math.round(width * 0.028));
  const padding = Math.round(fontSize * 0.8);
  const x = width - padding;
  const y = height - padding;

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <text x="${x}" y="${y}" text-anchor="end"
      font-family="Georgia, 'Times New Roman', serif"
      font-size="${fontSize}" font-weight="normal" font-style="italic"
      letter-spacing="0.5"
      stroke="white" stroke-width="2.5" stroke-linejoin="round" paint-order="stroke"
      fill="rgba(0,0,0,0.45)">notion-avatar.app</text>
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
