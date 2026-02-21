import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite"
import path from "path";
import runableWebsiteRuntime from "runable-website-runtime"

export default defineConfig({
	plugins: [
		react(), 
		runableWebsiteRuntime(), 
		tailwind()
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src/web"),
		},
	},
	server: {
		host: '0.0.0.0',
		port: 5174,
		allowedHosts: true,
		proxy: {
			'/api': {
				target: 'http://localhost:5174',
				changeOrigin: true,
			}
		}
	},
	build: {
		outDir: 'dist',
		sourcemap: false,
		minify: 'esbuild',
		target: 'es2020',
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// React and related packages
					if (id.includes('node_modules/react') || 
						id.includes('node_modules/react-dom') ||
						id.includes('node_modules/scheduler')) {
						return 'react-vendor';
					}
					// UI components library (radix, etc)
					if (id.includes('node_modules/@radix-ui') ||
						id.includes('node_modules/class-variance-authority') ||
						id.includes('node_modules/clsx') ||
						id.includes('node_modules/tailwind-merge')) {
						return 'ui-vendor';
					}
					// Lucide icons
					if (id.includes('node_modules/lucide-react')) {
						return 'icons';
					}
					// Admin pages - lazy loaded
					if (id.includes('/pages/admin/')) {
						return 'admin';
					}
				},
			},
		},
	},
	optimizeDeps: {
		include: ['react', 'react-dom', 'wouter'],
	},
});
