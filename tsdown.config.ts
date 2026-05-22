import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/adapters/durable-object.ts"],
  exclude: [/\.test\.ts$/, /\.test-d\.ts$/, /_test-/],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2023",
  platform: "neutral",
  external: ["cloudflare:workers"],
});
