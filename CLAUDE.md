# Handoff: case-study design

Work on the current portfolio only. The canonical entry is `portfolio/index.html`, which loads `portfolio/sky/main.jsx`. `/sky/` loads that same implementation.

The user approved the current homepage. Scope this handoff to case-study design; preserve the hero, sky colors/cloud animation, nature audio and navigation behavior unless the user asks otherwise.

Primary project case renderer: `CaseStudy` in `portfolio/sky/main.jsx`.
Primary case content: `portfolio/case-studies/content.js`.
Independent case renderer/content: `portfolio/sky/stories/`.

Follow `DESIGN_SYSTEM.md`. Preserve confidentiality and attribution, label reconstructed visuals, and never invent research, shipped status or outcomes. Keep normal document scrolling and 14px index navigation.

Run `npm run build`; visually check affected cases on desktop and mobile. There is no lint/typecheck command. Do not publish without user authorization.
