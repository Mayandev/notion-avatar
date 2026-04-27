import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Pre-rendered transparent PNG with "notion-avatar.app" text.
// Using a static asset avoids relying on system fonts at runtime
// (librsvg in serverless/Linux envs has no Arial/DejaVu installed,
// which caused glyphs to render as .notdef tofu boxes).
const WATERMARK_PATH = path.join(process.cwd(), 'public', 'watermark.png');

let cachedWatermark: Buffer | null = null;
function loadWatermark(): Buffer | null {
  if (cachedWatermark) return cachedWatermark;
  try {
    cachedWatermark = fs.readFileSync(WATERMARK_PATH);
    return cachedWatermark;
  } catch {
    return null;
  }
}

export async function addWatermark(base64Image: string): Promise<string> {
  const raw = base64Image.replace(/^data:[^;]+;base64,/, '');
  const imageBuffer = Buffer.from(raw, 'base64');

  const watermarkSrc = loadWatermark();
  if (!watermarkSrc) return base64Image;

  let metadata;
  try {
    metadata = await sharp(imageBuffer).metadata();
  } catch {
    return base64Image;
  }

  const imgWidth = metadata.width || 512;
  const imgHeight = metadata.height || 512;

  const targetWidth = Math.max(96, Math.round(imgWidth * 0.32));
  const margin = Math.max(8, Math.round(imgWidth * 0.025));

  try {
    const resizedWatermark = await sharp(watermarkSrc)
      .resize({ width: targetWidth })
      .png()
      .toBuffer({ resolveWithObject: true });

    const wmW = resizedWatermark.info.width;
    const wmH = resizedWatermark.info.height;

    const left = Math.max(0, imgWidth - wmW - margin);
    const top = Math.max(0, imgHeight - wmH - margin);

    const result = await sharp(imageBuffer)
      .composite([{ input: resizedWatermark.data, top, left }])
      .png()
      .toBuffer();

    const resultBase64 = result.toString('base64');
    const hadPrefix = base64Image.startsWith('data:');
    return hadPrefix ? `data:image/png;base64,${resultBase64}` : resultBase64;
  } catch {
    return base64Image;
  }
}
