import * as esbuild from 'esbuild-wasm';

let initialized = false;
const createdBlobUrls: string[] = [];

const ESM_SH_URL = 'https://esm.sh/';

const WASM_URLS = [
  'https://unpkg.com/esbuild-wasm@0.28.0/esbuild.wasm',
  'https://cdn.jsdelivr.net/npm/esbuild-wasm@0.28.0/esbuild.wasm',
  'https://esm.sh/esbuild-wasm@0.28.0/esbuild.wasm',
];

export function revokeBlobUrls(): void {
  for (const url of createdBlobUrls) {
    URL.revokeObjectURL(url);
  }
  createdBlobUrls.length = 0;
}

const resolvedPackages = new Map<string, string>();

export async function initEsbuild(): Promise<void> {
  if (initialized) return;

  const lastError: Error[] = [];
  for (const wasmURL of WASM_URLS) {
    try {
      await esbuild.initialize({ wasmURL, worker: true });
      initialized = true;
      return;
    } catch (err) {
      lastError.push(err as Error);
      if (initialized) {
        try { (esbuild as any).dispose?.(); } catch {}
        initialized = false;
      }
    }
  }

  throw new Error(
    `Failed to initialize esbuild-wasm from all CDN sources: ${lastError.map((e) => e.message).join('; ')}`
  );
}

export type ProjectType = 'react' | 'nextjs' | 'vanilla' | 'python' | 'unknown';

export interface ProjectInfo {
  type: ProjectType;
  entryPoint: string | null;
  hasIndexHtml: boolean;
  hasPython: boolean;
  cssFiles: string[];
  jsFiles: string[];
  htmlFiles: string[];
}

export function detectProjectType(files: Map<string, string>): ProjectInfo {
  const allPaths = Array.from(files.keys());
  const cssFiles = allPaths.filter((p) => p.endsWith('.css'));
  const htmlFiles = allPaths.filter((p) => p.endsWith('.html'));
  const jsFiles = allPaths.filter((p) => p.endsWith('.js') || p.endsWith('.mjs'));
  const hasIndexHtml = files.has('index.html');
  const hasPython = allPaths.some((p) => p.endsWith('.py'));

  // Next.js detection
  const nextJsCandidates = [
    'pages/index.tsx', 'pages/index.jsx', 'pages/index.js',
    'src/pages/index.tsx', 'src/pages/index.jsx', 'src/pages/index.js',
    'app/page.tsx', 'app/page.jsx', 'app/page.js',
    'src/app/page.tsx', 'src/app/page.jsx', 'src/app/page.js',
  ];
  const nextJsEntry = nextJsCandidates.find((c) => files.has(c));
  if (nextJsEntry) {
    return { type: 'nextjs', entryPoint: nextJsEntry, hasIndexHtml, hasPython, cssFiles, jsFiles, htmlFiles };
  }

  // React detection
  const reactCandidates = [
    'src/index.tsx', 'src/index.jsx', 'src/index.js', 'src/index.ts',
    'index.tsx', 'index.jsx', 'index.js', 'index.ts',
    'src/main.tsx', 'src/main.jsx', 'src/main.js', 'src/main.ts',
    'main.tsx', 'main.jsx', 'main.js', 'main.ts',
    'src/App.tsx', 'src/App.jsx', 'App.tsx', 'App.jsx',
  ];
  const reactEntry = reactCandidates.find((c) => files.has(c));
  if (reactEntry) {
    return { type: 'react', entryPoint: reactEntry, hasIndexHtml, hasPython, cssFiles, jsFiles, htmlFiles };
  }

  // Vanilla HTML
  if (hasIndexHtml) {
    return { type: 'vanilla', entryPoint: 'index.html', hasIndexHtml, hasPython, cssFiles, jsFiles, htmlFiles };
  }
  if (htmlFiles.length > 0) {
    return { type: 'vanilla', entryPoint: htmlFiles[0], hasIndexHtml, hasPython, cssFiles, jsFiles, htmlFiles };
  }
  if (jsFiles.length > 0 && !hasPython) {
    return { type: 'vanilla', entryPoint: jsFiles[0], hasIndexHtml, hasPython, cssFiles, jsFiles, htmlFiles };
  }

  // Python
  if (hasPython) {
    return { type: 'python', entryPoint: null, hasIndexHtml, hasPython, cssFiles, jsFiles, htmlFiles };
  }

  return { type: 'unknown', entryPoint: null, hasIndexHtml, hasPython, cssFiles, jsFiles, htmlFiles };
}

