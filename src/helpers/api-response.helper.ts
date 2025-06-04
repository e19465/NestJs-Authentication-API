import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * Utility class to standardize API response formatting.
 * Provides methods to generate consistent `success` and `error` responses.
 */
export class ApiResponse {
  /**
   * Sends or returns a standardized success response.
   *
   * @param response - (Optional) Express `Response` object. If provided, the response will be sent immediately.
   * @param message - (Optional) A message describing the result or operation.
   * @param data - (Optional) The payload/data to return in the response.
   * @param statusCode - (Optional) HTTP status code for the response. Defaults to `HttpStatus.OK` (200).
   *
   * @returns If `response` is provided, it sends the response and returns `void`.
   *          Otherwise, returns the success payload as a plain object.
   *
   * @example
   * ------- Sends response directly
   * return ApiResponse.success(res, 'Data fetched', { id: 1 });
   *
   * @example
   * ------- Returns payload only (useful for responses with cookies set or other side effects)
   * return ApiResponse.success(null, 'Created', newItem, HttpStatus.CREATED);
   */
  static success(
    response: Response | null,
    message: string | null = null,
    data: any = null,
    statusCode: HttpStatus = HttpStatus.OK,
  ): void | {
    statusCode: number;
    success: boolean;
    message: string | null;
    data: any;
  } {
    const payload = {
      statusCode,
      success: true,
      message: message || null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: data,
    };

    if (response) {
      response.status(statusCode);
      response.setHeader('Content-Type', 'application/json');
      response.send(JSON.stringify(payload));
      return;
    }

    return payload;
  }

  /**
   * Sends a standardized error response.
   *
   * @param response - Express `Response` object used to send the HTTP response.
   * @param message - A message describing the error.
   * @param statusCode - (Optional) HTTP status code for the error. Defaults to `HttpStatus.INTERNAL_SERVER_ERROR` (500).
   * @param data - (Optional) Additional error context or metadata.
   *
   * @returns Sends the error response using `res.status(...).json(...)`.
   *
   * @example
   * return ApiResponse.error(res, 'User not found', HttpStatus.NOT_FOUND);
   */
  static error(
    response: Response,
    message: string | object,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    data: any = null,
  ) {
    return response.status(statusCode).json({
      statusCode,
      success: false,
      message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: data || null,
    });
  }
}
