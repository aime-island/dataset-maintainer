"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get elapsed seconds from timestamp.
 */
function getElapsedSeconds(timestamp) {
    return Math.round((Date.now() - timestamp) / 1000);
}
exports.getElapsedSeconds = getElapsedSeconds;
/**
 * Returns the first defined argument. Returns null if there are no defined
 * arguments.
 */
function getFirstDefined(...options) {
    for (let i = 0; i < options.length; i++) {
        if (options[i] !== undefined) {
            return options[i];
        }
    }
    return null;
}
exports.getFirstDefined = getFirstDefined;
/**
 * Hash the string.
 */
const md5 = require('js-md5');
const DEFAULT_SALT = '8shd9fg3oi0fj';
function hash(str, salt) {
    return md5(str + (salt || DEFAULT_SALT));
}
exports.hash = hash;
