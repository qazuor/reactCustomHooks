import { useState } from 'react';

/**
 * useSessionStorage
 *
 * @description A hook that synchronizes a stateful value with the browser's Session Storage.
 * Similar to `useLocalStorage`, but it uses `sessionStorage` under the hood.
 * Data stored in Session Storage is cleared after the session ends (e.g., when the browser tab is closed).
 *
 * @typeParam T - The type of the value to store.
 * @param {string} key - The key under which the value is stored in Session Storage.
 * @param {T} initialValue - The default value if none is found in Session Storage.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A tuple with:
 *  - The current stored value.
 *  - A setter function that updates both the state and Session Storage.
 *
 * @example
 * ```ts
 * const [sessionData, setSessionData] = useSessionStorage('session-key', { foo: 'bar' });
 * ```
 */
export function useSessionStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        setStoredValue((prev) => {
            const newValue = value instanceof Function ? value(prev) : value;
            window.sessionStorage.setItem(key, JSON.stringify(newValue));
            return newValue;
        });
    };

    return [storedValue, setValue] as const;
}
