import path from 'node:path';
import { createRequire } from 'node:module';

import { defineConfig } from 'vite';
import { defineConfig, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const require = createRequire(import.meta.url);

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({

	build: {
		rollupOptions: {
			external: ["@emotion/react"]
		}
	},
	plugins: [react(),


	viteStaticCopy({
		targets: [
			{
				src: cMapsDir,
				dest: '',
			},
		],
	}),
	],
})

