import { AvatarStyleCount } from './const';
import { AvatarConfigBase, AvatarPart } from './types';

export const getRandomStyle = (): AvatarConfigBase => {
  const config = Object.keys(AvatarStyleCount).reduce(
    (prev, next) =>
      Object.assign(prev, {
        [next]: Math.floor(
          Math.random() * (AvatarStyleCount[next as AvatarPart] + 1),
        ),
      }),
    {} as Record<keyof AvatarConfigBase, number>,
  );
  // for harmony
  config.beard = 0;
  config.details = 0;
  config.accessories = 0;
  return config;
};
