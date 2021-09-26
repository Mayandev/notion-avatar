import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [coffeUrl, setCoffeUrl] = useState(``);

  useEffect(() => {
    const { language = `` } = navigator;
    if (language !== `zh-CN`) {
      setCoffeUrl(`https://ko-fi.com/mayandev`);
    } else {
      setCoffeUrl(`https://afdian.net/@mayandev`);
    }
  }, []);

  return (
    <footer className="flex flex-col items-center pb-4">
      <Image src="/line.svg" width="125" height="54" />
      <div className="flex justify-center mt-10">
        <a
          className="transition hover:underline"
          href="https://github.com/mayandev"
        >
          GitHub
        </a>
        <span className="mx-2">·</span>
        <a
          className="transition hidden md:inline-block hover:underline"
          href="https://dribbble.com/phillzou"
        >
          Dribbble
        </a>
        <span className="mx-2 hidden md:inline-block">·</span>
        <a className="hover:underline" href="https://twitter.com/phillzou">
          Twitter
        </a>
        <span className="mx-2">·</span>
        <a className="transition hover:underline" href={coffeUrl}>
          Buy Me A Coffe
        </a>
      </div>
    </footer>
  );
}
