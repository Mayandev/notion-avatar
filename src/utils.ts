import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import {
  AvatarStyleCount,
  AvatarStyleCountExtra,
  FestivalTimeMapping,
} from './const';
import { AvatarConfigExtra, AvatarPart, Festival } from './types';

dayjs.extend(isBetween);

export const getCurrentFestival = () => {
  const [festival] = Object.keys(FestivalTimeMapping).filter((key) =>
    dayjs().isBetween(
      `${dayjs().year()}-${FestivalTimeMapping[key as Festival].start}`,
      `${dayjs().year()}-${FestivalTimeMapping[key as Festival].end}`,
      'date',
    ),
  );
  return festival as Festival;
};

export const isFestival = () => getCurrentFestival() !== undefined;

export const getRandomStyle = (): AvatarConfigExtra => {
  const config = Object.keys(AvatarStyleCount).reduce(
    (prev, next) =>
      Object.assign(prev, {
        [next]: Math.floor(
          Math.random() * (AvatarStyleCount[next as AvatarPart] + 1),
        ),
      }),
    {} as Record<keyof AvatarConfigExtra, number>,
  );
  // for harmony
  config.beard = 0;
  config.details = 0;
  config.accessories = 0;
  // for festival
  const festival = getCurrentFestival();
  if (festival) {
    config[festival] = Math.floor(
      Math.random() * (Number(AvatarStyleCountExtra[festival]) + 1),
    );
  }
  return config;
};
