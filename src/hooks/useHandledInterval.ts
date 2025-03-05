import { useCallback, useEffect, useRef, useState } from 'react';

interface UseHandledIntervalOptions {
    /** The callback function to run repeatedly. */
    callback: () => void;
    /** Base delay in milliseconds between calls, if `random` is false. */
    delay: number;
    /** If true, each interval is a random duration between 0 and `delay`. */
    random?: boolean;
}

/**
 * useHandledInterval
 *
 * @description An enhanced interval hook that provides control methods such as pause, resume, and reset.
 * Additionally, it can run on a random delay between 0 and the specified `delay` if `random` is enabled.
 *
 * @param {UseHandledIntervalOptions} options - An object containing:
 *  - `callback`: The function to execute at each interval tick.
 *  - `delay`: The base interval (ms).
 *  - `random`: (optional) If true, each interval is randomly calculated in the range [0..delay].
 *
 * @returns {{isRunning: boolean, start: () => void, pause: () => void, reset: () => void}}
 * An object providing:
 *  - `isRunning`: Indicates whether the interval is currently running.
 *  - `start`: A function to start or resume the interval.
 *  - `pause`: Pauses the interval.
 *  - `reset`: Pauses and restarts the interval from scratch.
 *
 * @example
 * ```ts
 * const { isRunning, start, pause, reset } = useHandledInterval({
 *   callback: () => console.log('Tick'),
 *   delay: 1000,
 *   random: false
 * });
 * ```
 */

export function useHandledInterval({ callback, delay, random = false }: UseHandledIntervalOptions) {
    const callbackRef = useRef(callback);
    const [isRunning, setIsRunning] = useState(false);
    const intervalId = useRef<number | null>(null);

    const clear = () => {
        if (intervalId.current) clearInterval(intervalId.current);
        intervalId.current = null;
    };

    const start = useCallback(() => {
        if (intervalId.current) return; // ya está en marcha
        setIsRunning(true);

        const actualDelay = () => (random ? Math.floor(Math.random() * delay) : delay);

        intervalId.current = window.setInterval(() => {
            callbackRef.current();
        }, actualDelay());
    }, [delay, random]);

    const pause = useCallback(() => {
        setIsRunning(false);
        clear();
    }, []);

    const reset = useCallback(() => {
        pause();
        start();
    }, [pause, start]);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        start();
        return () => clear();
    }, []);

    return { isRunning, start, pause, reset };
}
