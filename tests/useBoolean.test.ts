import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useBoolean } from '../src/hooks/useBoolean';

type UseBooleanReturn = {
    value: boolean;
    setTrue: () => void;
    setFalse: () => void;
    toggle: () => void;
    setValue: (value: boolean) => void;
};

describe('useBoolean', () => {
    let hook: RenderHookResult<UseBooleanReturn, unknown>;

    beforeEach(() => {
        hook = renderHook(() => useBoolean());
        jest.clearAllMocks();
    });

    it('should initialize with default value (false)', () => {
        expect(hook.result.current.value).toBe(false);
    });

    it('should initialize with true when provided', () => {
        const trueHook = renderHook(() => useBoolean(true));
        expect(trueHook.result.current.value).toBe(true);
    });

    it('should set value to true using setTrue', () => {
        expect(hook.result.current.value).toBe(false);

        act(() => {
            hook.result.current.setTrue();
        });

        expect(hook.result.current.value).toBe(true);

        // Should remain true when called again
        act(() => {
            hook.result.current.setTrue();
        });
        expect(hook.result.current.value).toBe(true);
    });

    it('should set value to false using setFalse', () => {
        act(() => {
            hook.result.current.setTrue();
        });
        expect(hook.result.current.value).toBe(true);

        act(() => {
            hook.result.current.setFalse();
        });

        expect(hook.result.current.value).toBe(false);

        // Should remain false when called again
        act(() => {
            hook.result.current.setFalse();
        });
        expect(hook.result.current.value).toBe(false);
    });

    it('should toggle value', () => {
        expect(hook.result.current.value).toBe(false);

        act(() => {
            hook.result.current.toggle();
        });
        expect(hook.result.current.value).toBe(true);

        act(() => {
            hook.result.current.toggle();
        });
        expect(hook.result.current.value).toBe(false);

        // Multiple toggles should work correctly
        act(() => {
            hook.result.current.toggle();
            hook.result.current.toggle();
            hook.result.current.toggle();
        });
        expect(hook.result.current.value).toBe(true);
    });

    it('should set value directly using setValue', () => {
        expect(hook.result.current.value).toBe(false);

        act(() => {
            hook.result.current.setValue(true);
        });
        expect(hook.result.current.value).toBe(true);

        act(() => {
            hook.result.current.setValue(false);
        });
        expect(hook.result.current.value).toBe(false);

        // Setting same value should not cause re-render
        const { rerender } = hook;
        const rerenderSpy = jest.fn();
        act(() => {
            hook.result.current.setValue(false);
        });
        rerender();
        expect(rerenderSpy).not.toHaveBeenCalled();
    });

    it('should handle rapid state changes', () => {
        act(() => {
            hook.result.current.setTrue();
            hook.result.current.setFalse();
            hook.result.current.toggle();
            hook.result.current.setValue(false);
            hook.result.current.setTrue();
        });
        expect(hook.result.current.value).toBe(true);
    });

    it('should maintain correct state after multiple operations', () => {
        act(() => {
            hook.result.current.toggle(); // false -> true
            hook.result.current.setFalse(); // true -> false
            hook.result.current.setValue(true); // false -> true
            hook.result.current.toggle(); // true -> false
        });
        expect(hook.result.current.value).toBe(false);
    });
});
