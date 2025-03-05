// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

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
 * @returns {T} - The debounced value.
 *
 * @example
 * ```ts
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // Perform search or API call with debouncedSearch
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
