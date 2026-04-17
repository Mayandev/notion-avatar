import sharp from 'sharp';
import path from 'path';

const WATERMARK_PATH = path.join(process.cwd(), 'public', 'watermark.png');

export async function addWatermark(base64Image: string): Promise<string> {
  const imageBuffer = Buffer.from(base64Image, 'base64');
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
      .ensureAlpha()
      .composite([
        {
          input: Buffer.from([0, 0, 0, 128]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'dest-in',
        },
      ])
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

  return result.toString('base64');
}
