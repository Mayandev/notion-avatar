import Image from 'next/image';
import SelectionWrapper from './SelectionWrapper';

export default function AvatarEditor() {
  return (
    <div className="flex justify-center items-center flex-col my-5">
      <div className="w-36 md:w-60">
        <Image
          src="/placeholder.png"
          alt="Notion Avatar Logo"
          width={250}
          height={250}
        />
      </div>
      <div className="w-5/6 md:w-2/3 mt-10">
        <div className="text-lg my-5">Choose your styles</div>
        <div className="grid gap-y-4 justify-items-center justify-between grid-rows-2 grid-cols-5 lg:flex">
          <SelectionWrapper tooltip="Face">
            <Image src="/avatar/face/face-0.svg" width={30} height={30} />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Nose">
            <Image src="/avatar/nose/nose-0.svg" width={30} height={30} />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Mouth">
            <Image src="/avatar/mouth/mouth-0.svg" width={30} height={30} />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Eyes">
            <Image src="/avatar/eyes/eyes-0.svg" width={30} height={30} />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Eyebrows">
            <Image
              src="/avatar/eyebrows/eyebrows-0.svg"
              width={30}
              height={30}
            />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Glasses">
            <Image src="/avatar/glasses/glasses-0.svg" width={30} height={30} />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Hair Style">
            <Image
              src="/avatar/hairstyle/hairstyle-0.svg"
              width={30}
              height={30}
            />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Beard">
            <Image src="/avatar/beard/beard-0.svg" width={30} height={30} />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Details">
            <Image src="/avatar/details/details-0.svg" width={30} height={30} />
          </SelectionWrapper>
          <SelectionWrapper tooltip="Accessories">
            <Image
              src="/avatar/accessories/accessories-0.svg"
              width={30}
              height={30}
            />
          </SelectionWrapper>
        </div>
        <div className="flex flex-col sm:flex-row mt-10 justify-between w-full">
          <button
            type="button"
            className="flex items-center mb-3 sm:mb-0 justify-center w-full sm:w-48 md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
          >
            <Image src="/dice.svg" alt="random button" width={28} height={28} />
            <span className="ml-3">Random</span>
          </button>
          <button
            type="button"
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
