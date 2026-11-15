import { shellBuild } from "@domicile-desktop/component-library/vite-shell";
import { defineConfig } from "vite";
import { options } from "./src/imagine/options.ts";

const shell = shellBuild({ entry: "src/index.tsx", options });

export default defineConfig({
  ...shell,
  build: { ...shell.build, outDir: "dist", emptyOutDir: true },
});
