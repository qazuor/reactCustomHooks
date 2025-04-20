import { useCallback, useEffect, useRef, useState } from 'react';

type UseIdlenessOptions = {
    /** Time in milliseconds after which the user is considered idle. */
    timeout: number;
    /** A list of browser events that reset the idle timer. */
    events?: string[];
    /** Whether to start monitoring immediately. Default is true. */
    startImmediately?: boolean;
    /** Callback function to execute when idle state changes. */
    onIdleChange?: (isIdle: boolean) => void;
};

type UseIdlenessReturn = {
    /** Current idle state */
    isIdle: boolean;
    /** Start monitoring for idleness */
    start: () => void;
    /** Stop monitoring for idleness */
    stop: () => void;
    /** Reset the idle timer */
    reset: () => void;
};

/**
 * useIdleness
 *
 * @description This hook detects whether the user is idle after a specified timeout period.
 * By default, it listens to user activity events such as `mousemove`, `keydown`, `wheel`, and `touchstart`.
 * Once the user is inactive for the given `timeout`, the hook returns `true`. If any of the specified events occur,
 * the timer resets and the hook returns `false` again.
 *
 * @param {UseIdlenessOptions} options - Object containing:
 *  - `timeout`: The idle threshold in milliseconds.
 *  - `events`: (optional) Array of event names that should reset the idle timer.
 *  - `startImmediately`: (optional) Whether to start monitoring immediately.
 *  - `onIdleChange`: (optional) Callback for idle state changes.
 *
 * @returns {boolean} - A boolean indicating whether the user is currently idle (`true`) or active (`false`).
 *
 * @example
 * ```ts
 * const isIdle = useIdleness({ timeout: 5000 });
 *
 * if (isIdle) {
 *   // The user has been idle for 5 seconds.
 * }
 * ```
 */
export function useIdleness({
    timeout,
    events = ['mousemove', 'keydown', 'wheel', 'touchstart'],
    startImmediately = true,
    onIdleChange
}: UseIdlenessOptions): UseIdlenessReturn {
    const [idle, setIdle] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(startImmediately);
    const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mounted = useRef(true);
    const eventsRef = useRef(events);

    const clearTimer = useCallback(() => {
        if (timerId.current) {
            clearTimeout(timerId.current);
            timerId.current = null;
        }
    }, []);

    const setIdleState = useCallback(
        (newState: boolean) => {
            if (mounted.current && idle !== newState) {
                setIdle(newState);
                onIdleChange?.(newState);
            }
        },
        [idle, onIdleChange]
    );

    const resetTimer = useCallback(() => {
        clearTimer();
        setIdleState(false);

        if (isMonitoring) {
            timerId.current = setTimeout(() => {
                setIdleState(true);
            }, timeout);
        }
    }, [timeout, isMonitoring, clearTimer, setIdleState]);

    const start = useCallback(() => {
        setIsMonitoring(true);
        resetTimer();
        resetTimer();
    }, [resetTimer]);

    const stop = useCallback(() => {
        setIsMonitoring(false);
        clearTimer();
        setIdleState(false);
    }, [clearTimer, setIdleState]);

    useEffect(() => {
        if (isMonitoring) {
            eventsRef.current.forEach((evt) => window.addEventListener(evt, resetTimer));
            timerId.current = setTimeout(() => {
                setIdleState(true);
            }, timeout);
        }

        return () => {
            clearTimer();
            eventsRef.current.forEach((evt) => window.removeEventListener(evt, resetTimer));
        };
    }, [isMonitoring, resetTimer, clearTimer, timeout, setIdleState]);

    useEffect(
        () => () => {
            mounted.current = false;
        },
        []
    );

    return { isIdle: idle, start, stop, reset: resetTimer };
}
