import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Main health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sustainable E-Commerce + Circular Economy API is running', timestamp: new Date() });
});

import userRoutes from './routes/users';
import listingsRoutes from './routes/listings';
import requestsRoutes from './routes/requests';
import cartRoutes from './routes/cart';
import foodRescueRoutes from './routes/food-rescue';
import upcycleRoutes from './routes/upcycle';
import impactRoutes from './routes/impact';
import adminRoutes from './routes/admin';
import meRoutes from './routes/me'; // Protected dummy route
import membershipRoutes from './routes/membership';
import checkoutRoutes from './routes/checkout';
import uploadRoutes from './routes/upload';
import chatRoutes from './routes/chat';
import notificationRoutes from './routes/notifications';
import path from 'path';

// Serve uploaded images statically
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/users', userRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/food-rescue', foodRescueRoutes);
app.use('/api/upcycle', upcycleRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', meRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
