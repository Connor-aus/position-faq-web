/**
 * Simple logger utility for consistent logging throughout the application
 */

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Current log level - can be configured from environment
const currentLogLevel = process.env.REACT_APP_LOG_LEVEL || LogLevel.INFO;

// Check if the provided level should be logged based on the current log level
const shouldLog = (level: LogLevel): boolean => {
  const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
  const currentIndex = levels.indexOf(currentLogLevel as LogLevel);
  const levelIndex = levels.indexOf(level);
  
  return levelIndex >= currentIndex;
};

// Format the log message with timestamp and level
const formatMessage = (level: LogLevel, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
};

// Logger methods
export const logger = {
  debug: (message: string, ...args: any[]): void => {
    if (shouldLog(LogLevel.DEBUG)) {
      // eslint-disable-next-line no-console
      console.debug(formatMessage(LogLevel.DEBUG, message), ...args);
    }
  },
  
  info: (message: string, ...args: any[]): void => {
    if (shouldLog(LogLevel.INFO)) {
      // eslint-disable-next-line no-console
      console.info(formatMessage(LogLevel.INFO, message), ...args);
    }
  },
  
  warn: (message: string, ...args: any[]): void => {
    if (shouldLog(LogLevel.WARN)) {
      // eslint-disable-next-line no-console
      console.warn(formatMessage(LogLevel.WARN, message), ...args);
    }
  },
  
  error: (message: string, ...args: any[]): void => {
    if (shouldLog(LogLevel.ERROR)) {
      // eslint-disable-next-line no-console
      console.error(formatMessage(LogLevel.ERROR, message), ...args);
    }
  },
};

export default logger;
