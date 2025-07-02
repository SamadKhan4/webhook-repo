import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import billRoutes from './routes/billRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js'; // ✅ Added
import returnExchangeRoutes from './routes/returnExchange.js'; // added here

// Import Utility
import createAdminIfNotExists from './config/createAdmin.js';

// Config
dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/bills', billRoutes);
app.use('/customers', customerRoutes);
app.use('/items', itemRoutes);
app.use('/vendors', vendorRoutes);
app.use('/agents', agentRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/employees', employeeRoutes); // ✅ Registered here
app.use('/api/items', itemRoutes);
app.use('/api/return-exchange', returnExchangeRoutes); // new here
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected');
  await createAdminIfNotExists(); // Ensure admin is created
  app.listen(5000, () =>
    console.log('🚀 Server running on http://localhost:5000')
  );
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});
