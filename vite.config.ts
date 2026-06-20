import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";
import {crx} from "@crxjs/vite-plugin";
import manifest from "./public/manifest.json";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react(), crx({manifest})],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    __PLAYWRIGHT_TEST__: mode === "e2e",
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      host: "localhost",
      port: 5174,
    },
  },
  build: {
    outDir: "build",
  },
  css: {
    postcss: "./postcss.config.js",
  },
}));
