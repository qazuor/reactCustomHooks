import { useEffect } from 'react';

/**
 * useLogger
 *
 * @description Logs a message to the console whenever the provided `value` changes.
 * This can be useful for debugging or tracking state changes.
 *
 * @param {string} label - A string label to precede the value in the console log.
 * @param {unknown} value - The value to log whenever it changes.
 *
 * @example
 * ```ts
 * useLogger('Current count', count);
 * ```
 */
export function useLogger(label: string, value: unknown) {
    useEffect(() => {
        console.log(`[${label}]`, value);
    }, [label, value]);
}
