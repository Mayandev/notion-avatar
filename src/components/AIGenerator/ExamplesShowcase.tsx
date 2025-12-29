import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import Image from 'next/legacy/image';

interface Example {
  before?: string;
  after: string;
  prompt?: string;
  type: 'photo2avatar' | 'text2avatar';
}

interface ExamplesShowcaseProps {
  onApplyPrompt?: (prompt: string) => void;
}

interface ImageComparisonProps {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
}

function ImageComparison({
  before,
  after,
  beforeLabel,
  afterLabel,
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, percentage)));
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border-3 border-black cursor-col-resize group"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      role="slider"
      aria-label="Image comparison slider"
      aria-valuenow={sliderPosition}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
    >
      {/* Before Image (Background) */}
      <div className="absolute inset-0">
        <Image
          src={before}
          alt="Before"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      {/* After Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={after}
          alt="After"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-black z-20 transition-opacity group-hover:opacity-100 opacity-80"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        {/* Slider Handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full border-4 border-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-white rounded-full" />
            <div className="w-1 h-4 bg-white rounded-full" />
            <div className="w-1 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full z-10 border-2 border-white">
        {beforeLabel}
      </div>
      <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full z-10 border-2 border-white">
        {afterLabel}
      </div>
    </div>
  );
}

export default function ExamplesShowcase({
  onApplyPrompt,
}: ExamplesShowcaseProps) {
  const { t } = useTranslation('common');

  // 示例数据 - 图片转换前后对比
  const photoExamples: Example[] = [
    {
      before: '/image/avatar-1.jpg',
      after: '/image/avatar-2.jpg',
      type: 'photo2avatar',
    },
    {
      before: '/image/avatar-3.jpg',
      after: '/image/avatar-4.jpg',
      type: 'photo2avatar',
    },
    {
      before: '/image/avatar-5.png',
      after: '/image/avatar-6.png',
      type: 'photo2avatar',
    },
  ];

  // 示例数据 - 提示词生成结果
  const textExamples: Example[] = [
    {
      after: '/image/avatar-1.jpg',
      prompt: t('ai.examples.prompt1'),
      type: 'text2avatar',
    },
    {
      after: '/image/avatar-2.jpg',
      prompt: t('ai.examples.prompt2'),
      type: 'text2avatar',
    },
    {
      after: '/image/avatar-3.jpg',
      prompt: t('ai.examples.prompt3'),
      type: 'text2avatar',
    },
  ];

  return (
    <section className="py-16 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl mx-auto px-4">
        {/* Photo to Avatar Examples */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 inline-block relative">
              <span className="relative">{t('ai.examples.photoTitle')}</span>
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              {t('ai.examples.photoDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {photoExamples.map((example) => (
              <div
                key={`photo-${example.before}-${example.after}`}
                className="bg-white border-3 border-black rounded-xl p-6 transition-transform duration-200 shadow-sm"
              >
                {example.before ? (
                  <ImageComparison
                    before={example.before}
                    after={example.after}
                    beforeLabel={t('ai.examples.before')}
                    afterLabel={t('ai.examples.after')}
                  />
                ) : (
                  <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border-3 border-black">
                    <Image
                      src={example.after}
                      alt="After"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Text to Avatar Examples */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 inline-block relative">
              <span className="relative">{t('ai.examples.textTitle')}</span>
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              {t('ai.examples.textDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {textExamples.map((example) => (
              <div
                key={`text-${example.after}-${example.prompt || ''}`}
                className="bg-white border-3 border-black rounded-xl p-6 transition-transform duration-200 flex flex-col shadow-sm"
              >
                {/* Prompt */}
                {example.prompt && (
                  <div className="mb-4">
                    <div className="bg-gray-50 border-3 border-gray-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            className="w-5 h-5 text-black"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed flex-1 font-medium">
                          &ldquo;{example.prompt}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Avatar */}
                <div className="relative flex-1 flex items-center justify-center mb-4">
                  <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border-3 border-black">
                    <Image
                      src={example.after}
                      alt="Generated Avatar"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                </div>

                {/* Apply Button */}
                {example.prompt && onApplyPrompt && (
                  <button
                    onClick={() => {
                      if (example.prompt) {
                        onApplyPrompt(example.prompt);
                      }
                    }}
                    type="button"
                    className="w-full py-3 px-4 rounded-full bg-black text-white font-bold text-sm transition-all border-3 border-black shadow-sm hover:shadow-md"
                  >
                    {t('ai.examples.apply')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
