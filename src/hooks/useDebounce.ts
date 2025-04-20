// src/hooks/useDebounce.ts
import { useEffect, useRef, useState } from 'react';

/**
 * useDebounce
 *
 * @description Returns a debounced value that updates only after the specified delay has elapsed
 * since the last change to the original value. Useful for delaying expensive operations (e.g., API calls)
 * until the user stops typing or making changes.
 *
 * @typeParam T - The type of the value being debounced.
 * @param {T} value - The input value to debounce.
 * @param {number} delay - The delay in milliseconds before updating the debounced value.
 * @param {boolean} [immediate=false] - Whether to update immediately on the first value change.
 * @returns {T} - The debounced value.
 *
 * @example
 * ```ts
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300, true);
 *
 * useEffect(() => {
 *   // Perform search or API call with debouncedSearch
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number, immediate = false): T {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // If immediate is true, update immediately
        if (immediate) {
            setDebouncedValue(value);
            return;
        }

        // Set up new timeout for debounced update
        timeoutRef.current = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay, immediate]);

    return debouncedValue;
}
