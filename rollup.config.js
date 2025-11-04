import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';

const clientConfig = {
	input: 'src/client/index.ts',
	output: [
		{
			file: 'dist/client/index.js',
			format: 'cjs',
			sourcemap: true,
		},
		{
			file: 'dist/client/index.esm.js',
			format: 'esm',
			sourcemap: true,
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve(),
		postcss({
			minimize: true,
			use: ['sass'],
			sourceMap: true,
			include: /\.scss$/,
		}),
		commonjs(),
		json(),
		typescript({ tsconfig: './tsconfig.client.json' }),
		copy({
			targets: [
				{ src: 'eslint.mjs', dest: 'dist/client' },
				{ src: 'node_modules/rc-slider/assets/index.css', dest: 'dist/client', rename: 'rc-slider.css' },
			],
		}),
		terser(),
	],
	external: ['react', 'react-dom'],
};

const clientTypesConfig = {
	input: 'src/client/index.ts',
	output: [
		{
			file: 'dist/client/index.d.ts',
		},
	],
	plugins: [dts.default()],
	external: [/\.(scss|css)$/],
};

const serverConfig = {
	input: 'src/server/index.ts',
	output: [
		{
			file: 'dist/server/index.js',
			format: 'cjs',
			sourcemap: true,
		},
		{
			file: 'dist/server/index.esm.js',
			format: 'esm',
			sourcemap: true,
		},
	],
	plugins: [
		peerDepsExternal(),
		resolve(),
		commonjs(),
		json(),
		typescript({ tsconfig: './tsconfig.server.json' }),
		terser(),
	],
	external: ['child_process', 'fs', 'process', 'path'],
};

const serverTypesConfig = {
	input: 'src/server/index.ts',
	output: [
		{
			file: 'dist/server/index.d.ts',
		},
	],
	plugins: [dts.default()],
};

export default [clientConfig, clientTypesConfig, serverConfig, serverTypesConfig];