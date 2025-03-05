import { useEffect, useRef } from 'react';

interface UseTimeoutOptions {
    /** The callback function to run after the specified delay. */
    callback: () => void;
    /** The time in milliseconds to wait before calling `callback`. If `null`, the timeout is not set. */
    delay: number | null;
}

/**
 * useTimeout
 *
 * @description This hook executes a callback function once after a specified delay. If the `delay` is `null`,
 * it will not schedule any timeout. Changing the `delay` or `callback` will reset the timeout.
 *
 * @param {UseTimeoutOptions} options - Object containing:
 *  - `callback`: The function to be executed.
 *  - `delay`: The time in milliseconds after which `callback` is called, or `null` to disable the timeout.
 *
 * @example
 * ```ts
 * useTimeout({
 *   callback: () => {
 *     console.log('Hello after 3 seconds');
 *   },
 *   delay: 3000,
 * });
 * ```
 */
export function useTimeout({ callback, delay }: UseTimeoutOptions) {
    const savedCallback = useRef<() => void>(() => {});

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;

        const id = setTimeout(() => savedCallback.current?.(), delay);
        return () => clearTimeout(id);
    }, [delay]);
}
