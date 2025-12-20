import { useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
// eslint-disable-next-line @next/next/no-img-element
import Image from 'next/legacy/image';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  onImageSelect,
  disabled,
}: ImageUploaderProps) {
  const { t } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      // Compress image
      const img = new window.Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width } = img;
        let { height } = img;
        const maxSize = 1024;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(compressedBase64);
        onImageSelect(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer group outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-black'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />

        {preview ? (
          <div className="relative w-full aspect-square max-w-[200px] mx-auto">
            {/* Using img for base64 preview is standard, suppressing warning */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg shadow-sm"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-black text-white text-xs py-1 px-3 rounded-full transition-opacity">
                Change Image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 group-hover:text-black"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">
              {t('ai.uploadTitle')}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{t('ai.uploadDesc')}</p>
            <p className="text-xs text-gray-400">{t('ai.uploadTip')}</p>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-red-500 text-sm text-center font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
