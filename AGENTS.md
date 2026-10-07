# Portfolio conventions

Read `DESIGN_SYSTEM.md` before visual changes. Current pages import `portfolio/styles/base.css`; archived experiments are isolated. Use semantic tokens from `portfolio/styles/tokens.css`. Shared navigation lives in `portfolio/components/navigation`; shared behavior in `portfolio/hooks`; case content in `portfolio/case-studies/content.js`.

Use installed project skills in `.agents/skills` when applicable: typography, layout, colors, UI and accessibility. Do not use Supabase skills unless a database task is actually requested.

Keep existing rules coherent; do not append fixes on top of conflicting rules. Use normal document scrolling, no chapter separators, and 14px index navigation. Preserve confidentiality and label reconstructed visuals. Do not fabricate shipped status, research or outcomes.

Run `npm run build` and visually verify desktop and mobile for the affected routes. Preserve earlier portfolio experiments. Do not publish to GitHub or a host unless requested.
