import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import cloudflare from '@astrojs/cloudflare';
import { sanityConfig } from './src/utils/sanity-client';

// `astro dev` (static site) doesn't need the Cloudflare worker runtime. The @astrojs/cloudflare
// v14 adapter injects a `main` entrypoint for `astro dev` but omits `moduleType`, which wrangler
// 4.x rejects with "Missing field `moduleType`". Since this is a static blog (no CF runtime APIs
// used at request time), we skip the adapter in dev and keep it for build/deploy.
const isDev = process.argv.includes('dev');
const cloudflareAdapter = isDev ? [] : [cloudflare({ prerenderEnvironment: 'node', imageService: 'passthrough' })];

// https://astro.build/config
export default defineConfig({
    output: 'static',
    session: { driver: 'memory' },
    image: {
        domains: ['cdn.sanity.io']
    },
    integrations: [sanity(sanityConfig), ...cloudflareAdapter],
    vite: {
        plugins: [tailwindcss()],
        server: {
            ws: { path: '/vite-hmr/' },
            allowedHosts: ['.netlify.app']
        }
    },
    server: {
        port: 3000
    }
});
