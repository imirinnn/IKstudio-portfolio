import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { authRoutes } from './routes/auth.js';
import { crmRoutes, convertRoute } from './routes/crm.js';
import { intakeRoutes } from './routes/intake.js';
import { requireAdmin } from './middleware/requireAdmin.js';

export function createApp({ store, jwtSecret, jwtExpiresIn = '8h', adminEmails = [], intakeKey = '', corsOrigins = [], isProd = false }) {
  const app = express();
  app.set('trust proxy', 1); // real client IPs behind Render / Railway proxies (rate limiting)
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin: corsOrigins.length ? corsOrigins : false,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }));
  app.use(express.json({ limit: '50kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Server-to-server: the studio website's backend forwards contact-form enquiries here.
  app.use('/api/intake', intakeRoutes({ store, intakeKey }));

  // Private — everything below requires a valid admin token.
  app.use('/api/admin/auth', authRoutes({ store, jwtSecret, jwtExpiresIn, adminEmails }));
  const auth = requireAdmin({ store, jwtSecret, adminEmails });
  app.use('/api/admin/convert', auth, convertRoute({ store }));
  app.use('/api/admin/crm', auth, crmRoutes({ store }));

  app.use((req, res) => res.status(404).json({ message: 'Not found.' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request is too large.' });
    if (!isProd) console.error(err);
    res.status(500).json({ message: isProd ? 'Something went wrong on our side.' : err.message });
  });
  return app;
}