function getBestEntryPoint(info: ProjectInfo, files: Map<string, string>): string {
  if (info.entryPoint) return info.entryPoint;
  if (info.hasIndexHtml) return 'index.html';
  if (info.htmlFiles.length > 0) return info.htmlFiles[0];
  if (info.jsFiles.length > 0) return info.jsFiles[0];
  return 'index.tsx';
}

export function resolveFileContent(href: string, files: Map<string, string>): string | null {
  if (files.has(href)) return files.get(href)!;

  const cleaned = href.replace(/^\.\//, '');
  if (files.has(cleaned)) return files.get(cleaned)!;

  const candidates = [
    `./${cleaned}`,
    `/${cleaned}`,
    cleaned.replace(/^\/+/, ''),
  ];
  for (const c of candidates) {
    if (files.has(c)) return files.get(c)!;
  }
  return null;
}

const RUNTIME_ERROR_SCRIPT = `
<script>
window.onerror = function(msg, source, line, col, error) {
  parent.postMessage({ type: 'preview-error', message: msg + ' at ' + source + ':' + line }, '*');
};
window.addEventListener('unhandledrejection', function(e) {
  parent.postMessage({ type: 'preview-error', message: 'Unhandled Promise rejection: ' + e.reason }, '*');
});
</script>
`;

export async function buildVanillaPreview(files: Map<string, string>, entryPoint: string): Promise<string> {
  const htmlContent = entryPoint === 'index.html' ? files.get('index.html') : files.get(entryPoint);

  if (!htmlContent) {
    const cssParts: string[] = [];
    const jsParts: string[] = [];
    for (const [path, content] of files) {
      if (path.endsWith('.css')) cssParts.push(content);
      else if (path.endsWith('.js') || path.endsWith('.mjs')) jsParts.push(content);
    }
    const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${cssParts.length ? '<style>' + cssParts.join('\n') + '</style>' : ''}</head><body>${RUNTIME_ERROR_SCRIPT}${jsParts.length ? '<script>' + jsParts.join('\n') + '</script>' : ''}</body></html>`;
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    createdBlobUrls.push(url);
    return url;
  }

  let modifiedHtml = htmlContent;

  modifiedHtml = modifiedHtml.replace(
    /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
    (match, href: string) => {
      const content = resolveFileContent(href, files);
      return content !== null ? `<style>${content}</style>` : match;
    }
  );

  modifiedHtml = modifiedHtml.replace(
    /<script\s+[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi,
    (match, src: string) => {
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return match;
      const content = resolveFileContent(src, files);
      if (content !== null) {
        return `<script>${content}</script>`;
      }
      return match;
    }
  );

  // Inject runtime error capture before </head>
  modifiedHtml = modifiedHtml.replace('</head>', RUNTIME_ERROR_SCRIPT + '</head>');

  const blob = new Blob([modifiedHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  createdBlobUrls.push(url);
  return url;
}

export async function bundleFiles(files: Map<string, string>, entryPoint: string = 'index.tsx'): Promise<string> {
  const info = detectProjectType(files);
  const resolvedEntry = getBestEntryPoint(info, files);

  // Vanilla HTML project
  if (info.type === 'vanilla') {
    return buildVanillaPreview(files, resolvedEntry);
  }

  await initEsbuild();

  const virtualFS = new Map(files);

  // For Next.js projects, create a virtual entry that wraps the page as standalone React
  let actualEntry = resolvedEntry;
  if (info.type === 'nextjs') {
    const pageImportPath = resolvedEntry.replace(/\.(tsx|jsx|js)$/, '');
    const shellCode = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Page from './${pageImportPath}';
const root = document.getElementById('root') || document.body.appendChild(document.createElement('div'));
root.id = 'root';
createRoot(root).render(React.createElement(Page));
`.trim();
    virtualFS.set('__nextjs_entry.jsx', shellCode);
    actualEntry = '__nextjs_entry.jsx';
  }

  const result = await esbuild.build({
    entryPoints: [actualEntry],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    target: 'es2020',
    loader: {
      '.tsx': 'tsx',
      '.ts': 'ts',
      '.jsx': 'jsx',
      '.js': 'js',
      '.css': 'css',
      '.json': 'json',
    },
    plugins: [{
      name: 'virtual-fs',
      setup(build) {
        build.onResolve({ filter: /.*/ }, (args) => {
          if (args.kind === 'entry-point') {
            return { path: args.path, namespace: 'virtual' };
          }

          if (args.path.startsWith('./') || args.path.startsWith('../')) {
            const resolvedPath = resolvePath(args.importer, args.path, virtualFS);
            if (resolvedPath && virtualFS.has(resolvedPath)) {
              return { path: resolvedPath, namespace: 'virtual' };
            }
          }

          if (virtualFS.has(args.path)) {
            return { path: args.path, namespace: 'virtual' };
          }

          if (args.path.includes('.')) {
            const extMatch = resolvePath('', args.path, virtualFS);
            if (extMatch && virtualFS.has(extMatch)) {
              return { path: extMatch, namespace: 'virtual' };
            }
          }

          if (!args.path.startsWith('.')) {
            return { path: args.path, namespace: 'cdn' };
          }

          return { path: args.path, namespace: 'virtual' };
        });

        build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
          const content = virtualFS.get(args.path);
          if (!content) return { contents: '', loader: 'js' };
          return { contents: content, loader: getLoader(args.path) };
        });

        build.onLoad({ filter: /.*/, namespace: 'cdn' }, async (args) => {
          const pkgName = args.path;
          if (resolvedPackages.has(pkgName)) {
            const cached = resolvedPackages.get(pkgName)!;
            if (cached !== '__FAILED__') {
              return { contents: cached, loader: 'js', resolveDir: '/' };
            }
            return { contents: 'export default {};', loader: 'js', resolveDir: '/' };
          }
          try {
            const url = pkgName.startsWith('http://') || pkgName.startsWith('https://')
              ? pkgName
              : pkgName.startsWith('/')
                ? `https://esm.sh${pkgName}`
                : `${ESM_SH_URL}${pkgName}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const code = await res.text();
            resolvedPackages.set(pkgName, code);
            return { contents: code, loader: 'js', resolveDir: '/' };
          } catch {
            resolvedPackages.set(pkgName, '__FAILED__');
            return { contents: 'export default {};', loader: 'js', resolveDir: '/' };
          }
        });
      },
    }],
  });

  // Extract JS output and CSS separately
  const jsOutput = result.outputFiles?.find((f) => f.path.endsWith('.js') || f.path.endsWith('.mjs') || f.path === '<stdout>');
  const cssOutput = result.outputFiles?.find((f) => f.path.endsWith('.css'));

  if (!jsOutput) throw new Error('No JS output from esbuild');

  const outputCode = jsOutput.text;
  const injectedCSS = cssOutput ? `<style>${cssOutput.text}</style>` : '';

  const blob = new Blob(
    [
      `<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'none'; form-action 'none'">
${RUNTIME_ERROR_SCRIPT}
${injectedCSS}</head><body><div id="root"></div><script type="module">${outputCode}</script></body></html>`,
    ],
    { type: 'text/html' }
  );

  const url = URL.createObjectURL(blob);
  createdBlobUrls.push(url);
  return url;
}

function getLoader(path: string): 'tsx' | 'ts' | 'jsx' | 'js' | 'css' | 'json' {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx': return 'tsx';
    case 'ts': return 'ts';
    case 'jsx': return 'jsx';
    case 'js': return 'js';
    case 'css': return 'css';
    case 'json': return 'json';
    default: return 'js';
  }
}

function resolvePath(importer: string, relative: string, fs: Map<string, string>): string | null {
  const importerDir = importer.includes('/') ? importer.substring(0, importer.lastIndexOf('/')) : '';
  const cleanRelative = relative.replace(/^\.\//, '');
  const candidates = [
    relative,
    cleanRelative,
    `${relative}.tsx`,
    `${cleanRelative}.tsx`,
    `${relative}.ts`,
    `${cleanRelative}.ts`,
    `${relative}.jsx`,
    `${cleanRelative}.jsx`,
    `${relative}.js`,
    `${cleanRelative}.js`,
    `${relative}/index.tsx`,
    `${cleanRelative}/index.tsx`,
    `${relative}/index.ts`,
    `${cleanRelative}/index.ts`,
    `${relative}/index.jsx`,
    `${cleanRelative}/index.jsx`,
    `${relative}/index.js`,
    `${cleanRelative}/index.js`,
  ];

  if (importerDir) {
    for (const candidate of candidates) {
      const fullPath = `${importerDir}/${candidate}`;
      if (fs.has(fullPath)) return fullPath;
    }
  }

  for (const candidate of candidates) {
    if (fs.has(candidate)) return candidate;
  }

  return null;
}
