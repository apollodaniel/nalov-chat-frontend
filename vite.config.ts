import path from 'node:path';
import { createRequire } from 'node:module';

import { defineConfig } from 'vite';
import { defineConfig, normalizePath } from 'vite';

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({

	  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    },
  },plugins: [react(),


	],
})

