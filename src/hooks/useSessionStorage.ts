import { useCallback, useEffect, useRef, useState } from 'react';

interface StorageOptions<T> {
    /** Serializer function to convert value to string */
    serializer?: (value: T) => string;
    /** Deserializer function to parse stored string */
    deserializer?: (value: string) => T;
    /** Error handler function */
    onError?: (error: Error) => void;
    /** Whether to sync across browser tabs */
    syncTabs?: boolean;
}

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
 * @param {StorageOptions<T>} [options] - Optional configuration.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A tuple with:
 *  - The current stored value.
 *  - A setter function that updates both the state and Session Storage.
 *
 * @example
 * ```ts
 * const [sessionData, setSessionData] = useSessionStorage('session-key', { foo: 'bar' });
 * ```
 */
export function useSessionStorage<T>(key: string, initialValue: T, options: StorageOptions<T> = {}) {
    const {
        serializer = JSON.stringify,
        deserializer = JSON.parse,
        onError = console.error,
        syncTabs = false
    } = options;

    const mounted = useRef(true);

    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? deserializer(item) : initialValue;
        } catch (error) {
            onError(error as Error);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((val: T) => T)) => {
            setStoredValue((prev) => {
                try {
                    const newValue = value instanceof Function ? value(prev) : value;
                    window.sessionStorage.setItem(key, serializer(newValue));
                    return newValue;
                } catch (error) {
                    onError(error as Error);
                    return prev;
                }
            });
        },
        [key, serializer, onError]
    );

    const handleStorageChange = useCallback(
        (event: StorageEvent) => {
            if (event.key === key && event.newValue !== null && mounted.current) {
                try {
                    const newValue = deserializer(event.newValue);
                    setStoredValue(newValue);
                } catch (error) {
                    onError(error as Error);
                }
            }
        },
        [key, deserializer, onError]
    );

    useEffect(() => {
        if (syncTabs) {
            window.addEventListener('storage', handleStorageChange);
            return () => {
                window.removeEventListener('storage', handleStorageChange);
            };
        }
    }, [syncTabs, handleStorageChange]);

    useEffect(
        () => () => {
            mounted.current = false;
        },
        []
    );

    return [storedValue, setValue] as const;
}
