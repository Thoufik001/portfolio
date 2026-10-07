import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  root: "portfolio",
  plugins: [react()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL("portfolio/index.html", import.meta.url)),
        previous: fileURLToPath(new URL("portfolio/previous/index.html", import.meta.url)),
        folio: fileURLToPath(new URL("portfolio/folio/index.html", import.meta.url)),
        studio: fileURLToPath(new URL("portfolio/studio/index.html", import.meta.url)),
        sky: fileURLToPath(new URL("portfolio/sky/index.html", import.meta.url)),
        studies: fileURLToPath(new URL("portfolio/case-studies/index.html", import.meta.url)),
        system: fileURLToPath(new URL("portfolio/design-system/index.html", import.meta.url)),
      },
    },
  },
  server: { host: "127.0.0.1", port: 4173 },
});
