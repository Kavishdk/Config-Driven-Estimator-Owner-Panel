import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';

import path from 'path';

const app = express();
const PORT = process.env.NODE_ENV === 'production' ? (Number(process.env.PORT) || 3000) : 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

import fs from 'fs';

const clientDistPath = path.join(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      message: 'Northline Roofing Estimator API is running.',
      endpoints: {
        health: '/api/health',
        config: '/api/config',
        estimate: '/api/estimate',
        admin: '/api/admin/*'
      }
    });
  });
}

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
