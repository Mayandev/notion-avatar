import { GetStaticPropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

import Header from './components/Header';

export default function PageNotFount() {
  const { t } = useTranslation(`common`);

  return (
    <div className="h-screen">
      <Header />
      <main className="flex flex-col justify-center h-2/3 items-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl">{t(`404Title`)}</h1>
        <Link href="/">← {t(`404Redirect`)}</Link>
      </main>
    </div>
  );
}

export async function getStaticProps({
  locale,
}: GetStaticPropsContext & { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [`common`])),
    },
  };
}
