import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'next-i18next';

const GENERATION_STAGES = [
  {
    key: 'ai.generationStages.creating',
    fallback: 'Creating image',
    progress: 24,
  },
  {
    key: 'ai.generationStages.composing',
    fallback: 'Composing the avatar',
    progress: 46,
  },
  {
    key: 'ai.generationStages.refining',
    fallback: 'Refining details',
    progress: 68,
  },
  {
    key: 'ai.generationStages.polishing',
    fallback: 'Polishing final touches',
    progress: 86,
  },
  {
    key: 'ai.generationStages.finishing',
    fallback: 'Almost ready',
    progress: 94,
  },
];

const PIXEL_COLUMNS = 31;
const PIXEL_ROWS = 21;

export default function GeneratingStatus() {
  const { t } = useTranslation('common');
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((current) =>
        Math.min(current + 1, GENERATION_STAGES.length - 1),
      );
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const pixels = useMemo(
    () =>
      Array.from({ length: PIXEL_COLUMNS * PIXEL_ROWS }, (_, index) => {
        const x = index % PIXEL_COLUMNS;
        const y = Math.floor(index / PIXEL_COLUMNS);
        const horizontalCenter = PIXEL_COLUMNS * 0.58;
        const verticalCenter = PIXEL_ROWS * 0.54;
        const dx = (x - horizontalCenter) / (PIXEL_COLUMNS * 0.38);
        const dy = (y - verticalCenter) / (PIXEL_ROWS * 0.28);
        const density = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
        const ripple = Math.sin((x * 0.68 + y * 0.92) * Math.PI) * 0.08;
        const size = 1.6 + (density + ripple) * 3.2;
        const opacity = 0.14 + density * 0.5;

        return {
          key: `${x}-${y}`,
          style: {
            '--pixel-delay': `${x * -46 + y * -82}ms`,
            '--pixel-size': `${Math.max(1.2, size).toFixed(2)}px`,
            '--pixel-opacity': opacity.toFixed(2),
          } as CSSProperties,
        };
      }),
    [],
  );

  const currentStage = GENERATION_STAGES[stageIndex];

  return (
    <div
      className="w-full max-w-[340px] md:max-w-[360px] mx-auto animate-in fade-in zoom-in-95 duration-500"
      aria-live="polite"
    >
      <div className="relative aspect-square overflow-hidden rounded-3xl border-2 border-gray-100 bg-[#f8f8f6]">
        <div className="absolute left-6 right-6 top-6 z-10">
          <p className="font-semibold leading-7 tracking-normal text-gray-800">
            {t(currentStage.key, { defaultValue: currentStage.fallback })}
          </p>
        </div>

        <div className="pixel-field" aria-hidden="true">
          {pixels.map((pixel) => (
            <span key={pixel.key} className="pixel-dot" style={pixel.style} />
          ))}
        </div>

        <div className="absolute inset-x-6 bottom-6 z-10">
          <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-gray-800 transition-[width] duration-700 ease-out"
              style={{ width: `${currentStage.progress}%` }}
            />
          </div>
          <p className="text-xs leading-relaxed text-gray-500">
            {t('ai.generatingSubtitle')}
          </p>
        </div>
      </div>

      <style jsx>{`
        .pixel-field {
          position: absolute;
          inset: 80px 18px 72px;
          display: grid;
          grid-template-columns: repeat(${PIXEL_COLUMNS}, minmax(0, 1fr));
          grid-template-rows: repeat(${PIXEL_ROWS}, minmax(0, 1fr));
          align-items: center;
          justify-items: center;
          mask-image: radial-gradient(
            ellipse at 58% 54%,
            #000 0%,
            #000 46%,
            transparent 78%
          );
          -webkit-mask-image: radial-gradient(
            ellipse at 58% 54%,
            #000 0%,
            #000 46%,
            transparent 78%
          );
        }

        .pixel-dot {
          width: var(--pixel-size);
          height: var(--pixel-size);
          border-radius: 2px;
          background: rgb(17 24 39);
          opacity: var(--pixel-opacity);
          transform: scale(0.76);
          animation: pixel-breathe 2.9s ease-in-out infinite;
          animation-delay: var(--pixel-delay);
        }

        @keyframes pixel-breathe {
          0%,
          100% {
            opacity: 0.08;
            transform: translate3d(0, 0, 0) scale(0.58);
          }
          42% {
            opacity: var(--pixel-opacity);
            transform: translate3d(0, -1px, 0) scale(1.08);
          }
          68% {
            opacity: 0.22;
            transform: translate3d(0, 1px, 0) scale(0.88);
          }
        }

        @media (max-width: 480px) {
          .pixel-field {
            inset: 78px 12px 74px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pixel-dot {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
