import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useDebounce } from '../src/hooks/useDebounce';

describe('useDebounce', () => {
    let hook: RenderHookResult<string, { val: string }>;

    beforeEach(() => {
        jest.useFakeTimers();
        hook = renderHook(({ val }) => useDebounce(val, 500), {
            initialProps: { val: 'initial' }
        });
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('should return initial value immediately', () => {
        expect(hook.result.current).toBe('initial');
    });

    it('should debounce value updates', () => {
        hook.rerender({ val: 'changed' });
        expect(hook.result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(250);
        });
        expect(hook.result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(250);
        });
        expect(hook.result.current).toBe('changed');
    });

    it('should handle multiple rapid updates', () => {
        hook.rerender({ val: 'change1' });
        hook.rerender({ val: 'change2' });
        hook.rerender({ val: 'change3' });

        expect(hook.result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(hook.result.current).toBe('change3');
    });

    it('should update immediately when immediate flag is true', () => {
        const immediateHook = renderHook(({ val }) => useDebounce(val, 500, true), {
            initialProps: { val: 'initial' }
        });

        expect(immediateHook.result.current).toBe('initial');

        immediateHook.rerender({ val: 'changed' });
        expect(immediateHook.result.current).toBe('changed');
    });

    it('should clear timeout on unmount', () => {
        const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

        hook.rerender({ val: 'changed' });
        hook.unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});
