import { useCallback, useEffect, useRef, useState } from 'react';

interface Size {
    width: number;
    height: number;
}

type ObserverRef = {
    observer: ResizeObserver | null;
    element: HTMLDivElement | null;
};

/**
 * useMeasure
 *
 * @description Measures the width and height of a referenced HTML element using the `ResizeObserver` API.
 * Returns a `ref` callback to be assigned to the element, and a `size` object containing the dimensions.
 *
 * @returns {{
 *   ref: (node: HTMLDivElement | null) => void,
 *   size: { width: number; height: number; }
 * }} - An object containing:
 *  - `ref`: A callback ref function to attach to the element you want to measure.
 *  - `size`: An object with `width` and `height` of the element.
 *
 * @example
 * ```ts
 * const { ref, size } = useMeasure();
 * return <div ref={ref}>Width: {size.width}, Height: {size.height}</div>;
 * ```
 */
export function useMeasure() {
    const [size, setSize] = useState<Size>({ width: 0, height: 0 });
    const observerRef = useRef<ObserverRef>({ observer: null, element: null });

    const ref = useCallback((node: HTMLDivElement | null) => {
        if (!node) return;

        // Clean up previous observer if it exists
        if (observerRef.current.observer) {
            observerRef.current.observer.disconnect();
        }

        // Create new observer
        const observer = new ResizeObserver(([entry]) => {
            setSize({
                width: entry.contentRect.width,
                height: entry.contentRect.height
            });
        });

        // Store references
        observerRef.current = { observer, element: node };

        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (observerRef.current.observer) {
                observerRef.current.observer.disconnect();
            }
        };
    }, []);

    return { ref, size };
}
