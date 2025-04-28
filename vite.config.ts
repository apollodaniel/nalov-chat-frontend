import path from "path";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	resolve: {
		alias: {
		  '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
		}
	},
	logLevel: 'error',
	plugins: [
		react(),
	],
	server: {
		proxy: {
			'/v1': {
				target: 'http://localhost:8751',
				rewrite: (path) => path.replace('/v1', ''),
			},
			'/v1/ws': {
				target: 'ws://localhost:8081',
				rewrite: (path) => path.replace('/v1/ws', ''),
			},
		},
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Resource-Policy': 'same-origin',
		},
	},
});
