/**
 * Contains common Prisma client error codes used throughout the application.
 *
 * @property PRISMA_CONFLICT - Error code indicating a unique constraint violation (P2002).
 * @property PRISMA_NOT_FOUND - Error code indicating a record was not found (P2025).
 */
export const PRISMA_CLIENT_ERROR_CODES = {
  PRISMA_CONFLICT: 'P2002',
  PRISMA_NOT_FOUND: 'P2025',
};
