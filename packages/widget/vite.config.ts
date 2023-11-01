import { defineConfig, UserConfig } from 'vite'
import dts from 'vite-plugin-dts'

export const widgetConfig: UserConfig = {
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'DocmapsWidget',
      // the proper extensions will be added
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {},
  },
  plugins: [dts()],
}

export default defineConfig(widgetConfig)
