# Thoufik portfolio

React/Vite portfolio with a shared Geist design system.

## Develop

```sh
npm install
npm run dev
npm run build
```

## Routes

- `/`: Sky portfolio
- `/sky/`: Sky portfolio alias
- `/folio/`: preserved earlier portfolio
- `/case-studies/?project=zyephr|sap|learning`: case studies
- `/design-system/`: live typography, colors and reading reference
- `/previous/`, `/studio/`: preserved earlier experiments

Read `DESIGN_SYSTEM.md` for the foundation and `AGENTS.md` for build conventions. Shared CSS lives in `portfolio/styles`, reusable navigation in `portfolio/components`, reusable behavior in `portfolio/hooks`. Project skills are installed in `.agents/skills`.

The ZyephrOS visuals are abstracted with synthetic content. No measured outcomes are invented. Current drafts require confirmation of historical project details before publication.

GitHub: https://github.com/Thoufik001/portfolio

Production: https://thoufik-abdullah.vercel.app. Vercel project: `thoufik`. The original requested address `thoufik.vercel.app` is already claimed. Vercel builds with `npm run build` and serves `dist`; Sky is the root homepage. Local development commands do not publish changes.
