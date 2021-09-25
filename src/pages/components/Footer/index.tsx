import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="flex flex-col items-center">
      <Image src="/line.svg" width="125" height="54" />
      <div className="flex justify-center mt-10">
        <a className="hover:underline" href="https://github.com/mayandev">
          Dribbble
        </a>
        <span className="mx-2">·</span>
        <a className="hover:underline" href="https://github.com/phillzou">
          Twitter
        </a>
        <span className="mx-2">·</span>
        <a className="hover:underline" href="https://github.com/mayandev">
          Buy Me A Coffe
        </a>
      </div>
    </footer>
  );
}
