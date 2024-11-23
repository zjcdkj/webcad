import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

interface MinioConfig {
  url: string;
  port: number;
  secure: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

interface RedisConfig {
  host: string;
  port: number;
  password: string | undefined;
}

interface AppConfig {
  minio: MinioConfig;
  redis: RedisConfig;
  port: number;
  env: string;
  mongoUri: string;
}

export const config: AppConfig = {
  minio: {
    url: process.env.MINIO_URL || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    secure: process.env.MINIO_SECURE === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
    bucket: process.env.MINIO_BUCKET || 'nodejs'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  port: parseInt(process.env.PORT || '3000'),
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cad-web'
}; 