export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

export interface MinioConfig {
  url: string;
  port: number;
  secure: boolean;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

export interface Config {
  redis: RedisConfig;
  minio: MinioConfig;
  port: number;
  env: string;
  mongoUri: string;
} 