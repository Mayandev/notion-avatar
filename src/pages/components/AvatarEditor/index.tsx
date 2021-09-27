import { AvatarStyleCount } from '@/const';
import { AvatarPart } from '@/types';
import { getRandomStyle } from '@/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import * as ga from '@/lib/ga';
import { useTranslation } from 'next-i18next';
import SelectionWrapper from './SelectionWrapper';

export default function AvatarEditor() {
  const [config, setConfig] = useState(getRandomStyle());
  const [preview, setPreview] = useState(``);
  const { t } = useTranslation(`common`);

  useEffect(() => {
    generatePreview();
  }, [config]);

  const generatePreview = async () => {
    const groups = await Promise.all(
      Object.keys(config).map(async (type) => {
        /* eslint-disable */
        const svgRaw = (
          await require(`!!raw-loader!@/public/avatar/preview/${type}/${
            config[type as AvatarPart]
          }.svg`)
        ).default;
        return `\n<g id="notion-avatar-${type}">\n
      ${svgRaw.replace(/<svg.*(?=>)>/, '').replace('</svg>', '')}
    \n</g>\n`;
      }),
    );

    const previewSvg =
      `<svg viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    ${groups.join('\n\n')}
      </svg>`
        .trim()
        .replace(/(\n|\t)/g, '');
    setPreview(previewSvg);
  };

  const switchConfig = (type: AvatarPart) => {
    const newIdx = (config[type] + 1) % AvatarStyleCount[type];
    // Dynamically load fuse.js
    config[type] = newIdx;
    setConfig({ ...config });
  };

  const downloadAvatar = async () => {
    const dom: HTMLElement = document.querySelector(
      '#avatar-preview',
    ) as HTMLElement;
    const canvas = await html2canvas(dom, {
      logging: false,
      scale: window.devicePixelRatio,
      width: dom.offsetWidth,
      height: dom.offsetHeight,
    });
    const a = document.createElement('a');
    a.href = canvas.toDataURL();

    a.download = `notion-avatar-${new Date().getTime()}.png`;
    alert(window.navigator.userAgent.toLowerCase());
    a.click();
    // record download action
    ga.event({ action: 'download', params: { ...config } });
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <div
        id="avatar-preview"
        className="w-48 h-48 md:w-72 md:h-72"
        dangerouslySetInnerHTML={{
          __html: preview,
        }}
      />
      <div className="w-5/6 md:w-2/3">
        <div className="text-lg my-5">{t('choose')}</div>
        <div className="grid gap-y-4 justify-items-center justify-between grid-rows-2 grid-cols-5 lg:flex">
          {Object.keys(config).map((type) => (
            <div key={type}>
              <SelectionWrapper
                switchConfig={() => {
                  switchConfig(type as AvatarPart);
                }}
                tooltip={t(type)}
              >
                <Image
                  src={`/avatar/part/${type}/${type}-${
                    config[type as AvatarPart]
                  }.svg`}
                  width={30}
                  height={30}
                />
              </SelectionWrapper>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row mt-10 justify-between w-full">
          <button
            onClick={() => {
              setConfig(getRandomStyle());
            }}
            type="button"
            className="outline-none flex items-center mb-3 sm:mb-0 justify-center w-full sm:w-48 md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
          >
            <Image src="/dice.svg" alt={t('random')} width={28} height={28} />
            <span className="ml-3">{t('random')}</span>
          </button>
          <button
            type="button"
            onClick={downloadAvatar}
            className="outline-none flex items-center justify-center w-full sm:w-48 md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
          >
            <Image
              src="/download.svg"
              alt={t('download')}
              width={28}
              height={28}
            />
            <span className="ml-3">{t('download')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
