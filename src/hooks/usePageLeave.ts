import { useCallback, useEffect, useState } from 'react';

export interface UsePageLeaveOptions {
    /** Threshold in pixels from the top of the page. Default is 0. */
    threshold?: number;
    /** Whether to track mouse position. Default is true. */
    enabled?: boolean;
    /** Callback when user leaves the page */
    onLeave?: () => void;
    /** Callback when user returns to the page */
    onReturn?: () => void;
}

export interface UsePageLeaveReturn {
    /** Whether the mouse has left the page */
    hasLeft: boolean;
    /** Enable tracking */
    enable: () => void;
    /** Disable tracking */
    disable: () => void;
}

/**
 * usePageLeave
 *
 * @description This hook detects when the user moves their mouse out of the top edge of the browser window,
 * typically indicating an intent to leave the page. It returns a boolean: `true` if the mouse has left,
 * `false` otherwise.
 * @param {UsePageLeaveOptions} [options] - Optional configuration.
 *
 * @returns {boolean} - `true` when the mouse pointer moves out of the top boundary of the window.
 *
 * @example
 * ```ts
 * const { hasLeft } = usePageLeave();
 * if (hasLeft) {
 *   // Show a modal or an exit-intent popup.
 * }
 *
 * // With options:
 * // const { hasLeft, enable, disable } = usePageLeave({ threshold: 20, enabled: false, onLeave: () => console.log('Left!'), onReturn: () => console.log('Returned!') });
 * ```
 */
export function usePageLeave(options: UsePageLeaveOptions = {}): UsePageLeaveReturn {
    const { threshold = 0, enabled = true, onLeave, onReturn } = options;

    const [hasLeft, setHasLeft] = useState(false);
    const [isEnabled, setIsEnabled] = useState(enabled);

    const handleMouseOut = useCallback(
        (e: MouseEvent) => {
            if (!isEnabled) return;

            if (e.clientY <= threshold) {
                setHasLeft(true);
                onLeave?.();
            }
        },
        [threshold, isEnabled, onLeave]
    );

    const handleMouseOver = useCallback(() => {
        if (!isEnabled) return;

        if (hasLeft) {
            setHasLeft(false);
            onReturn?.();
        }
    }, [isEnabled, hasLeft, onReturn]);

    const enable = useCallback(() => {
        setIsEnabled(true);
    }, []);
    const disable = useCallback(() => {
        setIsEnabled(false);
    }, []);

    useEffect(() => {
        if (isEnabled) {
            document.addEventListener('mouseout', handleMouseOut);
            document.addEventListener('mouseover', handleMouseOver);
        }

        return () => {
            document.removeEventListener('mouseout', handleMouseOut);
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, [isEnabled, handleMouseOut, handleMouseOver]);

    return { hasLeft, enable, disable };
}
