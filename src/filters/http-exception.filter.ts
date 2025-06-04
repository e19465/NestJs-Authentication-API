import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLoggerService } from 'src/custom-logger/custom-logger.service';
import { ApiResponse } from 'src/helpers/api-response.helper';

/**
 * Global exception filter to handle all unhandled exceptions in the application.
 *
 * This filter:
 * - Catches both built-in and custom exceptions.
 * - Standardizes the error response structure using the `ApiResponse.error()` helper.
 * - Extracts meaningful messages from NestJS `HttpException` or falls back to generic messages.
 * - Appends additional metadata like path, method, and timestamp for better debugging.
 *
 * Usage:
 * Register globally in `main.ts`:
 * ```ts
 * app.useGlobalFilters(new GlobalExceptionsFilter());
 * ```
 */
@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new CustomLoggerService(
    GlobalExceptionsFilter.name,
  );

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    console.log('Exception: ', exception);

    const isHttpException = (ex: unknown): ex is HttpException =>
      ex instanceof HttpException;

    const status = isHttpException(exception)
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const resBody = isHttpException(exception) ? exception.getResponse() : null;

    let message: string | string[] = 'Internal server error';

    function hasMessageProperty(obj: unknown): obj is { message: unknown } {
      return typeof obj === 'object' && obj !== null && 'message' in obj;
    }

    function isMessageStringOrArray(
      message: unknown,
    ): message is string | string[] {
      return typeof message === 'string' || Array.isArray(message);
    }

    if (typeof resBody === 'string') {
      message = resBody;
    } else if (
      hasMessageProperty(resBody) &&
      isMessageStringOrArray(resBody.message)
    ) {
      message = resBody.message;
    } else if (
      hasMessageProperty(exception) &&
      isMessageStringOrArray(exception.message)
    ) {
      message = exception.message;
    }

    // Log the error using the custom logger
    this.logger.error(
      `Exception caught: ${Array.isArray(message) ? message.join(', ') : message}`,
      GlobalExceptionsFilter.name,
      exception instanceof Error ? exception.stack : undefined,
    );

    return ApiResponse.error(res, message, status, {
      path: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }
}
