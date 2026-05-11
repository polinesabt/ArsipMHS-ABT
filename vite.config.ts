import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// Base path dari .env (dev) / .env.production (build). Tanpa hardcode.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appBase = (env.VITE_APP_BASE ?? "/").replace(/([^/])$/, "$1/");
  const devApiTarget = env.VITE_DEV_API_TARGET || "http://localhost/Arsipmhs2/backend/api";
  return {
  base: appBase,
  server: {
    host: "::",
    port: 8080,
    proxy:
      mode === "development"
        ? {
            "/api": {
              target: devApiTarget,
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api/, ""),
            },
          }
        : undefined,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },
};
});
