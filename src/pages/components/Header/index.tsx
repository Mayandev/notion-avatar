import Image from 'next/legacy/image';
import Decoration from './decoration';

export default function Header() {
  return (
    <header className="relative">
      <div className="flex py-5 px-5 sm:px-16 md:px-32">
        <Image
          src="/logo.gif"
          alt="Notion Avatar Logo"
          width={50}
          height={50}
        />
        <span className="text-lg">
          Notion
          <br />
          Avatar Maker
        </span>
      </div>
      <Decoration className="absolute top-0 right-0 w-24 sm:w-28 md:w-36" />
    </header>
  );
}
