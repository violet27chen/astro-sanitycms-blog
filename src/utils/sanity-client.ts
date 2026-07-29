import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnv } from 'vite';
import { createClient, type ClientConfig, type SanityClient } from '@sanity/client';

// Vite's loadEnv only reads .env files, NOT process.env — so also read build-time env (Cloudflare) directly.
const envFromFile = loadEnv(process.env.NODE_ENV || '', process.cwd(), '');
// Precedence: Node/Cloudflare build env -> local .env file -> hardcoded real project (prod dataset is public-readable).
const projectId = process.env.SANITY_PROJECT_ID || envFromFile.SANITY_PROJECT_ID || '3hwpvo77';
const dataset = process.env.SANITY_DATASET || envFromFile.SANITY_DATASET || 'production';
const token = process.env.SANITY_TOKEN || envFromFile.SANITY_TOKEN; // optional: prod dataset is public-readable
const isDev = import.meta.env.DEV;
const isDeployPreview = process.env.CONTEXT === 'deploy-preview';
const previewDrafts =
    process.env.STACKBIT_PREVIEW?.toLowerCase() === 'true' ||
    process.env.SANITY_PREVIEW_DRAFTS?.toLowerCase() === 'true' ||
    envFromFile.STACKBIT_PREVIEW?.toLowerCase() === 'true' ||
    envFromFile.SANITY_PREVIEW_DRAFTS?.toLowerCase() === 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sanityConfig: ClientConfig = {
    projectId,
    dataset,
    useCdn: false,
    apiVersion: '2024-01-31',
    token,
    perspective: isDev || isDeployPreview || previewDrafts ? 'previewDrafts' : 'published'
};

export const client = createClient(sanityConfig);

/**
 * @param {SanityClient} client The Sanity client to add the listener to
 * @param {Array<String>} types An array of types the listener should take an action on
 * Creating Sanity listener to subscribe to whenever a new document is created or deleted to refresh the list in Create
 */
// Only subscribe to realtime updates in dev — keeps the SSG build from hanging on an open WebSocket.
if (isDev) {
    [{ client: client, types: ['page'] }].forEach(({ client, types }: { client: SanityClient; types: Array<String> }) =>
        client.listen(`*[_type in ${JSON.stringify(types)}]`, {}, { visibility: 'query' }).subscribe(async (event: any) => {
            // only refresh when pages are deleted or created
            if (event.transition === 'appear' || event.transition === 'disappear') {
                const filePath = path.join(__dirname, '../layouts/Layout.astro');
                const time = new Date();

                // update the updatedat stamp for the layout file, triggering astro to refresh the data in getStaticPaths
                await fs.promises.utimes(filePath, time, time);
            }
        })
    );
}
