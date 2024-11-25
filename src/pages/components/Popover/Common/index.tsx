import { useClickOutside } from '@/hooks/useClickOutside';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useLayoutEffect, useState } from 'react';

type PopoverProps = {
  triggerId: string;
  children: JSX.Element;
  onClose: () => void;
};

const smallScreenStyle = 'fixed top-auto bottom-0 left-0 w-full rounded-t-lg';
const mediumScreenStyle =
  'sm:absolute sm:bottom-auto sm:top-[110%] sm:left-1/2  sm:rounded-lg sm:w-[32rem]';

export default function Popover({
  triggerId,
  children,
  onClose,
}: PopoverProps) {
  const [translateX, setTranslateX] = useState<number | null>(null);

  useClickOutside(triggerId, onClose);

  useLayoutEffect(() => {
    const element = document.querySelector('#popover');
    const { x } = element?.getBoundingClientRect() || { x: 0 };
    const pageWidth = window.innerWidth;

    setTranslateX(Math.max(10, Math.min((x / pageWidth) * 100, 90)));
  }, []);

  const isSmallScreen = useMediaQuery('(max-width: 640px)');

  return (
    <div
      className={`text-xl bg-white px-4 pt-2 pb-4 sm:p-6 sm:pb-4 text-left overflow-hidden z-10 border shadow-xl ${smallScreenStyle} ${mediumScreenStyle}`}
      style={{
        transform: `${isSmallScreen ? 'unset' : `translateX(-${translateX}%)`}`,
      }}
      id="popover"
    >
      {children}
    </div>
  );
}
