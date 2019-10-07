/**
 * Get elapsed seconds from timestamp.
 */
export function getElapsedSeconds(timestamp: number): number {
    return Math.round((Date.now() - timestamp) / 1000);
}

/**
 * Returns the first defined argument. Returns null if there are no defined
 * arguments.
 */
export function getFirstDefined(...options: any[]) {
    for (let i = 0; i < options.length; i++) {
        if (options[i] !== undefined) {
            return options[i];
        }
    }
    return null;
}

/**
 * Hash the string.
 */
const md5 = require('js-md5');
const DEFAULT_SALT = '8shd9fg3oi0fj';
export function hash(str: string, salt?: string): string {
    return md5(str + (salt || DEFAULT_SALT));
  }