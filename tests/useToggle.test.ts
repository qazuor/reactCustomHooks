import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useToggle } from '../src/hooks/useToggle';

describe('useToggle', () => {
    let hook: RenderHookResult<ReturnType<typeof useToggle>, unknown>;
    let onChange: jest.Mock;

    beforeEach(() => {
        onChange = jest.fn();
        hook = renderHook(() => useToggle({ onChange }));
    });

    afterEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should initialize with default value', () => {
        expect(hook.result.current.value).toBe(false);
    });

    it('should initialize with provided value', () => {
        const customHook = renderHook(() => useToggle({ initialValue: true }));
        expect(customHook.result.current.value).toBe(true);
    });

    it('should toggle value', () => {
        act(() => {
            hook.result.current.toggle();
        });
        expect(hook.result.current.value).toBe(true);
        expect(onChange).toHaveBeenCalledWith(true);

        act(() => {
            hook.result.current.toggle();
        });
        expect(hook.result.current.value).toBe(false);
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should set value to true', () => {
        act(() => {
            hook.result.current.setTrue();
        });
        expect(hook.result.current.value).toBe(true);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should set value to false', () => {
        act(() => {
            hook.result.current.setTrue();
            hook.result.current.setFalse();
        });
        expect(hook.result.current.value).toBe(false);
        expect(onChange).toHaveBeenCalledWith(false);
    });

    it('should persist value in localStorage', () => {
        const persistHook = renderHook(() => useToggle({ persist: true, storageKey: 'test-toggle' }));

        act(() => {
            persistHook.result.current.setTrue();
        });

        expect(JSON.parse(localStorage.getItem('test-toggle')!)).toBe(true);

        const newHook = renderHook(() => useToggle({ persist: true, storageKey: 'test-toggle' }));
        expect(newHook.result.current.value).toBe(true);
    });

    it('should handle direct value updates', () => {
        act(() => {
            hook.result.current.setValue(true);
        });
        expect(hook.result.current.value).toBe(true);

        act(() => {
            hook.result.current.setValue(false);
        });
        expect(hook.result.current.value).toBe(false);
    });

    it('should cleanup on unmount', () => {
        const persistHook = renderHook(() => useToggle({ persist: true, storageKey: 'test-toggle' }));

        act(() => {
            persistHook.result.current.setTrue();
        });

        persistHook.unmount();

        expect(localStorage.getItem('test-toggle')).toBe('true');
    });
});
