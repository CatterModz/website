import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@web": path.resolve(__dirname, "./src"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@stores": path.resolve(__dirname, "./src/stores"),
      "@css": path.resolve(__dirname, "./src/css"),
    },
  },
  server: {
    proxy: { "/api": "http://localhost:3001" },
  },
});