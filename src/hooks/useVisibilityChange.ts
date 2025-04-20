import { useCallback, useEffect, useState } from 'react';

interface UseVisibilityChangeOptions {
    /** Callback when document becomes visible */
    onVisible?: () => void;
    /** Callback when document becomes hidden */
    onHidden?: () => void;
    /** Whether to start monitoring immediately */
    startImmediately?: boolean;
}

interface UseVisibilityChangeReturn {
    /** Whether the document is currently visible */
    isVisible: boolean;
    /** Start monitoring visibility changes */
    start: () => void;
    /** Stop monitoring visibility changes */
    stop: () => void;
}

/**
 * useVisibilityChange
 *
 * @description Tracks the visibility state of the current document (i.e., whether the tab is in the foreground).
 * Returns `true` if the document is visible, or `false` if it's hidden.
 * Provides methods to start and stop monitoring.
 *
 * @param {UseVisibilityChangeOptions} [options] - Optional configuration.
 * @returns {UseVisibilityChangeReturn} - An object containing the current visibility state and control methods.
 *
 * @example
 * ```ts
 * const { isVisible, start, stop } = useVisibilityChange({ startImmediately: true });
 *
 * useEffect(() => {
 *   console.log(isVisible ? 'Tab is active' : 'Tab is hidden');
 * }, [isVisible]);
 *
 * // To manually control monitoring:
 * // const { isVisible, start, stop } = useVisibilityChange({ startImmediately: false });
 * // // ... later ...
 * // start();
 * ```
 */
export function useVisibilityChange({
    onVisible,
    onHidden,
    startImmediately = true
}: UseVisibilityChangeOptions = {}): UseVisibilityChangeReturn {
    const [isVisible, setIsVisible] = useState(!document.hidden);
    const [isMonitoring, setIsMonitoring] = useState(startImmediately);

    const handleVisibilityChange = useCallback(() => {
        const newVisibility = !document.hidden;
        setIsVisible(newVisibility);
        if (newVisibility) {
            onVisible?.();
        } else {
            onHidden?.();
        }
    }, [onVisible, onHidden, isMonitoring]);

    const start = useCallback(() => setIsMonitoring(true), []);
    const stop = useCallback(() => setIsMonitoring(false), []);

    useEffect(() => {
        if (isMonitoring) {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        } else {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }, [isMonitoring, handleVisibilityChange]);

    return { isVisible, start, stop };
}
