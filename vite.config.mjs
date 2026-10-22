import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';

// Files the app needs at the site root that index.html does not import, so Vite
// would not emit them on its own. They are copied byte-for-byte, unhashed, because
// other files point at them by fixed name (site.webmanifest -> icon.png, browsers
// -> favicon.ico/robots.txt, GitHub Pages -> 404.html).
//
// index.html must never be in this list: Vite already emits it from the HTML entry.
// The webpack build broke exactly that way (CopyWebpackPlugin copied index.html
// while HtmlWebpackPlugin generated it: "Multiple assets emit different content to
// the same filename index.html"). onwarn below turns any such collision into an error.
const STATIC_FILES = ['404.html', 'favicon.ico', 'icon.png', 'icon.svg', 'robots.txt', 'site.webmanifest'];
// Directories copied whole, as the webpack build did (assets/screenshots are linked
// from the README and were published with the site).
const STATIC_DIRS = ['assets'];

const staticFiles = () => [
  ...STATIC_FILES,
  ...STATIC_DIRS.flatMap((dir) =>
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => join(e.parentPath, e.name).replaceAll('\\', '/')),
  ),
];

function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    apply: 'build',
    generateBundle() {
      for (const fileName of staticFiles()) {
        this.emitFile({ type: 'asset', fileName, source: readFileSync(fileName) });
      }
    },
  };
}

export default defineConfig({
  // Relative URLs: the site is served from a sub-path on GitHub Pages
  // (/five-osteopathic-models-guide/) and can also be opened from disk.
  base: './',
  // Static files live at the repository root (the unbuilt tree is publishable as is),
  // not in a public/ directory.
  publicDir: false,
  plugins: [copyStaticFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'FILE_NAME_CONFLICT') throw new Error(warning.message);
        warn(warning);
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
