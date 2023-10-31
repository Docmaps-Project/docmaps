// vite.config.js
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "DocmapsWidget",
      // the proper extensions will be added
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {},
  },
  plugins: [dts()]
});
