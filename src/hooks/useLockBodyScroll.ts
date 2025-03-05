import { useEffect } from 'react';

/**
 * useLockBodyScroll
 *
 * @description Prevents scrolling of the `document.body` while the component is mounted.
 * Restores the original overflow setting when the component unmounts.
 *
 * @example
 * ```ts
 * // In a modal component
 * useLockBodyScroll();
 * ```
 */
export function useLockBodyScroll() {
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);
}
