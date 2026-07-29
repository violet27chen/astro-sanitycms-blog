import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import cloudflare from '@astrojs/cloudflare';
import { sanityConfig } from './src/utils/sanity-client';

// https://astro.build/config
export default defineConfig({
    output: 'static',
    image: {
        domains: ['cdn.sanity.io']
    },
    integrations: [sanity(sanityConfig), cloudflare({ prerenderEnvironment: 'node', imageService: 'passthrough' })],
    vite: {
        plugins: [tailwindcss()],
        server: {
            hmr: { path: '/vite-hmr/' },
            allowedHosts: ['.netlify.app']
        }
    },
    server: {
        port: 3000
    }
});
