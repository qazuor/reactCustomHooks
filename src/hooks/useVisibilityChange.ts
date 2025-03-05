import { useEffect, useState } from 'react';

/**
 * useVisibilityChange
 *
 * @description Tracks the visibility state of the current document (i.e., whether the tab is in the foreground).
 * Returns `true` if the document is visible, or `false` if it's hidden.
 *
 * @returns {boolean} - A boolean indicating whether the document is visible (`true`) or hidden (`false`).
 *
 * @example
 * ```ts
 * const isDocumentVisible = useVisibilityChange();
 * console.log(isDocumentVisible ? 'Tab is active' : 'Tab is hidden');
 * ```
 */
export function useVisibilityChange() {
    const [isVisible, setIsVisible] = useState(!document.hidden);

    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsVisible(!document.hidden);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    return isVisible;
}
