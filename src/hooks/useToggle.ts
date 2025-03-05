import { useCallback, useState } from 'react';

/**
 * useToggle
 *
 * @description Manages a boolean state with a toggle function. Provides an easy way
 * to switch a value between `true` and `false`.
 *
 * @param {boolean} [initialValue=false] - Optional initial value of the toggle.
 * @returns {[boolean, () => void]} - A tuple containing:
 *  - The current boolean value.
 *  - A function to toggle the value.
 *
 * @example
 * ```ts
 * const [isOn, toggleIsOn] = useToggle(false);
 * // isOn === false initially
 * toggleIsOn(); // isOn === true
 * ```
 */
export function useToggle(initialValue = false) {
    const [value, setValue] = useState(initialValue);
    const toggle = useCallback(() => setValue((v) => !v), []);

    return [value, toggle] as const;
}
