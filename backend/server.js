
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import productRouter from './routes/productRoutes.js';
import supplierRouter from './routes/supplierRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import stockRouter from './routes/stockRoutes.js';
import alertRouter from './routes/alertRoutes.js';
import forecastRouter from './routes/forecastRoutes.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
const app = express();

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET is not defined. Set it in backend/.env");
    process.exit(1);
}
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser())
const allowedOrigins = FRONTEND_URL.split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
    origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS blocked'));
    },
    credentials: true
}));

// Basic abuse protection (auth endpoints get stricter limits below)
app.use(mongoSanitize());
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter);

import { connectDB } from './config/db.js';
await connectDB();

//api endpoints
// routes

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/orders', orderRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/stock', stockRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/forecast', forecastRouter);



// 404 for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Central error handler — never leak stack/Mongo internals
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err?.message === 'CORS blocked') return res.status(403).json({ success: false, message: 'Forbidden origin' });
    console.error('Unhandled error:', err?.message || err);
    res.status(err?.status || 500).json({ success: false, message: 'Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});