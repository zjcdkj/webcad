declare module 'bull' {
  import { RedisConfig } from './config';

  interface QueueOptions {
    redis?: RedisConfig;
    prefix?: string;
    defaultJobOptions?: JobOptions;
  }

  interface JobOptions {
    priority?: number;
    attempts?: number;
    delay?: number;
    timeout?: number;
    removeOnComplete?: boolean;
    removeOnFail?: boolean;
  }

  interface JobProgress {
    progress: number;
  }

  export interface Job<T = any> {
    id: string;
    data: T;
    progress(value: number): Promise<void>;
    getProgress(): Promise<number>;
    update(data: T): Promise<void>;
    getState(): Promise<string>;
    finished(): Promise<any>;
    retry(): Promise<void>;
    remove(): Promise<void>;
  }

  export default class Queue<T = any> {
    constructor(name: string, options?: QueueOptions);
    process(handler: (job: Job<T>) => Promise<any>): void;
    add(data: T, options?: JobOptions): Promise<Job<T>>;
    getJob(jobId: string): Promise<Job<T> | null>;
    getJobs(types: string[]): Promise<Job<T>[]>;
    on(event: string, callback: Function): void;
    client: any;
  }
} 