import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import blueprintRoutes from './routes/blueprint';

dotenv.config();

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
app.listen(PORT, () => {
  console.log(`🚀 [FitForge Core] Running on port ${PORT}`);
});
