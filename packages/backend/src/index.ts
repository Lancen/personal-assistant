import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import adminUserRoutes from './routes/adminUsers';
import emotionRoutes from './routes/emotion';
import emotionCheckRoutes from './routes/emotionCheck';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Personal Assistant API is running' });
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminUserRoutes);
app.use('/api/emotion', emotionRoutes);
app.use('/api/emotion-check', emotionCheckRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
});
