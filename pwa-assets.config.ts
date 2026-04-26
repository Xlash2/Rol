import {
  defineConfig,
  minimal2023Preset as preset,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023",
  },
  preset: {
    ...preset,
    maskable: {
      ...preset.maskable,
      resizeOptions: {
        background: "rgb(0, 0, 0)",
      },
    },
    apple: {
      ...preset.apple,
      resizeOptions: {
        background: "rgb(0, 0, 0)",
      },
    },
  },

  images: ["public/icon.png"],
});
