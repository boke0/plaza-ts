import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    include: ["src/adapters/**/*.test.ts"],
    poolOptions: {
      workers: {
        isolatedStorage: false,
        singleWorker: true,
        miniflare: {
          compatibilityDate: "2025-05-01",
          compatibilityFlags: ["nodejs_compat"],
          durableObjects: {
            CHAT_ROOM: "ChatRoom",
          },
        },
        main: "./src/adapters/_test-worker.ts",
      },
    },
  },
});
