import type { AvatarConfig, AvatarPart } from '@/types';
import fs from 'fs/promises';
import path from 'path';

export const getSvgContent = async (
  part: AvatarPart,
  index: number,
): Promise<string> => {
  const filePath = path.join(
    process.cwd(),
    'public',
    'avatar',
    'preview',
    part,
    `${index}.svg`,
  );
  const content = await fs.readFile(filePath, 'utf-8');
  return content.replace(/<svg.*(?=>)>/, '').replace('</svg>', '');
};

export const getPreviewRawString = async (config: AvatarConfig) => {
  const svgPromises = Object.entries(config)
    .filter(([key]) => key !== 'flip' && key !== 'color' && key !== 'shape')
    .map(async ([part, index]) => {
      const content = await getSvgContent(part as AvatarPart, Number(index));
      return `<g id="notion-avatar-${part}" ${
        part === 'face' ? 'fill="#ffffff"' : ''
      } ${
        config.flip ? 'transform="scale(-1,1) translate(-1080, 0)"' : ''
      }>${content}</g>`;
    });

  // 等待所有 SVG 内容加载完成
  const svgGroups = await Promise.all(svgPromises);

  // 构造完整的 SVG
  const svgContent = `
      <svg viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB">
            <feColorMatrix type="matrix" values="1 0 0 0 0
                                                0 1 0 0 0
                                                0 0 1 0 0
                                                0 0 0 20 -10" in="SourceGraphic" result="colormatrix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="colormatrix" result="blend"/>
          </filter>
        </defs>
        <g id="notion-avatar" filter="url(#filter)">
          ${svgGroups.join('\n')}
        </g>
      </svg>
    `.trim();

  return svgContent;
};
