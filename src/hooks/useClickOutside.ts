import { type RefObject, useEffect } from 'react';

type Handler = (event: MouseEvent) => void;

/**
 * useClickOutside
 *
 * @description Triggers a given handler function when the user clicks outside the referenced element.
 * Useful for closing dropdowns, modals, or popovers.
 *
 * @param {RefObject<HTMLElement>} ref - A React ref object pointing to the element to detect clicks outside of.
 * @param {Handler} handler - A callback function to execute when a click occurs outside the element.
 *
 * @example
 * ```ts
 * const ref = useRef(null);
 * useClickOutside(ref, () => {
 *   console.log('Clicked outside the element!');
 * });
 * ```
 */
export function useClickOutside(ref: RefObject<HTMLElement>, handler: Handler) {
    useEffect(() => {
        const listener = (event: MouseEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
        };
    }, [ref, handler]);
}
