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
