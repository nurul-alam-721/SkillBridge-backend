import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  outDir: "dist",
  clean: true,
  bundle: true,
  sourcemap: true,
  splitting: false,
  target: "node20",
  platform: "node",
  esbuildOptions(options) {
    options.platform = "node";
  }
});