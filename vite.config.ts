import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		cssTarget: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14']
	},
	server: {
		allowedHosts: [
			'localhost',
			'127.0.0.1',
			'.ngrok-free.app',
			'.ngrok.io'
		]
	}
});
