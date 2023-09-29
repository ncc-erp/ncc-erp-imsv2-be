import winston, { format, transports } from 'winston';

const formatLogger = format.printf((msg) => {
  const message = msg.metadata?.error?.stack ?? msg.message;
  return `${msg.metadata.timestamp} - ${msg.metadata.context}[${msg.level}] ${
    msg.metadata.requestId ? '- [' + msg.metadata.requestId + ']' : ''
  }: ${message}`;
});

export class LoggerConfig {
  private readonly options: winston.LoggerOptions;

  constructor() {
    this.options = {
      exitOnError: false,
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.metadata({ fillExcept: ['message', 'level'] }),
        format.colorize({ all: true }),
        formatLogger,
      ),
      transports: [
        new transports.Console({
          level: process.env.LOG_LEVEL,
          format: format.combine(format.splat()),
        }),
      ], // alert > error > warning > notice > info > debug
    };
  }

  public console(): object {
    return this.options;
  }
}
