import { useRouter } from 'next/router';

interface WaveLineProps {
  className?: string;
}

export default function WaveLine({ className = '' }: WaveLineProps) {
  const router = useRouter();
  const isAIPage = router.pathname === '/ai-generator';

  return (
    <svg
      className={className}
      width="52"
      height="8"
      viewBox="0 0 52 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 4.5C3.2 1.5 5.2 7.5 7.5 4.5C9.8 1.5 11.8 7.5 14 4.5C16.2 1.5 18.2 7.5 20.5 4.5C22.8 1.5 24.8 7.5 27 4.5C29.2 1.5 31.2 7.5 33.5 4.5C35.8 1.5 37.8 7.5 40 4.5C42.2 1.5 44.2 7.5 46.5 4.5C48.8 1.5 50.8 7.5 51 4.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        vectorEffect="non-scaling-stroke"
        className={isAIPage ? 'wave-path-drawn' : 'wave-path'}
      />
    </svg>
  );
}
