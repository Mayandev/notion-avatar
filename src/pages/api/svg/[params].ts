import type { NextApiRequest, NextApiResponse } from 'next';
import chromium from 'chrome-aws-lambda';
import { AvatarConfig, AvatarPart } from '@/types';

async function getBrowserInstance() {
  const executablePath = await chromium.executablePath;

  if (!executablePath) {
    // running locally
    // eslint-disable-next-line
    const puppeteer = require('puppeteer');
    return puppeteer.launch({
      args: chromium.args,
      headless: true,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      ignoreHTTPSErrors: true,
    });
  }

  return chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1280,
      height: 720,
    },
    executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { params } = req.query;

  // decode
  const config = JSON.parse(
    Buffer.from(params as string, `base64`).toString(),
  ) as AvatarConfig;

  const url = `${process.env.NEXT_PUBLIC_URL}?${Object.keys(config)
    .map(
      (type) =>
        `${type}=${encodeURIComponent(config[type as keyof AvatarConfig])}`,
    )
    .join(`&`)}`;

  let browser;

  try {
    browser = await getBrowserInstance();
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector(`#avatar-preview`); // wait for the selector to load

    const svg = await page.$eval(`#avatar-preview > svg`, (e: any) =>
      e.outerHTML.replace(/<br>/gi, `<br/>`),
    ); // declare a variable with an ElementHandle

    res.writeHead(200, { 'Content-Type': `image/svg+xml` }).end(svg);
  } catch (error: any) {
    res.json({
      status: `error`,
      data: error?.message || `Something went wrong`,
    });
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
