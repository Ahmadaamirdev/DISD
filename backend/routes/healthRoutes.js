import express from 'express';
import { isConnected } from '../config/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'Dragon International Services and Development LLC - Heavy Machinery API',
    version: '1.0.0',
    storage: isConnected ? 'MongoDB Atlas' : 'JSON File Storage (Local MongoDB Disconnected)',
    database: isConnected ? 'Connected (MongoDB Atlas)' : 'JSON File Store (Ready for Atlas)',
    timestamp: new Date().toISOString()
  });
});

export default router;
