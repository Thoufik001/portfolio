import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import clouds from "./api/clouds.js";
export default defineConfig({
  root: "portfolio",
  plugins: [react(), {
    name: "local-cloud-observations",
    configureServer(server) { server.middlewares.use("/api/clouds", (req, res) => clouds(req, res)); },
    configurePreviewServer(server) { server.middlewares.use("/api/clouds", (req, res) => clouds(req, res)); },
  }],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL("portfolio/index.html", import.meta.url)),
        sky: fileURLToPath(new URL("portfolio/sky/index.html", import.meta.url)),
      },
    },
  },
  server: { host: "127.0.0.1", port: 4173, watch: { usePolling: true, interval: 250 } },
});
