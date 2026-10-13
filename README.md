# Thoufik portfolio — current approved version

This repository contains the current portfolio served locally at http://127.0.0.1:4173/.
There is one portfolio implementation. `/sky/` is an alias of the same version, retained for existing navigation links. Earlier `/folio/`, `/studio/`, `/previous/`, and standalone case-study experiments are not included.

## Run

```sh
npm ci
npm run dev
npm run build
```

## Case-study handoff

Read `CLAUDE.md`, `AGENTS.md`, and `DESIGN_SYSTEM.md` before editing.

- `portfolio/sky/main.jsx`: homepage and the current `CaseStudy` renderer.
- `portfolio/case-studies/content.js`: ZyephrOS, Airtribe and Aceteroid case content.
- `portfolio/sky/stories/`: independent project stories and their current renderer.
- `portfolio/sky/style.css`, `case-index.css`, `work-projects.css`: current route styles.
- `portfolio/public/`: project visuals, brand marks, audio and attribution files.
- `portfolio/styles/`: shared foundations.

Open current case studies using `/?project=zyephr`, `/?project=learning`, `/?project=sap`, `/?project=tesseract`, `/?project=diary`, or `/?project=courage`.

The approved hero, sky palette, cloud movement, navigation and audio should stay unchanged during case-study design work unless explicitly requested. The sunset orange is the approved softened blend. Do not reintroduce the rejected cloud-gap sunray experiment or liquid-glass navigation.

## Configuration

Environment files and credentials are intentionally excluded. The current frontend works without local secrets; optional contact/activity services require the existing deployment environment. `api/clouds.js` supplies optional nearby cloud observations. `neon/`, `neon.ts` and `scripts/` contain current service source, not another portfolio version. `portfolio/activity/` is an owner maintenance tool and is not a build entry.

Build output, dependencies, working notes and local backups are not committed.
