import { AvatarStyleCount, CompatibleAgents } from '@/const';
import { AvatarPart, ImageType } from '@/types';
import { getRandomStyle } from '@/utils';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/router';
import * as ga from '@/lib/ga';
import { useTranslation } from 'next-i18next';
import SelectionWrapper from './SelectionWrapper';
import DownloadModal from '../Modal/Download';
import EmbedModal from '../Modal/Embed';

export default function AvatarEditor() {
  const router = useRouter();

  const [config, setConfig] = useState({ ...getRandomStyle() });
  const [preview, setPreview] = useState(``);
  const [imageType, setImageType] = useState(`png` as ImageType);
  const [showDownloadModal, setDownloadModal] = useState(false);
  const [showEmbedModal, setEmbedModal] = useState(false);

  // default placeholder for compatible modal
  const [imageDataURL, setImageDataURL] = useState(`/logo.gif`);

  const { t } = useTranslation(`common`);

  // hack
  useEffect(() => {
    if (router.asPath !== router.route) {
      const { query } = router;
      // query string to number
      const params = Object.keys(query).reduce(
        (prev, next) => Object.assign(prev, { [next]: Number(query[next]) }),
        {},
      );
      setConfig({ ...config, ...params });
    }
  }, [router]);

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

  useEffect(() => {
    generatePreview();
  }, [config]);

  const switchConfig = (type: AvatarPart) => {
    const newIdx = (config[type] + 1) % (AvatarStyleCount[type] + 1);
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
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isNeedCompatible = CompatibleAgents.some(
      (agent) => userAgent.indexOf(agent) >= 0,
    );

    // record download action
    ga.event({ action: 'download', params: { ...config } });

    // base64 only support png svg for now, maybe more change it to Map
    let imageURL;
    if (imageType === 'png') {
      imageURL = canvas.toDataURL();
    } else {
      const svgElement = dom.querySelector('svg');
      if (!svgElement) {
        // not generate for some reason
        return;
      }
      const svg = new XMLSerializer().serializeToString(svgElement);
      imageURL = `data:image/svg+xml;base64,${window.btoa(svg)}`;
    }

    // compatible for browsers which don't surpport dwonload attribution
    if (!isNeedCompatible) {
      setImageDataURL(imageURL);
      setDownloadModal(true);
      return;
    }

    const a = document.createElement('a');

    a.href = imageURL;
    a.download = `notion-avatar-${new Date().getTime()}.${imageType}`;
    a.click();
  };

  return (
    <>
      {showDownloadModal && (
        <DownloadModal
          onCancel={() => {
            setDownloadModal(false);
          }}
          image={imageDataURL}
        />
      )}
      {showEmbedModal && (
        <EmbedModal
          onCancel={() => {
            setEmbedModal(false);
          }}
          config={config}
          imageType={imageType}
        />
      )}
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
          <div className="flex flex-col gap-3 md:flex-row mt-8 justify-between w-full select-none">
            <button
              onClick={() => {
                setConfig(getRandomStyle());
              }}
              type="button"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-50 outline-none flex items-center justify-center w-full md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
            >
              <Image src="/dice.svg" alt={t('random')} width={28} height={28} />
              <span className="ml-3">{t('random')}</span>
            </button>
            <button
              onClick={() => {
                setEmbedModal(true);
              }}
              type="button"
              className="focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-50 outline-none flex items-center justify-center w-full md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
            >
              <Image src="/code.svg" alt={t('embed')} width={28} height={28} />
              <span className="ml-3">{t('embed')}</span>
            </button>
            <button
              type="button"
              onClick={downloadAvatar}
              className="focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-50 outline-none select-none flex items-center justify-center w-full md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
            >
              <Image
                src="/download.svg"
                alt={t('download')}
                width={28}
                height={28}
              />
              <span className="ml-3">{t('download')}</span>
              <select
                className="appearance-none focus:outline-none select-none bg-transparent mx-2"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setImageType(e.target.value as ImageType)}
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
              <svg
                width="10px"
                height="6px"
                viewBox="0 0 10 6"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g
                  stroke="none"
                  strokeWidth="1"
                  fill="none"
                  fillRule="evenodd"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <g
                    id="a"
                    transform="translate(1.000000, 1.000000)"
                    stroke="#000000"
                    strokeWidth="2"
                  >
                    <polyline points="8 0 4 4 0 0"></polyline>
                  </g>
                </g>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
