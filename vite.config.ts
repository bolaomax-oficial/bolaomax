import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";

/**
 * Vite config — Railway / Node production
 *
 * Build:  npm run build  → gera dist/index.html + dist/assets/*
 * Dev:    npm run dev:web → Vite dev server com proxy para API local
 */
export default defineConfig({
  plugins: [react(), tailwind()],

  base: "/",

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/web"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // code splitting manual para reduzir bundle
        manualChunks: {
          vendor:  ["react", "react-dom", "wouter"],
          ui:      ["lucide-react", "react-icons", "class-variance-authority", "clsx", "tailwind-merge"],
          forms:   ["react-hook-form", "zod"],
          radix:   ["@radix-ui/react-checkbox", "@radix-ui/react-label", "@radix-ui/react-slot"],
        },
      },
    },
  },

  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.VITE_PORT || "5173"),
    strictPort: true,
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.PORT || 3000}`,
        changeOrigin: true,
      },
    },
  },
});
