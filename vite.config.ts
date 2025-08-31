import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	plugins: [
		preact({
			prefreshEnabled: true,
			babel: {
				presets: [
					'@babel/preset-typescript',
				],
				plugins: [
					"babel-plugin-transform-typescript-metadata",
					['@babel/plugin-proposal-decorators', { legacy: true }],
					['@babel/plugin-proposal-class-properties', { loose: true }],
				]
			}
		}),
		checker({
			typescript: { buildMode: true }
		}),
	],
	build: {
		rollupOptions: {
			preserveSymlinks: true,
		},
		emptyOutDir: mode !== 'dev',
		sourcemap: mode == 'dev',
		manifest: false,
		minify: mode == 'dev' ? 'esbuild' : 'terser',
	},
}));
