import path from 'node:path';
import { createRequire } from 'node:module';

import { defineConfig } from 'vite';
import { defineConfig, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const require = createRequire(import.meta.url);

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),

		viteStaticCopy({
			targets: [
				{
					src: cMapsDir,
					dest: '',
				},
			],
		}),
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
