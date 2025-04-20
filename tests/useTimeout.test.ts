import { act, renderHook } from '@testing-library/react';
import { useTimeout } from '../src/hooks/useTimeout';

describe('useTimeout', () => {
    let callback: jest.Mock;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllTimers();
        callback = jest.fn();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('should execute callback after specified delay', () => {
        const hook = renderHook(() => useTimeout({ callback, delay: 1000 }));

        expect(hook.result.current.isPending).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(hook.result.current.isPending).toBe(false);
        hook.unmount();
    });

    it('should not execute callback if delay is null', () => {
        const nullDelayHook = renderHook(() => useTimeout({ callback, delay: null }));

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(callback).not.toHaveBeenCalled();
        expect(nullDelayHook.result.current.isPending).toBe(false);
        nullDelayHook.unmount();
    });

    it('should cancel timeout', () => {
        const hook = renderHook(() => useTimeout({ callback, delay: 1000 }));

        expect(hook.result.current.isPending).toBe(true);

        act(() => {
            hook.result.current.cancel();
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(callback).not.toHaveBeenCalled();
        expect(hook.result.current.isPending).toBe(false);
        hook.unmount();
    });

    it('should reset timeout', () => {
        const hook = renderHook(() => useTimeout({ callback, delay: 1000 }));

        expect(hook.result.current.isPending).toBe(true);

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            hook.result.current.reset();
        });
        expect(hook.result.current.isPending).toBe(true);

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(hook.result.current.isPending).toBe(false);
        hook.unmount();
    });

    it('should respect autoStart option', () => {
        const nonAutoStartHook = renderHook(() => useTimeout({ callback, delay: 1000, autoStart: false }));

        expect(nonAutoStartHook.result.current.isPending).toBe(false);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(callback).not.toHaveBeenCalled();

        act(() => {
            nonAutoStartHook.result.current.start();
        });

        expect(nonAutoStartHook.result.current.isPending).toBe(true);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(nonAutoStartHook.result.current.isPending).toBe(false);
        nonAutoStartHook.unmount();
    });

    it('should cleanup on unmount', () => {
        const hook = renderHook(() => useTimeout({ callback, delay: 1000 }));

        expect(hook.result.current.isPending).toBe(true);

        hook.unmount();

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle multiple start calls', () => {
        const hook = renderHook(() => useTimeout({ callback, delay: 1000 }));

        expect(hook.result.current.isPending).toBe(true);

        act(() => {
            hook.result.current.start();
            hook.result.current.start();
        });

        expect(hook.result.current.isPending).toBe(true);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(hook.result.current.isPending).toBe(false);
        hook.unmount();
    });
});
