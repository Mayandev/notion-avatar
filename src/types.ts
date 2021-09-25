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

export type AvatarConfig = {
  accessories: number,
  beard: number,
  details: number,
  eyebrows: number,
  eyes: number,
  face: number,
  glasses: number,
  hair: number,
  mouth: number,
  nose: number,
}

export type AvatarPart = keyof AvatarConfig