import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';
import Link from 'next/link';

export default function Footer() {
  const { t } = useTranslation(`common`);

  return (
    <footer className="flex flex-col items-center pb-4">
      <Image src="/icon/line.svg" width="125" height="54" />
      <div className="flex justify-center mt-10">
        <a className="transition hover:underline" href={t(`coffeeUrl`)}>
          {t(`coffee`)}
        </a>
        <span className="mx-2">·</span>
        <a className="hover:underline" href="https://x.com/phillzou">
          {t(`twitter`)}
        </a>
        <span className="mx-2">·</span>
        <Link className="transition hover:underline" href="/privacy-policy">
          {t(`privacyPolicy`)}
        </Link>
        <span className="mx-2">·</span>
        <Link className="transition hover:underline" href="/terms">
          {t(`termOfUse`)}
        </Link>
        <span className="mx-2">·</span>
        <a href="mailto:contact@notion-avatar.app">{t(`contactUs`)}</a>
      </div>
      <div className="text-gray-500 mt-3 px-6 text-center">
        <a
          href="https://abstractlab.gumroad.com/l/noto-avatar"
          className="hover:underline"
        >
          &copy;{` ${t(`illustrations`)}`}
        </a>
        {t(`designedBy`)}
        <a href="https://x.com/felix12777" className="hover:underline">
          {` Felix Wong `}
        </a>
        {t(`underDesign`)}
        <a
          className="hover:underline"
          href="https://creativecommons.org/publicdomain/zero/1.0/"
        >
          {` CC0 `}
        </a>
        {t(`license`)}
      </div>
    </footer>
  );
}
