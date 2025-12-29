import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import copy from 'copy-to-clipboard';

type CodeProps = {
  code: string;
  placeholder?: string;
  disabled?: boolean;
};

export default function Code({
  code,
  placeholder,
  disabled = false,
}: CodeProps) {
  const [copied, setCopied] = useState(false);
  const [showCopy, setShowCopy] = useState(false);

  const { t } = useTranslation();

  const copyCode = (codeStr: string) => {
    if (disabled || !codeStr) return;
    copy(codeStr);
    setCopied(true);
  };

  const isEmpty = !code || code.trim() === '';
  const displayText = isEmpty && placeholder ? placeholder : code;

  /* eslint-disable */
  return (
    <div
      onMouseOver={() => {
        if (!disabled && !isEmpty) {
          setShowCopy(true);
        }
      }}
      onMouseLeave={() => {
        setShowCopy(false);
        setCopied(false);
      }}
      className="relative"
    >
      <div
        className={`overflow-hidden overflow-x-auto rounded-md border-3 my-2 transition-colors ${
          disabled || isEmpty
            ? 'border-gray-300 bg-gray-50'
            : 'border-black bg-white cursor-pointer hover:bg-gray-50'
        }`}
      >
        <p
          onClick={() => {
            copyCode(code);
          }}
          className={`p-2 select-all whitespace-nowrap ${
            disabled || isEmpty
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-black'
          }`}
        >
          {displayText}
        </p>
      </div>
      {showCopy && !disabled && !isEmpty && (
        <button
          type="button"
          className="bg-black text-white absolute right-2 top-1 rounded mt-2 px-2 py-1 text-xs flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black hover:bg-gray-800 transition-colors"
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
