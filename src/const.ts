import { AvatarConfigBase, AvatarBackgroundConfig, ShapeStyle } from './types';

export const AvatarStyleCount: AvatarConfigBase = {
  face: 10,
  nose: 10,
  mouth: 10,
  eyes: 10,
  eyebrows: 10,
  glasses: 10,
  hair: 30,
  accessories: 10,
  details: 10,
  beard: 10,
};

export const CompatibleAgents = ['quark', 'micromessenger', 'weibo', 'douban'];

export const PalettePreset = [
  '#fa541c',
  '#faad14',
  '#fadb14',
  '#a0d911',
  '#52c41a',
  '#1890ff',
  '#2f54eb',
  '#722ed1',
  '#eb2f96',
  '#bfbfbf',
];

export const DefaultBackgroundConfig: AvatarBackgroundConfig = {
  color: 'rgba(255, 0, 0, 0)',
  shape: 'none',
};

export const ShapeStyleMapping: ShapeStyle = {
  circle: 'rounded-full',
  square: 'rounded-lg',
  none: '',
};

export const SVGFilter = `<defs>
  <filter id="filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB">
    <feMorphology operator="dilate" radius="20 20" in="SourceAlpha" result="morphology"/>
    <feFlood flood-color="#ffffff" flood-opacity="1" result="flood"/>
    <feComposite in="flood" in2="morphology" operator="in" result="composite"/>
    <feMerge result="merge">
          <feMergeNode in="composite" result="mergeNode"/>
      <feMergeNode in="SourceGraphic" result="mergeNode1"/>
      </feMerge>
  </filter>
</defs>`;
