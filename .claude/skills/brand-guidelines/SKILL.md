---
name: brand-guidelines
description: Applies Notion Avatar's hand-drawn minimalist style to any artifact that may benefit from having the project's look-and-feel. Use it when brand colors, style guidelines, visual formatting, or design standards apply.
license: Complete terms in LICENSE.txt
---

# Notion Avatar Brand Styling - Hand-Drawn Minimalist Style

## Overview

To access Notion Avatar's official brand identity and style resources, use this skill.

**Keywords**: branding, corporate identity, visual identity, post-processing, styling, brand colors, typography, hand-drawn style, minimalist design, visual formatting, visual design

## Brand Guidelines

### Design Philosophy

Notion Avatar follows a **hand-drawn minimalist aesthetic** characterized by:
- Clean, simple layouts with generous white space
- Hand-drawn SVG illustrations and decorative elements
- Bold, confident strokes and borders
- Playful yet refined visual language
- Emphasis on clarity and ease of use

### Colors

**Primary Colors:**

- Background: `#fffefc` - Warm off-white background (primary surface)
- Primary Text/Border: `#000000` - Pure black for text and borders
- Secondary Text: `#6b7280` (gray-500) - For secondary information
- Body Text: `#374151` (gray-700) - For body content
- Heading Text: `#111827` (gray-900) - For headings

**Interactive States:**

- Hover Background: `#f9fafb` (gray-50) - Subtle hover states
- Active Background: `#f3f4f6` (gray-100) - Active/pressed states
- Border Hover: `#000000` - Black borders on hover

**Accent Colors:**

- Use sparingly for special elements
- Maintain high contrast with background
- Prefer black/white/gray palette for consistency

### Typography

- **Primary Font**: Quicksand (font-weight: 600, semi-bold)
- **Font Stack**: `'Quicksand', system-ui, -apple-system, BlinkMacSystemFont, Helvetica Neue, PingFang SC, Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC, WenQuanYi Micro Hei, sans-serif`
- **Font Weight**: 600 (semi-bold) for all text
- **Font Style**: Hand-drawn, friendly, approachable
- **Note**: Quicksand font file is located at `/fonts/Quicksand.ttf`

### Visual Elements

**Borders:**

- Use thick borders for emphasis: `border-3` (3px) or `border-4` (4px)
- Border color: `#000000` (black)
- Border style: `solid` for most elements
- Border radius: `rounded` or `rounded-full` for buttons and cards

**Buttons:**

- Primary (filled): `bg-black text-white font-bold py-2 px-4 rounded-full hover:bg-gray-800`
- Secondary (outlined): `border-3 border-black text-black font-bold py-2 px-4 rounded-full hover:bg-gray-50`
- Tab buttons: `px-6 py-2 rounded-full border-2 border-black transition-colors`
  - Active: `bg-black text-white`
  - Inactive: `bg-transparent text-black hover:bg-gray-100`

**Cards & Containers:**

- Background: `bg-white`
- Border: `border-3 border-black` or `border-4 border-black`
- Border radius: `rounded-lg`
- Shadow: Minimal or none (prefer borders over shadows)

**Icons & Illustrations:**

- SVG format with hand-drawn style
- Stroke width: 24px for avatar parts, variable for icons
- Stroke color: `#000000` (black)
- Fill: Transparent or white for faces
- Line caps: `round`
- Line joins: `round`

## Features

### Hand-Drawn Aesthetic

- All SVG graphics use hand-drawn, organic lines
- Avoid perfect geometric shapes - slight imperfections add character
- Use rounded line caps and joins for softer appearance
- Decorative elements (like header decoration) add visual interest

### Minimalist Layout

- Generous white space (`#fffefc` background)
- Clean, uncluttered interfaces
- Clear visual hierarchy through size and weight
- Simple, intuitive navigation

### Bold Borders

- Thick borders (3-4px) create strong visual definition
- Black borders provide high contrast
- Rounded corners soften the boldness
- Borders replace shadows for depth

### Typography Application

- Quicksand font throughout for consistency
- Semi-bold weight (600) maintains readability
- Generous line height for body text
- Clear hierarchy through size, not weight variation

## Technical Details

### Font Management

- Quicksand font is loaded via `@font-face` in `global.css`
- Font file location: `/public/fonts/Quicksand.ttf`
- Font display: `swap` for better performance
- Fallback to system fonts ensures compatibility

### Color Application

- Use Tailwind CSS classes for consistency
- Custom colors defined in `tailwind.config.js` if needed
- Background color applied to `html` element: `#fffefc`
- Maintain high contrast ratios for accessibility

### Border Implementation

- Tailwind border width utilities: `border-3`, `border-4`
- Border color: `border-black` (`#000000`)
- Border radius: `rounded`, `rounded-lg`, `rounded-full`
- Border style: `border-solid` (default)

### SVG Guidelines

- Use hand-drawn style paths, not perfect shapes
- Stroke width: 24px for avatar components, 2-4px for icons
- Stroke color: `#000000`
- Fill: Transparent or `#ffffff` for faces
- ViewBox should match intended size
- Optimize SVGs with SVGO when possible
