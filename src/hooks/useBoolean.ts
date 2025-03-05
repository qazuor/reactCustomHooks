import { useCallback, useState } from 'react';

/**
 * useBoolean
 *
 * @description Manages a boolean state with convenient methods to set it to true, false, or toggle it.
 *
 * @param {boolean} [initialValue=false] - Optional initial value.
 * @returns {{
 *   value: boolean,
 *   setTrue: () => void,
 *   setFalse: () => void,
 *   toggle: () => void
 * }} - An object containing:
 *  - `value`: The current boolean value.
 *  - `setTrue()`: Sets the value to `true`.
 *  - `setFalse()`: Sets the value to `false`.
 *  - `toggle()`: Toggles the value between `true` and `false`.
 *
 * @example
 * ```ts
 * const { value, setTrue, setFalse, toggle } = useBoolean();
 * setTrue();  // value -> true
 * toggle();   // value -> false
 * ```
 */
export function useBoolean(initialValue = false) {
    const [value, setValue] = useState(initialValue);

    const setTrue = useCallback(() => setValue(true), []);
    const setFalse = useCallback(() => setValue(false), []);
    const toggle = useCallback(() => setValue((v) => !v), []);

    return { value, setTrue, setFalse, toggle };
}
