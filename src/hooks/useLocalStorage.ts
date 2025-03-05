import { useState } from 'react';

/**
 * useLocalStorage
 *
 * @description A hook that synchronizes a stateful value with the browser's Local Storage.
 * The hook reads the stored value from Local Storage on initial render, and writes updates back to Local Storage.
 *
 * @typeParam T - The type of the value to store.
 * @param {string} key - The key under which the value is stored in Local Storage.
 * @param {T} initialValue - The default value if none is found in Local Storage.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A tuple with:
 *  - The current stored value.
 *  - A setter function that updates both the state and Local Storage.
 *
 * @example
 * ```ts
 * const [username, setUsername] = useLocalStorage('username', '');
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        setStoredValue((prev) => {
            const newValue = value instanceof Function ? value(prev) : value;
            window.localStorage.setItem(key, JSON.stringify(newValue));
            return newValue;
        });
    };

    return [storedValue, setValue] as const;
}
