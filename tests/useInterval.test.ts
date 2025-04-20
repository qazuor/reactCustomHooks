import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useInterval } from '../src/hooks/useInterval';

describe('useInterval', () => {
    let callback: jest.Mock;
    let hook: RenderHookResult<ReturnType<typeof useInterval>, unknown>;

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
    });

    it('should execute callback at regular intervals', () => {
        callback = jest.fn();
        const hook = renderHook(() => useInterval({ callback, delay: 1000 }));
        expect(hook.result.current.isRunning).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should pause and resume interval', () => {
        callback = jest.fn();
        const hook = renderHook(() => useInterval({ callback, delay: 1000 }));
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            hook.result.current.pause();
        });
        expect(hook.result.current.isRunning).toBe(false);

        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            hook.result.current.start();
        });
        expect(hook.result.current.isRunning).toBe(true);

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should restart interval', () => {
        callback = jest.fn();
        const hook = renderHook(() => useInterval({ callback, delay: 1000 }));
        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            hook.result.current.restart();
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should respect autoStart option', () => {
        const nonAutoStartHook = renderHook(() => useInterval({ callback, delay: 1000, autoStart: false }));

        expect(nonAutoStartHook.result.current.isRunning).toBe(false);

        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(callback).not.toHaveBeenCalled();
    });

    it('should pause if delay is null', () => {
        const nullDelayHook = renderHook(() => useInterval({ callback, delay: null }));

        expect(nullDelayHook.result.current.isRunning).toBe(false);

        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(callback).not.toBeCalled();
    });

    it('should run immediately when runImmediately is true', () => {
        const immediateHook = renderHook(() => useInterval({ callback, delay: 1000, runImmediately: true }));

        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should cleanup on unmount', () => {
        callback = jest.fn();
        const hook = renderHook(() => useInterval({ callback, delay: 1000 }));
        act(() => {
            jest.advanceTimersByTime(500);
        });

        hook.unmount();

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(callback).not.toHaveBeenCalled();
    });
});
