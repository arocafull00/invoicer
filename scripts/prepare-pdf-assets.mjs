import { copyFileSync, cpSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const root = dirname(require.resolve('pdfjs-dist/package.json'));
mkdirSync('public', { recursive: true });
copyFileSync(join(root, 'build/pdf.worker.min.mjs'), 'public/pdf.worker.min.mjs');
for (const directory of ['cmaps', 'wasm', 'standard_fonts']) cpSync(join(root, directory), join('public/pdfjs', directory), { recursive: true });
