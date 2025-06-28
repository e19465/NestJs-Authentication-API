import { Role } from '@prisma/client';

/**
 * Converts a comma-separated string, an array of strings, or null into an array of non-empty, trimmed strings.
 *
 * @param value - The input value which can be a comma-separated string, an array of strings, or null.
 * @returns An array of trimmed, non-empty strings. Returns an empty array if the input is null or an empty string.
 *
 * @example
 * getArrayFromCommaSeparatedString('a, b, c') // returns ['a', 'b', 'c']
 * getArrayFromCommaSeparatedString(['a', 'b']) // returns ['a', 'b']
 * getArrayFromCommaSeparatedString(null) // returns []
 */
export const getArrayFromCommaSeparatedString = (
  value: string | string[] | null | undefined,
): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  // Split the string by commas and trim whitespace from each item
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

/**
 * Compares two strings for equality, allowing for undefined or null values.
 *
 * @param str1 - The first string to compare.
 * @param str2 - The second string to compare.
 * @returns {boolean} - Returns true if both strings are equal (after trimming), or both are undefined/null; otherwise, returns false.
 */
export const isStringsEqual = (
  str1: string | undefined | null,
  str2: string | undefined | null,
): boolean => {
  if (str1 === undefined || str1 === null) {
    return str2 === undefined || str2 === null;
  }
  if (str2 === undefined || str2 === null) {
    return false;
  }
  return str1.trim() === str2.trim();
};

/**
 * Normalizes an email address by applying provider-specific rules.
 *
 * - For Gmail and Googlemail addresses, removes dots and any substring after a plus sign in the username.
 * - For Hotmail and Outlook addresses, removes any substring after a plus sign in the username.
 * - For Live addresses, removes dots and any substring after a plus sign in the username.
 * - Converts the email address to lowercase.
 * - Maps 'googlemail.com' to 'gmail.com'.
 *
 * @param eMail - The email address to normalize.
 * @returns The normalized email address. If the input is not a valid email string, returns the original input.
 * @throws {TypeError} If the input is not a string.
 */
export const normalizeEmail = (eMail: string): string => {
  const PLUS_ONLY = /\+.*$/;
  const PLUS_AND_DOT = /\.|\+.*$/g;

  const normalizeableProviders: {
    [key: string]: { cut: RegExp; aliasOf?: string };
  } = {
    'gmail.com': { cut: PLUS_AND_DOT },
    'googlemail.com': { cut: PLUS_AND_DOT, aliasOf: 'gmail.com' },
    'hotmail.com': { cut: PLUS_ONLY },
    'live.com': { cut: PLUS_AND_DOT },
    'outlook.com': { cut: PLUS_ONLY },
  };

  if (typeof eMail !== 'string') {
    throw new TypeError('normalize-email expects a string');
  }

  const email = eMail.toLowerCase();
  const emailParts = email.split('@');

  if (emailParts.length !== 2) {
    return eMail;
  }

  let [username, domain] = emailParts;

  if (Object.prototype.hasOwnProperty.call(normalizeableProviders, domain)) {
    const provider = normalizeableProviders[domain];

    if (Object.prototype.hasOwnProperty.call(provider, 'cut')) {
      username = username.replace(provider.cut, '');
    }

    if (Object.prototype.hasOwnProperty.call(provider, 'aliasOf')) {
      domain = provider.aliasOf!;
    }
  }

  return `${username}@${domain}`;
};

/**
 * Normalizes a role string to a Role enum value.
 *
 * @param role - The role string to normalize.
 * @returns The normalized Role enum value or null if the role is not valid.
 *
 * @example
 * normalizeRole('admin') // returns Role.ADMIN
 * normalizeRole('user') // returns Role.USER
 * normalizeRole('invalid') // returns null
 */
export const normalizeRole = (role: string): Role | null => {
  return role
    ? Object.values(Role).find((r) => r.toLowerCase() === role.toLowerCase()) ||
        null
    : null;
};

/**
 * Normalizes a given Date object into a formatted string.
 *
 * The returned string is in the format: `YYYY-MM-DD at HH.MM AM/PM`.
 * - `YYYY` is the 4-digit year.
 * - `MM` is the 2-digit month.
 * - `DD` is the 2-digit day.
 * - `HH` is the 2-digit hour in 12-hour format.
 * - `MM` is the 2-digit minute.
 * - `AM/PM` denotes the period of the day.
 *
 * @param date - The Date object to normalize.
 * @returns The formatted date string.
 *
 * @example
 * normalizeDate(new Date('2023-10-01T14:30:00Z')) // returns '2023-10-01 : 02.30 PM'
 */
export const normalizeDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const paddedHours = hours.toString().padStart(2, '0');
  const paddedMinutes = minutes.toString().padStart(2, '0');

  return `${year}-${month}-${day} : ${paddedHours}.${paddedMinutes} ${ampm}`;
};
