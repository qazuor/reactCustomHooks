import { useEffect, useState } from 'react';

/**
 * usePageLeave
 *
 * @description This hook detects when the user moves their mouse out of the top edge of the browser window,
 * typically indicating an intent to leave the page. It returns a boolean: `true` if the mouse has left,
 * `false` otherwise.
 *
 * @returns {boolean} - `true` when the mouse pointer moves out of the top boundary of the window.
 *
 * @example
 * ```ts
 * const hasLeft = usePageLeave();
 * if (hasLeft) {
 *   // Show a modal or an exit-intent popup.
 * }
 * ```
 */
export function usePageLeave(): boolean {
    const [hasLeft, setHasLeft] = useState(false);

    useEffect(() => {
        const handleMouseOut = (e: MouseEvent) => {
            if (e.clientY <= 0) setHasLeft(true);
        };
        const handleMouseOver = () => setHasLeft(false);

        document.addEventListener('mouseout', handleMouseOut);
        document.addEventListener('mouseover', handleMouseOver);

        return () => {
            document.removeEventListener('mouseout', handleMouseOut);
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return hasLeft;
}
