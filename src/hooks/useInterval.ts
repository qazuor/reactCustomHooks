import { useCallback, useEffect, useRef, useState } from 'react';

type UseIntervalOptions = {
    /** The callback function to be called repeatedly. */
    callback: () => void;
    /** The time in milliseconds between each call. If `null`, the interval is paused. */
    delay: number | null;
    /** Whether to run the callback immediately when starting. Default is false. */
    runImmediately?: boolean;
    /** Whether to start the interval automatically. Default is true. */
    autoStart?: boolean;
};

type UseIntervalReturn = {
    /** Whether the interval is currently running */
    isRunning: boolean;
    /** Start or resume the interval */
    start: () => void;
    /** Pause the interval */
    pause: () => void;
    /** Reset and restart the interval */
    restart: () => void;
};

/**
 * useInterval
 *
 * @description This hook repeatedly executes a callback function at specified intervals.
 * If `delay` is `null`, the interval will be paused.
 *
 * @param {UseIntervalOptions} options - Object containing:
 *  - `callback`: The function to be executed at each interval.
 *  - `delay`: The interval in milliseconds, or `null` to pause.
 *  - `runImmediately`: Whether to run callback immediately when starting.
 *  - `autoStart`: Whether to start interval automatically.
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
 *
 * @returns {UseIntervalReturn} An object containing:
 *  - `isRunning`: Whether the interval is active
 *  - `start`: Function to start/resume the interval
 *  - `pause`: Function to pause the interval
 *  - `restart`: Function to reset and restart the interval
 */
export function useInterval({
    callback,
    delay,
    runImmediately = false,
    autoStart = true
}: UseIntervalOptions): UseIntervalReturn {
    const savedCallback = useRef(callback);
    const [isRunning, setIsRunning] = useState(false);

    const intervalId = useRef<number | null>(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    const cleanup = useCallback(() => {
        if (intervalId.current !== null) {
            clearInterval(intervalId.current);
            intervalId.current = null;
        }
    }, []);

    const start = useCallback(() => {
        if (delay === null) {
            setIsRunning(false);
            return;
        }

        if (intervalId.current !== null) {
            return;
        }

        setIsRunning(true);
        if (runImmediately) {
            savedCallback.current();
        }

        intervalId.current = window.setInterval(() => {
            savedCallback.current();
        }, delay);
    }, [delay, runImmediately]);

    const pause = useCallback(() => {
        cleanup();
        setIsRunning(false);
    }, [cleanup]);

    const restart = useCallback(() => {
        cleanup();
        start();
    }, [cleanup, start]);

    useEffect(() => {
        if (autoStart) {
            start();
        }
        return cleanup;
    }, [autoStart, start, cleanup]);

    return { isRunning, start, pause, restart };
}
