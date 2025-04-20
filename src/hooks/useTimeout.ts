import { useCallback, useEffect, useRef, useState } from 'react';

type UseTimeoutOptions = {
    /** The callback function to run after the specified delay. */
    callback: () => void;
    /** The time in milliseconds to wait before calling `callback`. If `null`, the timeout is not set. */
    delay: number | null;
    /** Whether to start the timeout automatically. Default is true. */
    autoStart?: boolean;
};

type UseTimeoutReturn = {
    /** Whether the timeout is currently pending */
    isPending: boolean;
    /** Start or restart the timeout */
    start: () => void;
    /** Cancel the timeout */
    cancel: () => void;
    /** Reset and restart the timeout */
    reset: () => void;
};

/**
 * useTimeout
 *
 * @description This hook executes a callback function once after a specified delay. If the `delay` is `null`,
 * it will not schedule any timeout. Changing the `delay` or `callback` will reset the timeout.
 *
 * @returns {UseTimeoutReturn} Control methods and state for the timeout.
 * @param {UseTimeoutOptions} options - Object containing:
 *  - `callback`: The function to be executed.
 *  - `delay`: The time in milliseconds after which `callback` is called, or `null` to disable the timeout.
 *  - `autoStart`: Whether to start the timeout automatically on mount or when dependencies change. Default is true.
 *
 * @example
 * ```ts
 * const { isPending, start, cancel, reset } = useTimeout({
 *   callback: () => {
 *     console.log('Hello after 3 seconds');
 *   },
 *   delay: 3000,
 * });
 *
 * // To manually start/stop:
 * // const { isPending, start, cancel, reset } = useTimeout({ callback: () => console.log('Manual'), delay: 1000, autoStart: false });
 * // useEffect(() => { start(); }, []); // Start manually after initial render
 * ```
 */
export function useTimeout({ callback, delay, autoStart = true }: UseTimeoutOptions): UseTimeoutReturn {
    const savedCallback = useRef<() => void>(() => {});
    const timeoutId = useRef<number | null>(null);
    const [isPending, setIsPending] = useState(false); // Initialize as false

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    const clear = useCallback(() => {
        if (timeoutId.current !== null) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }
        setIsPending(false);
    }, []);

    const start = useCallback(() => {
        clear();

        if (delay !== null) {
            setIsPending(true); // Set pending *before* scheduling
            timeoutId.current = window.setTimeout(() => {
                savedCallback.current();
                setIsPending(false); // Set not pending after execution
            }, delay);
        }
        // If delay is null, clear() already set isPending to false. No need to do anything else here.
    }, [delay, clear]);

    const reset = useCallback(() => {
        clear();
        start();
    }, [clear, start]);

    useEffect(() => {
        if (autoStart && delay !== null) {
            start();
        }
        return clear;
    }, [delay, autoStart, start, clear]);

    return {
        isPending,
        start,
        cancel: clear,
        reset
    };
}
