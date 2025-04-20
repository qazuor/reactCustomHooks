import { act, renderHook } from '@testing-library/react';
import { useVisibilityChange } from '../src/hooks/useVisibilityChange';

describe('useVisibilityChange', () => {
    let onVisible: jest.Mock;
    let onHidden: jest.Mock;

    beforeEach(() => {
        onVisible = jest.fn();
        onHidden = jest.fn();
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    });

    afterEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    });

    it('should initialize with correct visibility state', () => {
        const hook = renderHook(() => useVisibilityChange({ onVisible, onHidden }));
        expect(hook.result.current.isVisible).toBe(!document.hidden);
        expect(onVisible).not.toHaveBeenCalled();
        expect(onHidden).not.toHaveBeenCalled();
        hook.unmount();
    });

    it('should handle visibility changes', () => {
        const hook = renderHook(() => useVisibilityChange({ onVisible, onHidden }));

        expect(hook.result.current.isVisible).toBe(true);
        expect(onVisible).not.toHaveBeenCalled();
        expect(onHidden).not.toHaveBeenCalled();

        act(() => {
            Object.defineProperty(document, 'hidden', { value: true, configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(hook.result.current.isVisible).toBe(false);
        expect(onHidden).toHaveBeenCalledTimes(1);
        expect(onVisible).not.toHaveBeenCalled();

        act(() => {
            Object.defineProperty(document, 'hidden', { value: false, configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(hook.result.current.isVisible).toBe(true);
        expect(onVisible).toHaveBeenCalledTimes(1);
        expect(onHidden).toHaveBeenCalledTimes(1);

        hook.unmount();
    });

    it('should handle start/stop monitoring', () => {
        const hook = renderHook(() => useVisibilityChange({ onVisible, onHidden }));

        expect(hook.result.current.isVisible).toBe(true);

        act(() => {
            hook.result.current.stop();
        });

        act(() => {
            Object.defineProperty(document, 'hidden', { value: true, configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(onHidden).not.toHaveBeenCalled();
        expect(onVisible).not.toHaveBeenCalled();
        expect(hook.result.current.isVisible).toBe(true);

        act(() => {
            hook.result.current.start();
        });

        act(() => {
            Object.defineProperty(document, 'hidden', { value: true, configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(hook.result.current.isVisible).toBe(false);
        expect(onHidden).toHaveBeenCalledTimes(1);

        hook.unmount();
    });

    it('should respect startImmediately option', () => {
        const nonAutoStartHook = renderHook(() =>
            useVisibilityChange({
                onVisible,
                onHidden,
                startImmediately: false
            })
        );

        expect(nonAutoStartHook.result.current.isVisible).toBe(true);

        act(() => {
            Object.defineProperty(document, 'hidden', { value: true, configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(onVisible).not.toHaveBeenCalled();
        expect(onHidden).not.toHaveBeenCalled();
        expect(nonAutoStartHook.result.current.isVisible).toBe(true);

        act(() => {
            nonAutoStartHook.result.current.start();
        });

        expect(nonAutoStartHook.result.current.isVisible).toBe(true);

        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(nonAutoStartHook.result.current.isVisible).toBe(false);
        expect(onHidden).toHaveBeenCalledTimes(1);

        nonAutoStartHook.unmount();
    });

    it('should cleanup event listeners on unmount', () => {
        const hook = renderHook(() => useVisibilityChange({ onVisible, onHidden }));

        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        hook.unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

        removeEventListenerSpy.mockRestore();
    });
});
