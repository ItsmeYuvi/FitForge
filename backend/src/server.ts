import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import blueprintRoutes from './routes/blueprint';
import onboardingRoutes from './routes/onboarding';
import workoutRoutes from './routes/workout';
import nutritionRoutes from './routes/nutrition';
import progressRoutes from './routes/progress';
import coachRoutes from './routes/coach';
import exportRoutes from './routes/export';

dotenv.config();

// Enforce Google & Cloudflare DNS for robust SRV resolutions
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('⚠️ [FitForge Core] Failed to set custom DNS servers, using system default:', dnsErr);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For development, allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/blueprint', blueprintRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/export', exportRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'FitForge Core OS',
    timestamp: new Date()
  });
});

// Database connection
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('⚡ [FitForge Core] Connected to MongoDB Atlas Database.');
    })
    .catch((err) => {
      console.error('❌ [FitForge Core] Database connection failure:', err);
    });
} else {
  console.warn('⚠️ [FitForge Core] MONGODB_URI missing from environment. Operating in memory-only mode.');
}

// Start Server
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 [FitForge Core] Running on port ${PORT}`);
});
