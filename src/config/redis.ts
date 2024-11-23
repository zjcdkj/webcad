import Queue from 'bull';
import { config } from './index';

export function createQueue(name: string) {
  return new Queue(name, {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password
    }
  });
} 