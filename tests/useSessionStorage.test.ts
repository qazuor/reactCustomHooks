import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useSessionStorage } from '../src/hooks/useSessionStorage';

describe('useSessionStorage', () => {
    let hook: RenderHookResult<readonly [string, (value: string | ((val: string) => string)) => void], unknown>;
    const testKey = 'test-key';
    const initialValue = 'initial';

    beforeEach(() => {
        sessionStorage.clear();
        hook = renderHook(() => useSessionStorage(testKey, initialValue));
    });

    afterEach(() => {
        sessionStorage.clear();
        jest.restoreAllMocks();
    });

    it('should initialize with default value when no stored value exists', () => {
        expect(hook.result.current[0]).toBe(initialValue);
        expect(sessionStorage.getItem(testKey)).toBeNull();
    });

    it('should initialize with stored value when it exists', () => {
        const storedValue = 'stored';
        sessionStorage.setItem(testKey, JSON.stringify(storedValue));

        const storedHook = renderHook(() => useSessionStorage(testKey, initialValue));
        expect(storedHook.result.current[0]).toBe(storedValue);
        expect(sessionStorage.getItem(testKey)).toBe(JSON.stringify(storedValue));
    });

    it('should update value and sessionStorage when setValue is called', () => {
        const newValue = 'updated';

        act(() => {
            hook.result.current[1](newValue);
        });

        expect(hook.result.current[0]).toBe(newValue);
        expect(sessionStorage.getItem(testKey)).toBe(JSON.stringify(newValue));
    });

    it('should handle function updates correctly', () => {
        act(() => {
            hook.result.current[1]((prev) => `${prev}-updated`);
        });

        expect(hook.result.current[0]).toBe('initial-updated');
        expect(sessionStorage.getItem(testKey)).toBe(JSON.stringify('initial-updated'));
    });

    it('should handle errors during initialization', () => {
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        sessionStorage.setItem(testKey, 'invalid json');

        const errorHook = renderHook(() => useSessionStorage(testKey, initialValue));
        expect(errorHook.result.current[0]).toBe(initialValue);
        expect(errorSpy).toHaveBeenCalled();
        errorSpy.mockRestore();
    });

    it('should handle errors during updates', () => {
        const mockError = new Error('Storage error');
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw mockError;
        });
        const errorHandler = jest.fn();

        const errorHook = renderHook(() => useSessionStorage(testKey, initialValue, { onError: errorHandler }));

        act(() => {
            errorHook.result.current[1]('will-fail');
        });

        expect(errorHook.result.current[0]).toBe(initialValue);
        expect(errorHandler).toHaveBeenCalledWith(mockError);
        setItemSpy.mockRestore();
    });

    it('should sync across tabs when enabled', () => {
        const syncHook = renderHook(() => useSessionStorage(testKey, initialValue, { syncTabs: true }));

        const storageEvent = new StorageEvent('storage', {
            key: testKey,
            newValue: JSON.stringify('synced-value'),
            storageArea: sessionStorage
        });

        act(() => {
            window.dispatchEvent(storageEvent);
        });

        expect(syncHook.result.current[0]).toBe('synced-value');
    });

    it('should use custom serializer and deserializer', () => {
        interface TestItem {
            id: number;
        }
        const serializer = (value: string) => `serialized:${value}`;
        const deserializer = (value: string) => value.split(':')[1];

        const customHook = renderHook(() => useSessionStorage(testKey, initialValue, { serializer, deserializer }));

        act(() => {
            customHook.result.current[1]('custom');
        });

        expect(sessionStorage.getItem(testKey)).toBe('serialized:custom');
        expect(customHook.result.current[0]).toBe('custom');
    });

    it('should cleanup event listeners on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
        const syncHook = renderHook(() => useSessionStorage(testKey, initialValue, { syncTabs: true }));

        syncHook.unmount();
        expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
        removeEventListenerSpy.mockRestore();
    });
});
