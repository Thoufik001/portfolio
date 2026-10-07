# Portfolio design system

A calm product portfolio with useful interactions. Geist carries the hierarchy; work imagery carries the color. The system applies to the current homepage, case studies and foundation preview. Earlier versions under `/previous/` and `/studio/` remain archived experiments.

## Source of truth

- `portfolio/styles/tokens.css`: primitives, semantic colors, themes, type, space, radius and motion tokens.
- `portfolio/styles/base.css`: one font import, reset, focus treatment and reduced-motion behavior.
- `portfolio/styles/typography.css`: default heading hierarchy and reusable type roles.
- `portfolio/components/`: reusable components with scoped styles.
- `portfolio/hooks/`: reusable behavior without presentation.
- `portfolio/case-studies/content.js`: case-study content, separated from rendering.
- `portfolio/folio/`: current homepage composition and interactive illustrations.
- `/design-system/`: rendered foundation reference.

## Typography

Geist Variable, self-hosted WOFF2, regular 400, medium 500, semibold 600. No second family. Body copy uses normal tracking and a 1.65 line height. Headings use -0.035em tracking and 1.2 line height. Long-form prose has a 35rem maximum measure.

| Role | Size | Use |
| --- | --- | --- |
| Caption | 12px | Project attribution, image captions |
| Label | 14px | Navigation, index, short controls |
| Body | 16px | Reading copy |
| Lead | 18px | Introductory paragraphs |
| Subheading | 20px | Small feature headings |
| Title | 24px | Project titles, case-study section headings |
| Section | 32px | Homepage section headings |
| Case title | 32–40px | Case-study h1 |
| Display | 36–56px | Homepage h1 |

9–11px demo tokens belong only inside miniature interface illustrations; never use them for portfolio navigation or reading copy. Semantic heading levels follow the document outline, independently of utility classes.

## Color

Components consume semantic colors. Light mode: white page, #f8f8f8 surface, #242424 text, #626262 secondary text, #3157c8 accent. Dark mode: #111111 page, #181818 surface, #eeeeee text, #adadad secondary text, #a7bbff accent. Outlines belong inside controls and interface illustrations; no chapter dividers. Blue indicates an action, selection or focus. Product imagery keeps its original colors.

## Spacing and components

Use the 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px spacing steps. Page gutters scale from 20 to 40px. Case prose is narrower than visual evidence. Controls use a 6px radius, preview surfaces 12px, dialogs 16px. No default shadow on editorial content.

The case index uses 14px regular text, 21px line height, 8px between targets, and a 32px gap after its return link. It is sticky on wide layouts and flows above the story on narrow screens. Active state uses text emphasis and `aria-current`, with no divider or accent bar.

Motion follows user input and respects reduced motion. Keep ordinary feedback to 150ms. Do not animate every paragraph on scroll.

## Project art direction

Surreal imagery lives inside project covers, surrounded by generous white space and quiet typography. A shared `ProjectWorld` component preserves presentation consistency while `portfolio/data/projectWorlds.js` assigns an individual world: floating gardens for ZyephrOS, botanical signal for Aceteroid, impossible summer for Airtribe, and pixel orbit for NotchPark. These original backgrounds are decorative art, separate from product evidence. Keep interface screenshots sharp and readable; do not apply the imagery behind long-form prose.

## Personal mark

The supplied continuous-line logo is the identity source in `portfolio/components/brand/Logo.jsx`. Preserve its path proportions. Use it in the header and favicon; the hero samples that exact stroke into a flat teal particle mark viewed in 3D. Dust assembles on entrance; pointer movement tilts the plane, and clicking or the labelled button scatters and reassembles it, renders only while visible and changing, and falls back to the SVG when reduced motion is requested or WebGL is unavailable.

## Icons

Use Hugeicons through `portfolio/components/ui/Icon.jsx`. All icons use the free stroke style at 1.5px stroke width: 18px for ordinary controls, 16px beside 14px navigation text, and 12–16px only inside miniature interface illustrations. Icons inherit text color. Decorative icons are hidden from assistive technology; icon-only controls carry an accessible label. Do not use Unicode arrow glyphs as UI icons.

## Build conventions

Read this file before changing visual rules. Define a new role in the foundation when a shared need arises, rather than adding a page-specific near-duplicate. Keep selectors scoped to a component or page. Never import an archived page's CSS into current pages. Change existing component rules instead of appending override blocks. Keep synthetic illustrations labelled and never invent outcome metrics. Verify the homepage, one complete case study, and the foundation preview at desktop and mobile widths after shared changes.

The CRM reference informed the separation of foundations, components, content and hooks. Its app-specific colors, dashboard type scale and framework are not the portfolio's visual specification.
