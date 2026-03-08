import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const httpsConfig = mode === 'development' ? {
    key: fs.readFileSync('./devops/ssl/certs/server.key'),
    cert: fs.readFileSync('./devops/ssl/certs/server.crt'),
  } : undefined;

  return {
    server: {
      host: "localhost",
      port: 8080,
      https: httpsConfig,
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
    /* --- ADDED FOR TESTING --- */
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/tests/setup.ts",
    },
  };
});