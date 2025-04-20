import { type RefObject, useCallback, useEffect } from 'react';

type Handler = (event: MouseEvent) => void;

interface UseClickOutsideOptions {
    enabled?: boolean;
    eventType?: 'mousedown' | 'mouseup' | 'click';
}

/**
 * useClickOutside
 *
 * @description Triggers a given handler function when the user clicks outside the referenced element.
 * Useful for closing dropdowns, modals, or popovers.
 *
 * @param {RefObject<HTMLElement>} ref - A React ref object pointing to the element to detect clicks outside of.
 * @param {Handler} handler - A callback function to execute when a click occurs outside the element.
 * @param {UseClickOutsideOptions} [options] - Optional configuration object.
 * @param {boolean} [options.enabled=true] - Whether the click outside detection is enabled.
 * @param {string} [options.eventType='mousedown'] - The type of mouse event to listen for.
 *
 * @example
 * ```ts
 * const ref = useRef(null);
 * useClickOutside(ref, () => {
 *   console.log('Clicked outside the element!');
 * }, {
 *   enabled: true,
 *   eventType: 'mousedown'
 * });
 * ```
 */
export function useClickOutside(
    ref: RefObject<HTMLElement>,
    handler: Handler,
    { enabled = true, eventType = 'mousedown' }: UseClickOutsideOptions = {}
) {
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        },
        [ref, handler]
    );

    useEffect(() => {
        if (!enabled) {
            return;
        }

        document.addEventListener(eventType, handleClickOutside);
        return () => {
            document.removeEventListener(eventType, handleClickOutside);
        };
    }, [ref, handler, enabled, eventType, handleClickOutside]);
}
