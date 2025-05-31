import * as bcrypt from 'bcrypt';

/**
 * Checks if a given password meets the specified strength criteria.
 *
 * At least 8 characters long
 * At least one uppercase letter
 * At least one lowercase letter
 * At least one number
 * At least one special character
 * @returns {boolean} - Returns true if the password meets the criteria, otherwise false.
 * @example
 * passwordStrengthChecker('Password123!') // returns true
 * passwordStrengthChecker('password') // returns false
 */
export const passwordStrengthChecker = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Hashes a password using bcrypt with a salt rounds of 10.
 * @param {string} password - The password to hash.
 * @return {Promise<string>} - A promise that resolves to the hashed password.
 * @example
 * hashPassword('mySecurePassword123!') // returns a hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password to compare.
 * @param {string} hashed - The hashed password to compare against.
 * @return {Promise<boolean>} - A promise that resolves to true if the passwords match, otherwise false.
 * @example
 * comparePassword('mySecurePassword123!', '$2b$10$...') // returns true or false
 */
export const comparePassword = async (
  password: string,
  hashed: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashed);
};

/**
 * Sets a cookie on the HTTP response with the specified name, value, and expiration.
 *
 * @param name - The name of the cookie to set ('access' or 'refresh').
 * @param response - The HTTP response object to which the cookie will be attached.
 * @param value - The value to assign to the cookie.
 * @param expires - The duration in milliseconds after which the cookie will expire.
 *
 * @remarks
 * The cookie is set with the following options:
 * - `httpOnly`: true (prevents client-side JavaScript from accessing the cookie)
 * - `secure`: true (ensures the cookie is sent only over HTTPS)
 * - `sameSite`: 'none' (allows cross-site cookie usage)
 * - `expires`: Calculated based on the current time plus the provided expiration duration
 */
export const setCookieToResponse = (
  name: 'access' | 'refresh',
  response: any,
  value: string,
  expires: number,
) => {
  response.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + expires),
  });
};
