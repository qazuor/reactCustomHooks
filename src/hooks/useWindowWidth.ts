import { useCallback, useEffect, useRef, useState } from 'react';

interface UseWindowWidthOptions {
    /** Debounce delay in milliseconds */
    debounceDelay?: number;
    /** Whether to start monitoring immediately */
    startImmediately?: boolean;
    /** Initial width to use (defaults to window.innerWidth) */
    initialWidth?: number;
    /** Callback when width changes */
    onChange?: (width: number) => void;
}

interface UseWindowWidthReturn {
    /** Current window width */
    width: number;
    /** Start monitoring width changes */
    start: () => void;
    /** Stop monitoring width changes */
    stop: () => void;
}

/**
 * useWindowWidth
 *
 * @description A hook that gets the current window width and
 * updates it automatically on resize with debouncing.
 * Provides methods to start and stop monitoring.
 *
 * @param {UseWindowWidthOptions} [options] - Optional configuration.
 * @returns {UseWindowWidthReturn} - An object containing the current width and control methods.
 *
 * @example
 * // Example of use in a functional component:
 * import React from 'react';
 * import { useWindowWidth } from 'my-react-hooks';
 *
 * function Demo() {
 *   const { width, start, stop } = useWindowWidth({ debounceDelay: 100 });
 *   return <div>El ancho de la ventana es: {width}px</div>; // Keep Spanish in example string
 * }
 */
export function useWindowWidth({
    debounceDelay = 250,
    startImmediately = true,
    initialWidth = typeof window !== 'undefined' ? window.innerWidth : 0,
    onChange
}: UseWindowWidthOptions = {}): UseWindowWidthReturn {
    const [width, setWidth] = useState<number>(initialWidth);
    const [isMonitoring, setIsMonitoring] = useState(startImmediately);
    const timeoutRef = useRef<number | null>(null);

    const handleResize = useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            const newWidth = window.innerWidth;
            setWidth(newWidth);
            onChange?.(newWidth);
        }, debounceDelay);
    }, [debounceDelay, onChange]);

    const start = useCallback(() => setIsMonitoring(true), []);
    const stop = useCallback(() => setIsMonitoring(false), []);

    useEffect(() => {
        if (isMonitoring) {
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                if (timeoutRef.current) {
                    window.clearTimeout(timeoutRef.current);
                }
            };
        } else {
            window.removeEventListener('resize', handleResize);
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [isMonitoring, handleResize]);

    return { width, start, stop };
}
