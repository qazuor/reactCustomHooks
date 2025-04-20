import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useIdleness } from '../src/hooks/useIdleness';

describe('useIdleness', () => {
    let hook: RenderHookResult<ReturnType<typeof useIdleness>, unknown>;
    const events = ['mousemove', 'keydown', 'wheel', 'touchstart'];

    beforeEach(() => {
        jest.useFakeTimers();
        hook = renderHook(() => useIdleness({ timeout: 3000 }));
    });

    afterEach(() => {
        jest.clearAllTimers();
        events.forEach((event) => {
            window.removeEventListener(event, jest.fn());
        });
    });

    it('should start as not idle', () => {
        expect(hook.result.current.isIdle).toBe(false);
    });

    it('should become idle after timeout', () => {
        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(hook.result.current.isIdle).toBe(true);
    });

    it('should reset idle timer on user activity', () => {
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(hook.result.current.isIdle).toBe(false);

        act(() => {
            window.dispatchEvent(new Event('mousemove'));
        });

        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(hook.result.current.isIdle).toBe(false);
    });

    it('should handle start/stop monitoring', () => {
        act(() => {
            hook.result.current.stop();
        });

        act(() => {
            jest.advanceTimersByTime(4000);
        });
        expect(hook.result.current.isIdle).toBe(false);

        act(() => {
            hook.result.current.start();
        });

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(hook.result.current.isIdle).toBe(true);
    });

    it('should call onIdleChange callback', () => {
        const onIdleChange = jest.fn();
        const hookWithCallback = renderHook(() => useIdleness({ timeout: 3000, onIdleChange }));

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(onIdleChange).toHaveBeenCalledWith(true);

        act(() => {
            window.dispatchEvent(new Event('mousemove'));
        });
        expect(onIdleChange).toHaveBeenCalledWith(false);
    });
});
