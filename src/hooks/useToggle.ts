import { useCallback, useEffect, useRef, useState } from 'react';

interface UseToggleOptions {
    /** Initial value for the toggle */
    initialValue?: boolean;
    /** Callback when value changes */
    onChange?: (value: boolean) => void;
    /** Whether to persist the value in localStorage */
    persist?: boolean;
    /** Key to use for localStorage persistence */
    storageKey?: string;
}

interface UseToggleReturn {
    /** Current value */
    value: boolean;
    /** Toggle the value */
    toggle: () => void;
    /** Set value to true */
    setTrue: () => void;
    /** Set value to false */
    setFalse: () => void;
    /** Set value directly */
    setValue: (value: boolean) => void;
}

/**
 * useToggle
 *
 * @description Manages a boolean state with a toggle function. Provides an easy way
 * to switch a value between `true` and `false`.
 *
 * @param {UseToggleOptions} [options] - Optional configuration.
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
export function useToggle({
    initialValue = false,
    onChange,
    persist = false,
    storageKey = 'useToggle'
}: UseToggleOptions = {}): UseToggleReturn {
    const [value, setValue] = useState(() => {
        if (persist) {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : initialValue;
        }
        return initialValue;
    });

    const mounted = useRef(true);

    const updateValue = useCallback(
        (newValue: boolean) => {
            if (mounted.current) {
                setValue(newValue);
                onChange?.(newValue);
                if (persist) {
                    localStorage.setItem(storageKey, JSON.stringify(newValue));
                }
            }
        },
        [onChange, persist, storageKey]
    );

    const toggle = useCallback(() => updateValue(!value), [value, updateValue]);
    const setTrue = useCallback(() => updateValue(true), [updateValue]);
    const setFalse = useCallback(() => updateValue(false), [updateValue]);

    useEffect(
        () => () => {
            mounted.current = false;
        },
        []
    );

    return {
        value,
        toggle,
        setTrue,
        setFalse,
        setValue: updateValue
    };
}
