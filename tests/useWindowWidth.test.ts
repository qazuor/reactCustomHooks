import { act, renderHook } from '@testing-library/react';
import { useWindowWidth } from '../src/hooks/useWindowWidth';

describe('useWindowWidth', () => {
    let onChange: jest.Mock;
    let initialInnerWidth: number;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllTimers();
        jest.clearAllMocks();
        onChange = jest.fn();

        initialInnerWidth = window.innerWidth;
        Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.clearAllMocks();

        Object.defineProperty(window, 'innerWidth', { value: initialInnerWidth, configurable: true });
    });

    it('should initialize with current window width', () => {
        const hook = renderHook(() => useWindowWidth({ onChange }));
        expect(hook.result.current.width).toBe(window.innerWidth);
        expect(onChange).not.toHaveBeenCalled();
        hook.unmount();
    });

    it('should update width on resize with debounce', () => {
        const hook = renderHook(() => useWindowWidth({ onChange }));

        expect(hook.result.current.width).toBe(1200);

        const newWidth = 1024;

        act(() => {
            window.innerWidth = newWidth;
            window.dispatchEvent(new Event('resize'));
        });

        expect(hook.result.current.width).toBe(1200);
        expect(onChange).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(250);
        });

        expect(hook.result.current.width).toBe(newWidth);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(newWidth);

        hook.unmount();
    });

    it('should handle custom debounce delay', () => {
        const customDelayHook = renderHook(() => useWindowWidth({ debounceDelay: 500, onChange }));

        expect(customDelayHook.result.current.width).toBe(1200);

        act(() => {
            window.innerWidth = 800;
            window.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(250);
        });

        expect(customDelayHook.result.current.width).toBe(1200);
        expect(onChange).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(250);
        });

        expect(customDelayHook.result.current.width).toBe(800);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(800);

        customDelayHook.unmount();
    });

    it('should handle start/stop monitoring', () => {
        const hook = renderHook(() => useWindowWidth({ onChange }));

        expect(hook.result.current.width).toBe(1200);

        act(() => {
            hook.result.current.stop();
        });

        expect(hook.result.current.width).toBe(1200);

        window.innerWidth = 1400;
        act(() => {
            window.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(250);
        });

        expect(hook.result.current.width).toBe(1200);
        expect(onChange).not.toHaveBeenCalled();

        act(() => {
            hook.result.current.start();
        });

        expect(hook.result.current.width).toBe(1200);

        act(() => {
            window.innerWidth = 1300;
            window.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(250);
        });

        expect(hook.result.current.width).toBe(1300);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(1300);

        hook.unmount();
    });

    it('should respect startImmediately option', () => {
        const nonAutoStartHook = renderHook(() =>
            useWindowWidth({
                startImmediately: false,
                onChange
            })
        );

        expect(nonAutoStartHook.result.current.width).toBe(1200);
        expect(onChange).not.toHaveBeenCalled();

        Object.defineProperty(window, 'innerWidth', { value: 1500, configurable: true });

        act(() => {
            document.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(250);
        });

        expect(nonAutoStartHook.result.current.width).toBe(1200);
        expect(onChange).not.toHaveBeenCalled();

        nonAutoStartHook.unmount();
    });

    it('should cleanup event listeners on unmount', () => {
        const hook = renderHook(() => useWindowWidth({ onChange }));

        const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

        hook.unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));

        removeEventListenerSpy.mockRestore();
    });

    it('should handle rapid resize events', () => {
        const hook = renderHook(() => useWindowWidth({ onChange }));

        act(() => {
            window.innerWidth = 800;
            window.dispatchEvent(new Event('resize'));
            window.innerWidth = 900;
            window.dispatchEvent(new Event('resize'));
            window.innerWidth = 1000;
            window.dispatchEvent(new Event('resize'));
            jest.advanceTimersByTime(250);
        });

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(1000);
        expect(hook.result.current.width).toBe(1000);

        hook.unmount();
    });
});
