import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  server: {
    port: 5173,
    host: true,
    open: "/public/index.html"
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, "public/index.html")
      }
    }
  }
});
