import Image from 'next/image';

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
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-3 border-solid border-black" />
        </div>
        <div className="flex flex-col sm:flex-row mt-10 justify-between w-full">
          <button
            type="button"
            className="flex items-center mb-3 sm:mb-0 justify-center w-full sm:w-48 md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
          >
            <Image src="/dice.svg" alt="Vercel Logo" width={28} height={28} />
            <span className="ml-3">Random</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-full sm:w-48 md:w-60 border-3 border-black text-black font-bold py-2 px-4 rounded-full"
          >
            <Image
              src="/download.svg"
              alt="Vercel Logo"
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
