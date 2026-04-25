// BlackRoad OS — Preview Server
// Minimal local preview server for checking generated output

import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve, extname } from 'path';
import { renderFullPage } from '../ui/SiteShell.js';
import { PRODUCTS } from '../products.js';
import { SITES } from '../sites.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../../..');
const PORT = process.env.PORT || 4173;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.md': 'text/markdown', '.txt': 'text/plain',
  '.xml': 'application/xml'
};

function serveFile(res, filePath) {
  if (!existsSync(filePath)) { res.writeHead(404); res.end('Not found'); return; }
  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
  res.end(readFileSync(filePath));
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  // Homepage
  if (path === '/') {
    const html = renderFullPage({
      domain: 'blackroad.io',
      path: '/',
      pageType: 'root',
      site: { title: 'BlackRoad', purpose: 'The portable browser computer ecosystem.' }
    });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Product pages
  const product = PRODUCTS.find(p => path === `/${p.id}` || path === `/${p.id}/`);
  if (product) {
    const html = renderFullPage({
      domain: product.domain,
      path: '/',
      pageType: 'product',
      site: { title: product.name, purpose: product.longDescription }
    });
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Generated files
  if (path.startsWith('/generated/')) {
    serveFile(res, resolve(ROOT, 'src/blackroad', path.slice(1)));
    return;
  }

  // Docs
  if (path.startsWith('/docs/')) {
    serveFile(res, resolve(ROOT, path.slice(1)));
    return;
  }

  // Styles
  if (path.startsWith('/styles/')) {
    serveFile(res, resolve(ROOT, 'src/blackroad', path.slice(1)));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`BlackRoad preview: http://localhost:${PORT}`);
  console.log(`Products: ${PRODUCTS.map(p => `/${p.id}`).join(', ')}`);
  console.log('Remember the Road. Pave Tomorrow!');
});
