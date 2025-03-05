import { useEffect, useState } from 'react';

/**
 * useMediaQuery
 *
 * @description Evaluates a CSS media query and returns a boolean indicating whether it currently matches.
 * This hook automatically re-evaluates when the window is resized or the media query status changes.
 *
 * @param {string} query - A valid CSS media query string, such as `(max-width: 768px)`.
 * @returns {boolean} - `true` if the query is currently matched, `false` otherwise.
 *
 * @example
 * ```ts
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * console.log(isMobile ? 'Mobile layout' : 'Desktop layout');
 * ```
 */
export function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mediaQuery.addEventListener('change', handler);

        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, [query]);

    return matches;
}
