import { useEffect, useRef } from 'react';

interface UseIntervalOptions {
    /** The callback function to be called repeatedly. */
    callback: () => void;
    /** The time in milliseconds between each call. If `null`, the interval is paused. */
    delay: number | null;
}

/**
 * useInterval
 *
 * @description This hook repeatedly executes a callback function at specified intervals.
 * If `delay` is `null`, the interval will be paused.
 *
 * @param {UseIntervalOptions} options - Object containing:
 *  - `callback`: The function to be executed at each interval.
 *  - `delay`: The interval in milliseconds, or `null` to pause.
 *
 * @example
 * ```ts
 * useInterval({
 *   callback: () => {
 *     console.log('Repeating task every second');
 *   },
 *   delay: 1000,
 * });
 * ```
 */
export function useInterval({ callback, delay }: UseIntervalOptions) {
    const savedCallback = useRef<() => void>(() => {});

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay === null) return;
        const id = setInterval(() => savedCallback.current?.(), delay);
        return () => clearInterval(id);
    }, [delay]);
}
