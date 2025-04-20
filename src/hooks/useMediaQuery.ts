import { useCallback, useEffect, useState } from 'react';

interface UseMediaQueryOptions {
    /** Whether to initialize with SSR-safe default. Default is true. */
    ssrSafe?: boolean;
    /** Default value when SSR safe mode is enabled. Default is false. */
    ssrDefaultValue?: boolean;
    /** Whether to start watching immediately. Default is true. */
    watchImmediately?: boolean;
}

interface UseMediaQueryReturn {
    /** Whether the media query matches */
    matches: boolean;
    /** Start watching for media query changes */
    startWatching: () => void;
    /** Stop watching for media query changes */
    stopWatching: () => void;
}

type MediaQueryHandler = (event: MediaQueryListEvent) => void;

/**
 * useMediaQuery
 *
 * @description Evaluates a CSS media query and returns a boolean indicating whether it currently matches.
 * This hook automatically re-evaluates when the window is resized or the media query status changes.
 *
 * @param {string} query - A valid CSS media query string, such as `(max-width: 768px)`.
 * @param {UseMediaQueryOptions} [options] - Optional configuration.
 * @returns {UseMediaQueryReturn} - An object containing `matches` (boolean), `startWatching` (function), and `stopWatching` (function).
 *
 * @example
 * ```ts
 * const { matches: isMobile } = useMediaQuery('(max-width: 768px)');
 * console.log(isMobile ? 'Mobile layout' : 'Desktop layout');
 *
 * const { matches: isTablet, startWatching, stopWatching } = useMediaQuery('(min-width: 769px) and (max-width: 1024px)', { watchImmediately: false });
 * // Later...
 * startWatching();
 * // Later...
 * stopWatching();
 * ```
 */
export function useMediaQuery(
    query: string,
    { ssrSafe = true, ssrDefaultValue = false, watchImmediately = true }: UseMediaQueryOptions = {}
): UseMediaQueryReturn {
    // State to control whether we should be listening (active or manually deactivated)
    const [shouldListen, setShouldListen] = useState(watchImmediately);

    // State to store the current query result
    const [matches, setMatches] = useState(() => {
        // Initial state calculation: SSR-safe check
        if (ssrSafe && typeof window === 'undefined') {
            return ssrDefaultValue;
        }
        // If window is available, get the initial match state directly
        if (typeof window !== 'undefined' && window.matchMedia) {
            try {
                return window.matchMedia(query).matches;
            } catch (e) {
                console.error('Failed to get initial media query match:', query, e);
                return ssrDefaultValue; // Return in case of error
            }
        }
        // Return for environments without window.matchMedia when not SSR safe or window is undefined
        return ssrDefaultValue;
    });

    // Memoized handler function for the media query change event
    const handleChange = useCallback((e: MediaQueryListEvent) => {
        setMatches(e.matches);
    }, []);

    // Function to start listening manually
    const startWatching = useCallback(() => {
        // Only allow starting if the environment supports it
        if (typeof window !== 'undefined' && window.matchMedia !== undefined) {
            setShouldListen(true);
        } else {
            console.warn('Cannot start watching media query: window.matchMedia is not available.');
        }
    }, []);

    // Function to stop listening manually
    const stopWatching = useCallback(() => {
        setShouldListen(false);
    }, []);

    // Effect to manage the media query listener lifecycle
    useEffect(() => {
        let mediaQueryList: MediaQueryList | null = null;
        let handler: MediaQueryHandler | null = null;

        // Only set up the listener if shouldListen is true and the environment supports it
        if (shouldListen && typeof window !== 'undefined' && window.matchMedia !== undefined) {
            try {
                // Create the MediaQueryList instance for the current query
                mediaQueryList = window.matchMedia(query);
                // Update the matches state immediately with the result of the new query
                setMatches(mediaQueryList.matches);

                // Use the memoized handler
                handler = handleChange;

                // Add the listener using the recommended method (addEventListener) or the fallback
                if (mediaQueryList.addEventListener) {
                    mediaQueryList.addEventListener('change', handler);
                } else {
                    // Deprecated: Fallback for older browsers
                    mediaQueryList.addListener(handler);
                }
            } catch (e) {
                console.error('Failed to set up media query listener:', query, e);
                // If setup fails, stop listening to prevent further errors
                setShouldListen(false);
            }
        }

        // Cleanup function for this effect execution
        return () => {
            // This runs when dependencies change (query or shouldListen) or the component unmounts.
            // If a listener was successfully added in the setup phase of *this specific effect execution*, remove it.
            if (mediaQueryList && handler) {
                try {
                    if (mediaQueryList.removeEventListener) {
                        mediaQueryList.removeEventListener('change', handler);
                    } else {
                        mediaQueryList.removeListener(handler);
                    }
                } catch (e) {
                    console.error('Failed to remove media query listener during cleanup:', query, e);
                }
            }
        };
    }, [query, shouldListen, handleChange]); // Dependencies

    // Effect to handle the initial matches state on the client after SSR/hydration.
    // This effect runs only once on the client after the initial render if ssrSafe is true
    // (meaning the initial state might have been the SSR default value).
    useEffect(() => {
        // Check if we are on the client and matchMedia is available, AND ssrSafe was true
        // (which means the initial state may have been the SSR default value).
        if (ssrSafe && typeof window !== 'undefined' && window.matchMedia !== undefined) {
            try {
                // Update the matches state based on the actual match state on the client
                setMatches(window.matchMedia(query).matches);
            } catch (e) {
                console.error('Failed to update matches state after hydration:', query, e);
            }
        }
        // This effect should ideally run only once after mounting if ssrSafe is true.
        // Adding query and ssrSafe to dependencies ensures it re-runs if these props change,
        // which might be unexpected for a hydration effect, but necessary if the hook's props
        // can change dynamically after mounting in an SSR scenario.
    }, [query, ssrSafe]); // Dependencies

    return { matches, startWatching, stopWatching };
}
