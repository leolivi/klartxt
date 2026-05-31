import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "src/website"),
  publicDir: path.resolve(__dirname, "public"),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "website-build"),
    emptyOutDir: true,
  },
  css: {
    postcss: path.resolve(__dirname, "postcss.config.js"),
  },
});
