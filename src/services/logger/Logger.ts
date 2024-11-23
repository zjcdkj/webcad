import winston from 'winston';

export class Logger {
  private logger: winston.Logger;

  constructor(private context: string) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
          const formattedMessage = typeof message === 'string' 
            ? message 
            : JSON.stringify(message);
          const formattedMeta = Object.keys(meta).length 
            ? JSON.stringify(meta) 
            : '';
          return `${timestamp} [${service}] ${level}: ${formattedMessage} ${formattedMeta}`;
        })
      ),
      defaultMeta: { service: context },
      transports: [
        new winston.transports.File({ 
          filename: 'logs/error.log', 
          level: 'error'
        }),
        new winston.transports.File({ 
          filename: 'logs/combined.log'
        })
      ]
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
          winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
            const formattedMessage = typeof message === 'string' 
              ? message 
              : JSON.stringify(message);
            const formattedMeta = Object.keys(meta).length 
              ? JSON.stringify(meta) 
              : '';
            return `${timestamp} [${service}] ${level}: ${formattedMessage} ${formattedMeta}`;
          })
        )
      }));
    }
  }

  private formatMessage(message: string | object): string {
    if (typeof message === 'string') {
      return message;
    }
    try {
      return JSON.stringify(message, (key, value) => {
        if (typeof value === 'string') {
          return value.normalize('NFC');
        }
        return value;
      }, 2);
    } catch {
      return String(message);
    }
  }

  info(message: string | object, ...args: any[]) {
    this.logger.info(this.formatMessage(message), ...args);
  }

  error(message: string | object, error?: any) {
    this.logger.error(this.formatMessage(message), error);
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn(message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug(message, ...args);
  }
} 