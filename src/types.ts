// export enum AvatarStyle {
//   Accessories,
//   Beard,
//   Details,
//   Eyebrows,
//   Eyes,
//   Face,
//   Glasses,
//   Hairstyle,
//   Mouth,
//   Nose
// }

export type Festival = 'halloween' | 'christmas';
export type FestivalTime = {
  [key in Festival]: {
    start: string;
    end: string;
  };
};

export type FestivalAvatarConfig = {
  [key in Festival]?: number;
};

export type AvatarConfigBase = {
  accessories: number;
  beard: number;
  details: number;
  eyebrows: number;
  eyes: number;
  face: number;
  glasses: number;
  hair: number;
  mouth: number;
  nose: number;
};

export type AvatarConfigExtra = AvatarConfigBase & FestivalAvatarConfig;

export type BackgroundShape = 'circle' | 'square' | 'none';

export type AvatarBackgroundConfig = {
  color: string;
  shape: BackgroundShape;
};

export type AvatarPickerConfig = {
  part: AvatarPartExtra;
  index: number;
};

export type ShapeStyle = {
  [key in BackgroundShape]: string;
};

export type AvatarPart = keyof AvatarConfigBase;
export type AvatarPartExtra = AvatarPart | Festival;

export type ImageType = 'png' | 'svg';

export type ImageApiType = {
  [key in ImageType]: string;
};

export type AvatarConfig = {
  flip: number;
} & AvatarConfigBase &
  AvatarBackgroundConfig;
