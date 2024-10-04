import path from "path";
import fg from "fast-glob";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import external from "vite-plugin-external";

import pkg from "./package.json";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    target: "es2021",
    lib: {
      entry: fg.globSync(path.resolve(__dirname, "src/**/*.ts")),
      name: "[name].js",
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        format: "cjs",
      },
      external: [/node_modules/],
    },
  },
  plugins: [
    dts(),
    external({
      nodeBuiltins: true,
      externalizeDeps: Object.keys(pkg.dependencies),
    }),
  ],
});
