import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { enquiryRoutes } from './routes/enquiries.js';

// The built website (frontend/dist). When it exists, this server also serves the site,
// so the whole project runs as ONE web service (same address for pages and /api).
const DEFAULT_SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');

export function createApp({ store, crm = null, mail = null, corsOrigins = [], isProd = false, forward, notify, siteDir = DEFAULT_SITE_DIR }) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
        'img-src': ["'self'", 'data:'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
        'base-uri': ["'self'"],
        'object-src': ["'none'"],
      },
    },
  }));
  app.use(cors({ origin: corsOrigins.length ? corsOrigins : false, methods: ['POST'], allowedHeaders: ['Content-Type'], maxAge: 600 }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/enquiries', enquiryRoutes({ store, crm, mail, forward, notify }));

  app.use('/api', (req, res) => res.status(404).json({ message: 'Not found.' }));

  const index = path.join(siteDir, 'index.html');
  if (fs.existsSync(index)) {
    // Hashed files in /assets never change, so browsers may cache them for a year.
    app.use('/assets', express.static(path.join(siteDir, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(siteDir, { index: false, maxAge: '1h' }));
    // Any other page path → the React app (it shows its own 404 page for unknown paths).
    app.use((req, res, next) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      res.set('Cache-Control', 'no-cache');
      res.sendFile(index);
    });
  }

  app.use((req, res) => res.status(404).json({ message: 'Not found.' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large.' });
    if (!isProd) console.error(err);
    if (!res.headersSent) res.status(500).json({ message: 'Something went wrong on our side.' });
  });
  return app;
}
