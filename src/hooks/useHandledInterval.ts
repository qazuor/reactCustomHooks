import { type MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

type UseHandledIntervalOptions = {
    /** The callback function to run repeatedly. */
    callback: () => void;
    /** Base delay in milliseconds between calls, if `random` is false. */
    delay: number;
    /** If true, each interval is a random duration between 0 and `delay`. */
    random?: boolean;
    /** If true, the interval starts automatically. Default is true. */
    autoStart?: boolean;
    /** Minimum delay when using random intervals. Default is 0. */
    minDelay?: number;
};

type UseHandledIntervalReturn = {
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
    setDelay: (newDelay: number) => void;
};

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
 *  - `autoStart`: (optional) If true, starts the interval automatically. Default is true.
 *  - `minDelay`: (optional) Minimum delay when using random intervals. Default is 0.
 * @returns {UseHandledIntervalReturn} An object containing control methods and state:
 *  - `isRunning`: Current running state
 *  - `start`: Start/resume the interval
 *  - `pause`: Pause the interval
 *  - `reset`: Reset and restart the interval
 *  - `setDelay`: Update the interval delay
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

export function useHandledInterval({
    callback,
    delay,
    random = false,
    autoStart = true,
    minDelay = 0
}: UseHandledIntervalOptions): UseHandledIntervalReturn {
    const callbackRef: MutableRefObject<() => void> = useRef(callback);
    const [currentDelay, setCurrentDelay] = useState(delay);
    const [isRunning, setIsRunning] = useState(false);
    const intervalId = useRef<number | null>(null);
    const nextIntervalDelay = useRef<number | null>(null);

    const getRandomDelay = useCallback(() => {
        if (!random) {
            return currentDelay;
        }
        const range = currentDelay - minDelay;
        return Math.floor(Math.random() * range) + minDelay;
    }, [currentDelay, random, minDelay]);

    const clear = useCallback(() => {
        if (intervalId.current) clearInterval(intervalId.current);
        intervalId.current = null;
        nextIntervalDelay.current = null;
    }, []);

    const start = useCallback(() => {
        if (intervalId.current) return;

        setIsRunning(true);
        nextIntervalDelay.current = getRandomDelay();

        intervalId.current = window.setInterval(() => {
            callbackRef.current();
            if (random) {
                clear();
                nextIntervalDelay.current = getRandomDelay();
                intervalId.current = window.setInterval(callbackRef.current, nextIntervalDelay.current);
            }
        }, nextIntervalDelay.current);
    }, [random, getRandomDelay, clear]);

    const pause = useCallback(() => {
        setIsRunning(false);
        clear();
    }, [clear]);

    const reset = useCallback(() => {
        pause();
        start();
    }, [pause, start]);

    const setDelay = useCallback(
        (newDelay: number) => {
            setCurrentDelay(newDelay);
            if (isRunning) {
                clear();
                start();
            }
        },
        [isRunning, clear, start]
    );

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Adjust autoStart logic
    useEffect(() => {
        if (autoStart) {
            start();
        }
        return () => clear();
    }, [autoStart, start, clear]);

    return { isRunning, start, pause, reset, setDelay };
}
