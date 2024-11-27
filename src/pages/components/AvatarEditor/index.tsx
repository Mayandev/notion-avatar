import {
  AvatarStyleCount,
  CompatibleAgents,
  DefaultBackgroundConfig,
  FestivalTooltipEmoji,
  ModalKeyMap,
  ShapeStyleMapping,
  SVGFilter,
} from '@/const';
import {
  AvatarPart,
  ImageType,
  AvatarConfig,
  AvatarBackgroundConfig,
  AvatarPickerConfig,
} from '@/types';
import { getRandomStyle, isFestival, getCurrentFestival } from '@/utils';
import Image from 'next/legacy/image';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/router';
import * as ga from '@/lib/ga';
import { useTranslation } from 'next-i18next';
import { useModalStates } from '@/hooks/useModalState';
import SelectionWrapper from './SelectionWrapper';
import DownloadModal from '../Modal/Download';
import EmbedModal from '../Modal/Embed';

import PalettePopover from '../Popover/Palette';
import AvatarPickerPopover from '../Popover/AvatarPicker';

export default function AvatarEditor() {
  const router = useRouter();

  const [config, setConfig] = useState({ ...getRandomStyle() });
  const [preview, setPreview] = useState('');
  const [imageType, setImageType] = useState('png' as ImageType);
  const { modalStates, toggleModal } = useModalStates(ModalKeyMap);
  const [flip, setFlip] = useState(false);
  const [background, setBackground] = useState<AvatarBackgroundConfig>(
    DefaultBackgroundConfig,
  );
  // default placeholder for compatible modal
  const [imageDataURL, setImageDataURL] = useState('/logo.gif');
  const [avatarPart, setAvatarPart] = useState<AvatarPickerConfig | null>(null);

  const festival = getCurrentFestival();

  const { t } = useTranslation('common');

  // hack
  useEffect(() => {
    if (router.asPath !== router.route) {
      const { query } = router;
      // query string to number
      const params = Object.keys(query).reduce(
        (prev, next) => Object.assign(prev, { [next]: query[next] }),
        {},
      ) as AvatarConfig;

      setConfig({ ...config, ...params });
      setFlip(Boolean(Number(params.flip ?? 0)));

      setBackground({
        color: params.color ?? 'rgba(255, 0, 0, 0)',
        shape: params.shape ?? 'none',
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const generatePreview = async (flipped: boolean) => {
    const groups = await Promise.all(
      Object.keys(AvatarStyleCount).map(async (type) => {
        /* eslint-disable */
        const svgRaw = (
          await require(`!!raw-loader!@/public/avatar/preview/${type}/${
            config[type as AvatarPart]
          }.svg`)
        ).default;
        return `\n<g id="notion-avatar-${type}" ${
          type === 'face' ? 'fill="#ffffff"' : ''
        } ${flipped ? 'transform="scale(-1,1) translate(-1080, 0)"' : ''}>\n
      ${svgRaw.replace(/<svg.*(?=>)>/, '').replace('</svg>', '')}
    \n</g>\n`;
      }),
    );

    // for festival
    if (festival) {
      const svgRaw = (
        await require(`!!raw-loader!@/public/avatar/preview/festival/${festival}/${config[festival]}.svg`)
      ).default;
      groups.push(`\n<g id="notion-avatar-${festival}" ${
        flipped ? 'transform="scale(-1,1) translate(-1080, 0)"' : ''
      }>\n
    ${svgRaw.replace(/<svg.*(?=>)>/, '').replace('</svg>', '')}
  \n</g>\n`);
    }

    const previewSvg =
      `<svg viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${SVGFilter}
      <g id="notion-avatar" filter="url(#filter)">
        ${groups.join('\n\n')}
      </g>
      </svg>`
        .trim()
        .replace(/(\n|\t)/g, '');

    setPreview(previewSvg);
  };

  useEffect(() => {
    generatePreview(flip);
  }, [config, flip]);

  const switchConfig = (avatarConfig: AvatarPickerConfig) => {
    // const newIdx =
    //   (Number(config[type]) + 1) % (Number(AvatarStyleCountExtra[type]) + 1);
    config[avatarConfig.part] = avatarConfig.index;
    setConfig({ ...config });
    // hide modal
    // toggleModal('avatarPicker');
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
    if (isNeedCompatible) {
      setImageDataURL(imageURL);
      toggleModal('download');
      return;
    }

    const a = document.createElement('a');

    a.href = imageURL;
    a.download = `notion-avatar-${new Date().getTime()}.${imageType}`;
    a.click();
  };

  const onOpenEmbedModal = () => {
    toggleModal('embed');
    // record embed action
    ga.event({ action: 'embed', params: { ...config } });
  };

  const onOpenPaletteModal = () => {
    toggleModal('palette');
  };

  return (
    <>
      {/* {modalStates.avatarPicker && (
        <AvatarPicker
          onCancel={() => toggleModal('avatarPicker')}
          avatarPart={avatarPart}
          onConfirm={(newIdx) =>
            switchConfig({ index: newIdx, part: avatarPart.part })
          }
        />
      )} */}
      {modalStates.download && (
        <DownloadModal
          onCancel={() => {
            toggleModal('download');
          }}
          image={imageDataURL}
        />
      )}
      {modalStates.embed && (
        <EmbedModal
          onCancel={() => {
            toggleModal('embed');
          }}
          config={{
            ...config,
            flip: Number(flip),
            color: background.color,
            shape: background.shape,
          }}
          imageType={imageType}
        />
      )}
      {/* {modalStates.palette && (
        <PaletteModal
          onCancel={() => {
            toggleModal('palette');
          }}
          onSelect={(background: AvatarBackgroundConfig) => {
            setBackground({ ...background });
            toggleModal('palette');
          }}
          backgroundConfig={background}
        />
      )} */}
      <div className="flex justify-center items-center flex-col">
        <div
          style={{
            backgroundColor:
              background.shape === 'none'
                ? DefaultBackgroundConfig.color
                : background.color,
          }}
          id="avatar-preview"
          className={`w-48 h-48 md:w-72 md:h-72 ${
            ShapeStyleMapping[background.shape]
          }`}
          dangerouslySetInnerHTML={{
            __html: preview,
          }}
        />
        <div className="w-5/6 md:w-2/3">
          <div className="flex justify-between items-center">
            <div className="text-lg my-5">{t('choose')}</div>
            <div className="flex items-center">
              <button
                data-tip={t('flip')}
                className="w-8 h-8 sm:w-12 sm:h-12 tooltip"
                onClick={() => {
                  setFlip(!flip);
                }}
              >
                <Image
                  width={30}
                  height={30}
                  src={flip ? '/icon/flip-left.svg' : '/icon/flip-right.svg'}
                />
              </button>
              <div className="relative" id="palette-picker">
                <button
                  data-tip={t('background')}
                  className="w-8 h-8 sm:w-12 sm:h-12 tooltip ml-2"
                  onClick={onOpenPaletteModal}
                >
                  <Image width={30} height={30} src="/icon/palette.svg" />
                </button>
                {modalStates.palette && (
                  <PalettePopover
                    onSelect={(background: AvatarBackgroundConfig) => {
                      setBackground({ ...background });
                    }}
                    backgroundConfig={background}
                    onClose={() => toggleModal('palette')}
                    triggerId="#palette-picker"
                  />
                )}
              </div>
            </div>
          </div>
          <div className="grid gap-y-4 justify-items-center justify-between grid-rows-2 grid-cols-5 lg:flex">
            {Object.keys(AvatarStyleCount).map((type) => (
              <div key={type} className="relative" id={`avatar-picker-${type}`}>
                <SelectionWrapper
                  switchConfig={() => {
                    setAvatarPart({
                      part: type as AvatarPart,
                      index: config[type as AvatarPart],
                    });
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
                {avatarPart?.part === type && (
                  <AvatarPickerPopover
                    avatarPart={{
                      part: type as AvatarPart,
                      index: avatarPart?.index || 0,
                    }}
                    onSelect={(index) => {
                      if (!avatarPart) return;
                      setAvatarPart({
                        part: type as AvatarPart,
                        index,
                      });
                      switchConfig({ index, part: avatarPart.part });
                    }}
                    onClose={() => {
                      setAvatarPart(null);
                    }}
                    triggerId={`#avatar-picker-${type}`}
                  />
                )}
              </div>
            ))}
            {isFestival() && (
              <div className="relative" id={`avatar-picker-${festival}`}>
                <SelectionWrapper
                  switchConfig={() => {
                    setAvatarPart({
                      part: festival,
                      index: config[festival] || 0,
                    });
                  }}
                  tooltip={FestivalTooltipEmoji[festival]}
                  className="relative "
                >
                  <>
                    <Image
                      src={`/avatar/part/festival/${festival}/${festival}-${config[festival]}.svg`}
                      width={30}
                      height={30}
                    />
                    <span className="top-0 right-0 absolute bg-red-600 text-xs text-white rounded translate-x-1/2 px-1 -translate-y-1/2">
                      New
                    </span>
                  </>
                </SelectionWrapper>
                {avatarPart?.part === festival && (
                  <AvatarPickerPopover
                    avatarPart={{
                      part: festival as AvatarPart,
                      index: avatarPart?.index || 0,
                    }}
                    onSelect={(index) => {
                      if (!avatarPart) return;
                      setAvatarPart({
                        part: festival as AvatarPart,
                        index,
                      });
                      switchConfig({ index, part: avatarPart.part });
                    }}
                    onClose={() => {
                      setAvatarPart(null);
                    }}
                    triggerId={`#avatar-picker-${festival}`}
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-x-3 md:flex-row mt-8 justify-between w-full select-none">
            <button
              onClick={() => {
                setConfig(getRandomStyle());
              }}
              type="button"
              className="mb-3 md:mb-0 focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-50 outline-none flex items-center justify-center w-full md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
            >
              <Image
                src="/icon/dice.svg"
                alt={t('random')}
                width={28}
                height={28}
              />
              <span className="ml-3">{t('random')}</span>
            </button>
            <button
              onClick={onOpenEmbedModal}
              type="button"
              className="mb-3 md:mb-0 focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-50 outline-none flex items-center justify-center w-full md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
            >
              <Image
                src="/icon/code.svg"
                alt={t('embed')}
                width={28}
                height={28}
              />
              <span className="ml-3">{t('embed')}</span>
            </button>
            <div className="flex">
              <button
                type="button"
                onClick={downloadAvatar}
                className="focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-50 outline-none select-none flex items-center justify-center md:w-52 border-3 border-black text-black font-bold py-2 px-4 rounded-full rounded-r-none flex-grow"
              >
                <Image
                  src="/icon/download.svg"
                  alt={t('download')}
                  width={28}
                  height={28}
                />
                <span className="ml-3">{t('download')}</span>
              </button>
              <div className="border-3 border-black rounded-full flex items-center rounded-l-none border-l-0 relative">
                <select
                  className="appearance-none focus:outline-none select-none bg-transparent h-full w-20 pl-4 pr-7 cursor-pointer"
                  onChange={(e) => setImageType(e.target.value as ImageType)}
                >
                  <option value="png">.PNG</option>
                  <option value="svg">.SVG</option>
                </select>
                <svg
                  width="10px"
                  height="6px"
                  viewBox="0 0 10 6"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
