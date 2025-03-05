import { useEffect, useRef, useState } from 'react';

interface UseIdlenessOptions {
    /** Time in milliseconds after which the user is considered idle. */
    timeout: number;
    /** A list of browser events that reset the idle timer. */
    events?: string[];
}

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
    events = ['mousemove', 'keydown', 'wheel', 'touchstart']
}: UseIdlenessOptions): boolean {
    const [idle, setIdle] = useState(false);
    const timerId = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetTimer = () => {
        if (timerId.current) {
            clearTimeout(timerId.current);
        }
        setIdle(false);
        timerId.current = setTimeout(() => {
            setIdle(true);
        }, timeout);
    };

    useEffect(() => {
        resetTimer();
        events.forEach((evt) => window.addEventListener(evt, resetTimer));
        return () => {
            if (timerId.current) clearTimeout(timerId.current);
            events.forEach((evt) => window.removeEventListener(evt, resetTimer));
        };
    }, []);

    return idle;
}
