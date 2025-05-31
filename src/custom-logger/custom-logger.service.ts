import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLoggerService extends ConsoleLogger {
  async logToFile(entry, exception?: any) {
    const formattedEntry = `${Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date())}\t${entry}\n${exception}\n\n\n\n`;

    try {
      if (!fs.existsSync(path.join(__dirname, '..', '..', 'logs'))) {
        await fsPromises.mkdir(path.join(__dirname, '..', '..', 'logs'));
      }
      await fsPromises.appendFile(
        path.join(__dirname, '..', '..', 'logs', 'logs.log'),
        formattedEntry,
      );
    } catch (e) {
      if (e instanceof Error) console.error(e.message);
    }
  }

  /**
   * Logs a message with an optional context.
   * The log entry is written to a file and then passed to the base logger.
   *
   * @param message - The message or object to log.
   * @param context - Optional context string to associate with the log entry.
   */
  log(message: any, context?: string) {
    const entry = `${context}\t${message}`;
    this.logToFile(entry);
    super.log(message, context);
  }

  /**
   * Logs an error message with optional stack/context and exception details.
   *
   * @param message - The error message or object to log.
   * @param stackOrContext - Optional stack trace or context string to provide additional information.
   * @param exception - Optional exception object containing error details.
   *
   * @remarks
   * This method logs the error entry to a file and then delegates to the base logger's error method.
   */
  error(message: any, stackOrContext?: string, exception?: any) {
    const entry = `${stackOrContext}\t${message}`;
    this.logToFile(entry, exception);
    super.error(message, stackOrContext);
  }
}
