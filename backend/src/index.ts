import dns from 'dns';
// Override system DNS with Google's public DNS before any network calls
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import claimsRouter from './routes/claims.js';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api', claimsRouter);
app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Connect MongoDB then start server
mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, family: 4 })
  .then(() => {
    console.log('[MongoDB] Connected to cluster0');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[MongoDB] Connection failed:', err.message);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} (DB offline)`);
    });
  });
