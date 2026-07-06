// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // base: "/",
  base: "/admin",
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["react-apexcharts", "apexcharts", "d3-org-chart"],
  },
  build: {
    cssMinify: false,
  },
});
