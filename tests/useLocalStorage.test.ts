import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useLocalStorage } from '../src/hooks/useLocalStorage';

interface TestObject {
    name: string;
    value: number;
}

describe('useLocalStorage', () => {
    let hook: RenderHookResult<readonly [string, (value: string | ((val: string) => string)) => void], unknown>;
    const testKey = 'test-key';
    const initialValue = 'initial';
    const mockError = new Error('Storage error');

    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    it('should initialize with default value when no stored value exists', () => {
        const hook = renderHook(() => useLocalStorage(testKey, initialValue));
        expect(hook.result.current[0]).toBe(initialValue);
        expect(localStorage.getItem(testKey)).toBe(JSON.stringify(initialValue));
    });

    it('should initialize with stored value when it exists', () => {
        const storedValue = 'stored';
        localStorage.setItem(testKey, JSON.stringify(storedValue));

        const storedHook = renderHook(() => useLocalStorage(testKey, initialValue));
        expect(storedHook.result.current[0]).toBe(storedValue);
    });

    it('should update value and localStorage when setValue is called', () => {
        const hook = renderHook(() => useLocalStorage(testKey, initialValue));
        const newValue = 'updated';

        act(() => {
            hook.result.current[1](newValue);
        });

        expect(hook.result.current[0]).toBe(newValue);
        expect(localStorage.getItem(testKey)).toBe(JSON.stringify(newValue));
    });

    it('should handle function updates correctly', () => {
        const hook = renderHook(() => useLocalStorage(testKey, initialValue));
        act(() => {
            hook.result.current[1]((prev) => `${prev}-updated`);
        });

        expect(hook.result.current[0]).toBe('initial-updated');
        expect(localStorage.getItem(testKey)).toBe(JSON.stringify('initial-updated'));
    });

    it('should handle complex objects', () => {
        const complexHook = renderHook(() => useLocalStorage<TestObject>('complex-key', { name: 'test', value: 42 }));

        const updatedValue = { name: 'updated', value: 100 };
        act(() => {
            complexHook.result.current[1](updatedValue);
        });

        expect(complexHook.result.current[0]).toEqual(updatedValue);
        expect(JSON.parse(localStorage.getItem('complex-key')!)).toEqual(updatedValue);
    });

    it('should handle errors during initialization', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        localStorage.setItem(testKey, 'invalid json');

        const errorHook = renderHook(() => useLocalStorage(testKey, initialValue));
        expect(errorHook.result.current[0]).toBe(initialValue);
        expect(errorSpy).toHaveBeenCalled();

        errorSpy.mockRestore();
    });

    it('should handle errors during updates', () => {
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw mockError;
        });
        const errorHandler = jest.fn();

        const errorHook = renderHook(() => useLocalStorage(testKey, initialValue, { onError: errorHandler }));

        act(() => {
            errorHook.result.current[1]('will-fail');
        });

        expect(errorHandler).toHaveBeenCalledWith(mockError);
        setItemSpy.mockRestore();
    });

    it('should sync across tabs when enabled', () => {
        const syncHook = renderHook(() => useLocalStorage(testKey, initialValue, { syncTabs: true }));

        const newValue = 'synced-value';
        const storageEvent = new StorageEvent('storage', {
            key: testKey,
            newValue: JSON.stringify('synced-value'),
            oldValue: JSON.stringify(initialValue),
            storageArea: localStorage
        });

        act(() => {
            window.dispatchEvent(storageEvent);
        });

        expect(syncHook.result.current[0]).toBe(newValue);
    });

    it('should use custom serializer and deserializer', () => {
        const serializer = (value: string) => `serialized:${value}`;
        const deserializer = (value: string) => value.split(':')[1];

        const customHook = renderHook(() => useLocalStorage(testKey, initialValue, { serializer, deserializer }));

        act(() => {
            customHook.result.current[1]('custom');
        });

        expect(localStorage.getItem(testKey)).toBe('serialized:custom');
        expect(customHook.result.current[0]).toBe('custom');
    });

    it('should ignore storage events for different keys', () => {
        const syncHook = renderHook(() => useLocalStorage(testKey, initialValue, { syncTabs: true }));

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: 'different-key',
                    newValue: JSON.stringify('different-value'),
                    storageArea: localStorage
                })
            );
        });

        expect(syncHook.result.current[0]).toBe(initialValue);
    });

    it('should handle null values correctly', () => {
        const nullHook = renderHook(() => useLocalStorage<string | null>(testKey, null));

        expect(nullHook.result.current[0]).toBeNull();

        act(() => {
            nullHook.result.current[1]('not-null');
        });
        expect(nullHook.result.current[0]).toBe('not-null');
    });

    it('should handle invalid JSON during sync', () => {
        const errorHandler = jest.fn();
        const syncHook = renderHook(() =>
            useLocalStorage(testKey, initialValue, { syncTabs: true, onError: errorHandler })
        );

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: testKey,
                    newValue: 'invalid-json',
                    storageArea: localStorage
                })
            );
        });

        expect(errorHandler).toHaveBeenCalled();
        expect(syncHook.result.current[0]).toBe(initialValue);
    });

    it('should handle storage events with null newValue', () => {
        const syncHook = renderHook(() => useLocalStorage(testKey, initialValue, { syncTabs: true }));

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: testKey,
                    newValue: null,
                    storageArea: localStorage
                })
            );
        });

        expect(syncHook.result.current[0]).toBe(initialValue);
    });

    it('should cleanup event listeners on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        const syncHook = renderHook(() => useLocalStorage(testKey, initialValue, { syncTabs: true }));

        syncHook.unmount();

        expect(removeEventListenerSpy).toHaveBeenCalled();
        removeEventListenerSpy.mockRestore();
    });

    it('should handle rapid state updates', () => {
        const hook = renderHook(() => useLocalStorage(testKey, initialValue));
        act(() => {
            hook.result.current[1]('value1');
            hook.result.current[1]('value2');
            hook.result.current[1]('value3');
        });

        expect(hook.result.current[0]).toBe('value3');
        expect(localStorage.getItem(testKey)).toBe(JSON.stringify('value3'));
    });
});
