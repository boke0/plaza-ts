import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "hono/jsx/dom",
  },
  build: {
    outDir: "public",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/client.tsx",
      output: {
        entryFileNames: "client.js",
        format: "es",
      },
      preserveEntrySignatures: false,
    },
  },
});
