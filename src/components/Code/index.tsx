import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import copy from 'copy-to-clipboard';

type CodeProps = {
  code: string;
};

export default function Code({ code }: CodeProps) {
  const [copied, setCopied] = useState(false);
  const [showCopy, setShowCopy] = useState(false);

  const { t } = useTranslation();

  const copyCode = (codeStr: string) => {
    copy(codeStr);
    setCopied(true);
  };

  /* eslint-disable */
  return (
    <div
      onMouseOver={() => {
        setShowCopy(true);
      }}
      onMouseLeave={() => {
        setShowCopy(false);
        setCopied(false);
      }}
      className="relative"
    >
      <div className="overflow-hidden overflow-x-auto rounded-md border-black border-3 my-2">
        <p
          onClick={() => {
            copyCode(code);
          }}
          className="p-2 select-all whitespace-nowrap"
        >
          {code}
        </p>
      </div>
      {showCopy && (
        <button
          type="button"
          className="bg-black text-white absolute right-2 top-1 rounded mt-2 px-1 flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          onClick={() => {
            copyCode(code);
          }}
        >
          {copied ? t('copied') : t('copy')}
        </button>
      )}
    </div>
  );
}
