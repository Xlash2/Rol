import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mkcert from "vite-plugin-mkcert";

import { VitePWA } from "vite-plugin-pwa";
import { visualizer } from "rollup-plugin-visualizer";
import path from "node:path";
import fs from "node:fs";

// https://vite.dev/config/
export default defineConfig({
  base: "./",

  build: {
    rolldownOptions: {
      output: {
        codeSplitting: false,
      },
    },
  },

  optimizeDeps: {
    exclude: ["@babylonjs/havok"],
  },
  plugins: [
    svelte(),
    mkcert(),
    VitePWA({
      registerType: "prompt",
      injectRegister: false,

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "Rol",
        short_name: "Rol",
        description: "Gyro in fantasy",
        background_color: "rgb(0, 0, 0)",
        theme_color: "rgb(0, 0, 0)",
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,ttf,wasm,glb,ogg}"],
        maximumFileSizeToCacheInBytes: 100000000,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: false,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
    visualizer({
      open: true,
      filename: "stats.html",
    }),
    {
      name: "post-build-delete",
      closeBundle() {
        const fileToDelete = path.resolve(__dirname, "dist/icon.png");
        if (fs.existsSync(fileToDelete)) {
          fs.rmSync(fileToDelete);
        }
      },
    },
  ],
});
