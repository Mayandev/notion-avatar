import { AvatarStyleCount } from '@/const';
import { AvatarPart } from '@/types';
import { getRandomStyle } from '@/utils';
import Image from 'next/image';
import { useState } from 'react';
import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';
import SelectionWrapper from './SelectionWrapper';

export default function AvatarEditor() {
  const [config, setConfig] = useState(getRandomStyle());

  const switchConfig = (type: AvatarPart) => {
    const newIdx = (config[type] + 1) % AvatarStyleCount[type];
    config[type] = newIdx;
    setConfig({ ...config });
  };

  const downloadAvatar = async () => {
    const node = document.getElementById(`avatar-preview`);
    const scale = 2;
    if (node) {
      const blob = await domtoimage.toBlob(node, {
        height: node.offsetHeight * scale,
        style: {
          transform: `scale(${scale}) translate(${
            node.offsetWidth / 2 / scale
          }px, ${node.offsetHeight / 2 / scale}px)`,
          'border-radius': 0,
        },
        width: node.offsetWidth * scale,
      });
      saveAs(blob, `avatar.png`);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col">
      <div id="avatar-preview" className="w-48 h-48 md:w-72 md:h-72 relative">
        {Object.keys(config).map((type) => (
          <div key={type} className="absolute">
            <img
              src={`/avatar/preview/${type}/${config[type as AvatarPart]}.svg`}
              width={250}
              height={250}
            />
          </div>
        ))}
      </div>
      <div className="w-5/6 md:w-2/3 mt-7">
        <div className="text-lg my-5">Choose your styles</div>
        <div className="grid gap-y-4 justify-items-center justify-between grid-rows-2 grid-cols-5 lg:flex">
          {Object.keys(config).map((type) => (
            <div key={type}>
              <SelectionWrapper
                switchConfig={() => {
                  switchConfig(type as AvatarPart);
                }}
                tooltip={type}
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
            className="flex items-center mb-3 sm:mb-0 justify-center w-full sm:w-48 md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
          >
            <Image src="/dice.svg" alt="random button" width={28} height={28} />
            <span className="ml-3">Random</span>
          </button>
          <button
            type="button"
            onClick={downloadAvatar}
            className="flex items-center justify-center w-full sm:w-48 md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
          >
            <Image
              src="/download.svg"
              alt="downlaod button"
              width={28}
              height={28}
            />
            <span className="ml-3">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
