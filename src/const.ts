import {
  AvatarConfigBase,
  AvatarBackgroundConfig,
  ShapeStyle,
  FestivalTime,
  AvatarConfigExtra,
  AvatarPickerConfig,
} from './types';

export const AvatarStyleCount: AvatarConfigBase = {
  face: 15,
  nose: 13,
  mouth: 19,
  eyes: 13,
  eyebrows: 15,
  glasses: 14,
  hair: 58,
  accessories: 14,
  details: 13,
  beard: 16,
};

export const AvatarStyleCountExtra: AvatarConfigExtra = {
  ...AvatarStyleCount,
  halloween: 5,
  christmas: 5,
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

export const DefaultAvatarPickerConfig: AvatarPickerConfig = {
  part: 'face',
  index: 0,
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

export const FestivalTimeMapping: FestivalTime = {
  halloween: {
    start: '10-24',
    end: '11-07',
  },
  christmas: {
    start: '12-19',
    end: '12-31',
  },
};

export const FestivalTooltipEmoji = {
  halloween: '🎃',
  christmas: '🎄',
};

export const ModalKeyMap = {
  download: 'download',
  embed: 'embed',
  palette: 'palette',
  avatarPicker: 'avatarPicker',
};
