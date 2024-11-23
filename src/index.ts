import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import { config } from './config';
import fileRoutes from './routes/file.routes';
import { FileController } from './controllers/FileController';
import { StorageService } from './services/storage/StorageService';
import { FileService } from './services/file/FileService';
import { Logger } from './services/logger/Logger';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import Bull, { Job } from 'bull';
import { DWGConverter } from './services/converter/DWGConverter';
import { ConversionService } from './services/converter/ConversionService';
import { ConversionController } from './controllers/ConversionController';
import conversionRoutes from './routes/conversion.routes';
import Redis from 'ioredis';
import folderRoutes from './routes/folder.routes';
import { FolderController } from './controllers/FolderController';
import { FolderService } from './services/folder/FolderService';

const logger = new Logger('App');

// 创建Express应用
const app = express();

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN
}));
app.use(helmet());
app.use(compression());
app.use(express.json());

// 初始化服务
const storageService = new StorageService();
const fileService = new FileService();
const folderService = new FolderService();

// 初始化控制器
const fileController = new FileController(
  storageService,
  fileService
);
const folderController = new FolderController(folderService);

// 创建 Redis 客户端
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: 3,
  enableReadyCheck: false
});

// 初始化转换服务
const conversionQueue = new Bull('conversion', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    maxRetriesPerRequest: 3
  },
  defaultJobOptions: {
    attempts: 3,
    timeout: 300000  // 5分钟超时
  }
});

// 错误处理
conversionQueue.on('error', (error: Error) => {
  logger.error('Conversion queue error:', error);
});

conversionQueue.on('failed', (job: Job, error: Error) => {
  logger.error(`Job ${job.id} failed:`, error);
});

// 初始化转换器和服务
const converter = new DWGConverter();
const conversionService = new ConversionService(
  converter,
  conversionQueue,
  fileService,
  storageService
);

// 初始化转换控制器
const conversionController = new ConversionController(conversionService);

// 路由
app.use('/api', fileRoutes(fileController));
app.use('/api', conversionRoutes(conversionController));
app.use('/api', folderRoutes(folderController));

// Swagger 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 错误处理中间件必须在所有路由之后
app.use(errorHandler);

// 添加健康检查路由
app.get('/health', async (req, res) => {
  const redisStatus = await new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), 1000);
    redisClient.ping()
      .then(() => {
        clearTimeout(timeout);
        resolve(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        resolve(false);
      });
  });

  res.json({
    status: 'ok',
    services: {
      redis: redisStatus,
      minio: true,
      mongodb: mongoose.connection.readyState === 1
    }
  });
});

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function startServer() {
  // 确保数据库连接成功
  await connectDB();

  // 启动服务器
  const port = config.port;
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
}); 