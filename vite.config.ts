import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwind from "@tailwindcss/vite"
import path from "path";
import runableWebsiteRuntime from "runable-website-runtime"

export default defineConfig({
        plugins: [react(), runableWebsiteRuntime(), cloudflare(), tailwind()],
        resolve: {
                alias: {
                        "@": path.resolve(__dirname, "./src/web"),
                },
        },
        server: {
                host: '0.0.0.0',
                port: parseInt(process.env.PORT || '6636'),
                allowedHosts: true,
                strictPort: true,
                proxy: {
                        '/api': {
                                target: 'http://localhost:3000',
                                changeOrigin: true,
                        }
                }
        }
});
