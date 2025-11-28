export const cx = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

export const random = (min: number, max: number) => (
  Math.floor(Math.random() * (max - min)) + min
);

export const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a unique ID using crypto.randomUUID with optional shortening
 * @param {Object} options Configuration options
 * @param {string} options.prefix Optional prefix for the ID
 * @param {number} options.length Length of random portion (null for full UUID)
 * @param {boolean} options.noHyphens Remove hyphens from UUID
 * @returns {string} A unique identifier
 */
export function generateId({ prefix = '', length = 8, noHyphens = true } = {}) {
  // Use crypto for strong randomness
  let id = crypto.randomUUID();

  // Process the UUID based on options
  if (noHyphens) {
    id = id.replace(/-/g, '');
  }

  // Truncate if specified
  if (length && length < id.length) {
    id = id.substring(0, length);
  }

  // Add prefix if provided
  return prefix ? `${prefix}-${id}` : id;
}
