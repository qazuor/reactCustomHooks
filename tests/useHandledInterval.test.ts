import { act, renderHook } from '@testing-library/react';
import { useHandledInterval } from '../src/hooks/useHandledInterval';

describe('useHandledInterval', () => {
    let callback: jest.Mock;
    const defaultDelay = 1000;

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should start automatically and execute callback at intervals', () => {
        callback = jest.fn();
        const hook = renderHook(() => useHandledInterval({ callback, delay: defaultDelay }));
        expect(hook.result.current.isRunning).toBe(true);
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(defaultDelay);
        });
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(defaultDelay * 2);
        });
        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should pause and resume interval', () => {
        callback = jest.fn();
        const hook = renderHook(() => useHandledInterval({ callback, delay: defaultDelay }));
        act(() => {
            jest.advanceTimersByTime(defaultDelay);
        });
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            hook.result.current.pause();
        });
        expect(hook.result.current.isRunning).toBe(false);

        act(() => {
            jest.advanceTimersByTime(defaultDelay * 2);
        });
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            hook.result.current.start();
        });
        expect(hook.result.current.isRunning).toBe(true);

        act(() => {
            jest.advanceTimersByTime(defaultDelay);
        });
        expect(callback).toHaveBeenCalledTimes(2);
    });

    it('should reset interval', () => {
        callback = jest.fn();
        const hook = renderHook(() => useHandledInterval({ callback, delay: defaultDelay }));
        act(() => {
            jest.advanceTimersByTime(defaultDelay / 2);
        });
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            hook.result.current.reset();
            jest.advanceTimersByTime(defaultDelay);
        });

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should respect minDelay with random intervals', () => {
        const minDelay = 500;
        const maxDelay = 1000;
        const randomHook = renderHook(() =>
            useHandledInterval({
                callback,
                delay: maxDelay,
                random: true,
                minDelay
            })
        );

        const mockRandom = jest
            .spyOn(Math, 'random')
            .mockReturnValueOnce(0) // First interval will be minDelay
            .mockReturnValueOnce(0.5) // Second interval will be (maxDelay - minDelay) / 2 + minDelay
            .mockReturnValueOnce(1); // Third interval will be maxDelay

        act(() => {
            jest.advanceTimersByTime(minDelay);
            jest.advanceTimersByTime(500); // (1000 - 500) / 2 + 500 = 750
            jest.advanceTimersByTime(maxDelay);
        });

        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('should cleanup on unmount', () => {
        callback = jest.fn();
        const hook = renderHook(() => useHandledInterval({ callback, delay: defaultDelay }));
        const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

        act(() => {
            hook.unmount();
            jest.advanceTimersByTime(defaultDelay);
        });
        expect(callback).not.toHaveBeenCalled();
    });

    it('should not start new interval if already running', () => {
        callback = jest.fn();
        const hook = renderHook(() => useHandledInterval({ callback, delay: defaultDelay }));
        const setIntervalSpy = jest.spyOn(window, 'setInterval');
        const initialCallCount = setIntervalSpy.mock.calls.length;

        act(() => {
            hook.result.current.start(); // Already running from beforeEach
            hook.result.current.start();
            hook.result.current.start();
        });

        expect(setIntervalSpy).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should respect autoStart option', () => {
        const nonAutoStartHook = renderHook(() => useHandledInterval({ callback, delay: 1000, autoStart: false }));
        expect(nonAutoStartHook.result.current.isRunning).toBe(false);
        act(() => {
            jest.advanceTimersByTime(defaultDelay * 2);
        });
        expect(callback).not.toHaveBeenCalled();
    });

    it('should update delay', () => {
        callback = jest.fn();
        const hook = renderHook(() => useHandledInterval({ callback, delay: defaultDelay }));
        act(() => {
            hook.result.current.setDelay(500);
        });

        act(() => {
            jest.advanceTimersByTime(500); // First interval with new delay
        });
        expect(callback).toHaveBeenCalledTimes(1);

        act(() => {
            jest.advanceTimersByTime(500); // Second interval with new delay
        });
        expect(callback).toHaveBeenCalledTimes(2);
    });
});
