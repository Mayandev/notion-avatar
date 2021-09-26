import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="flex flex-col items-center">
      <Image src="/line.svg" width="125" height="54" />
      <div className="flex justify-center mt-10">
        <a
          className="transition hover:underline"
          href="https://dribbble.com/phillzou"
        >
          Dribbble
        </a>
        <span className="mx-2">·</span>
        <a
          className="hidden md:inline-block hover:underline"
          href="https://dribbble.com/phillzou"
        >
          Illustration
        </a>
        <span className="mx-2">·</span>
        <a
          className="transition hover:underline"
          href="https://github.com/phillzou"
        >
          Twitter
        </a>
        <span className="mx-2">·</span>
        <a
          className="transition hover:underline"
          href="https://ko-fi.com/mayandev"
        >
          Buy Me A Coffe
        </a>
      </div>
    </footer>
  );
}
