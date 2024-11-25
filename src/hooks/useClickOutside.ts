import { useEffect } from 'react';

export const useClickOutside = (id: string, callback: () => void) => {
  useEffect(() => {
    function handleClose(e: MouseEvent) {
      const element = document.querySelector(id);

      if (element && !element.contains(e.target as Node)) {
        callback();
      }
    }

    document.addEventListener('click', handleClose);
    return () => document.removeEventListener('click', handleClose);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
