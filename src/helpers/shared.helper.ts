import { Role } from 'generated/prisma';

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
export const normalizeEmail = (eMail) => {
  var PLUS_ONLY = /\+.*$/;
  var PLUS_AND_DOT = /\.|\+.*$/g;
  var normalizeableProviders = {
    'gmail.com': {
      cut: PLUS_AND_DOT,
    },
    'googlemail.com': {
      cut: PLUS_AND_DOT,
      aliasOf: 'gmail.com',
    },
    'hotmail.com': {
      cut: PLUS_ONLY,
    },
    'live.com': {
      cut: PLUS_AND_DOT,
    },
    'outlook.com': {
      cut: PLUS_ONLY,
    },
  };

  if (typeof eMail != 'string') {
    throw new TypeError('normalize-email expects a string');
  }

  var email = eMail.toLowerCase();
  var emailParts = email.split(/@/);

  if (emailParts.length !== 2) {
    return eMail;
  }

  var username = emailParts[0];
  var domain = emailParts[1];

  if (normalizeableProviders.hasOwnProperty(domain)) {
    if (normalizeableProviders[domain].hasOwnProperty('cut')) {
      username = username.replace(normalizeableProviders[domain].cut, '');
    }
    if (normalizeableProviders[domain].hasOwnProperty('aliasOf')) {
      domain = normalizeableProviders[domain].aliasOf;
    }
  }

  return username + '@' + domain;
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
