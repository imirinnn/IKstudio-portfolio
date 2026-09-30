import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { enquiryRoutes } from './routes/enquiries.js';

export function createApp({ store, crm = null, mail = null, corsOrigins = [], isProd = false, forward, notify }) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: corsOrigins.length ? corsOrigins : false, methods: ['POST'], allowedHeaders: ['Content-Type'], maxAge: 600 }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/enquiries', enquiryRoutes({ store, crm, mail, forward, notify }));

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
