import { useLayoutEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const [isMatch, setIsMatch] = useState(false);

  useLayoutEffect(() => {
    const media = window.matchMedia(query);

    function handleChange() {
      setIsMatch(media.matches);
    }

    handleChange();

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isMatch;
};
