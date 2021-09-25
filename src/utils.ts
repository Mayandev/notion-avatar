import { AvatarStyleCount } from './const';
import { AvatarConfig, AvatarPart } from './types';


export const getRandomStyle = (): AvatarConfig =>
  Object.keys(AvatarStyleCount).reduce((prev, next) => Object.assign(prev, {
    [next]: Math.floor(
      Math.random() *
          (AvatarStyleCount[next as AvatarPart] + 1)
    ),
  }), {} as Record<keyof AvatarConfig, number>);
