import sharp from 'sharp';
import path from 'path';

const WATERMARK_PATH = path.join(process.cwd(), 'public', 'watermark.png');

export async function addWatermark(base64Image: string): Promise<string> {
  const raw = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const imageBuffer = Buffer.from(raw, 'base64');
  const metadata = await sharp(imageBuffer).metadata();

  const imgWidth = metadata.width || 512;
  const imgHeight = metadata.height || 512;

  let watermark: Buffer;
  try {
    watermark = await sharp(WATERMARK_PATH)
      .resize({
        width: Math.round(imgWidth * 0.3),
        fit: 'inside',
      })
      .toBuffer();
  } catch {
    return base64Image;
  }

  const watermarkMeta = await sharp(watermark).metadata();
  const wmWidth = watermarkMeta.width || 100;
  const wmHeight = watermarkMeta.height || 30;

  const result = await sharp(imageBuffer)
    .composite([
      {
        input: watermark,
        top: imgHeight - wmHeight - 10,
        left: imgWidth - wmWidth - 10,
      },
    ])
    .png()
    .toBuffer();

  const resultBase64 = result.toString('base64');
  const hadPrefix = base64Image.startsWith('data:');
  return hadPrefix ? `data:image/png;base64,${resultBase64}` : resultBase64;
}
