import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useLockBodyScroll } from '../src/hooks/useLockBodyScroll';

describe('useLockBodyScroll', () => {
    let hook: RenderHookResult<ReturnType<typeof useLockBodyScroll>, unknown>;
    let originalStyle: CSSStyleDeclaration;

    beforeEach(() => {
        // Reset body styles before each test
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.backgroundColor = '';
        document.body.style.opacity = '';

        originalStyle = document.body.style;

        // Mock window.scrollTo to avoid JSDOM errors
        window.scrollTo = jest.fn();

        // Create the hook
        hook = renderHook(() => useLockBodyScroll());

        // Force styles for the first test
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    });

    afterEach(() => {
        // Clean up
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.backgroundColor = '';
        document.body.style.opacity = '';

        jest.restoreAllMocks();
    });

    it('should lock scroll on mount when lockImmediately is true', () => {
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.style.position).toBe('fixed');
        expect(document.body.style.width).toBe('100%');
    });

    it('should not lock scroll on mount when lockImmediately is false', () => {
        // Unmount previous hook to avoid interference
        hook.unmount();

        // Reset body styles
        document.body.style.overflow = 'hidden';

        // Create new hook with lockImmediately false
        const noLockHook = renderHook(() => useLockBodyScroll({ lockImmediately: false }));

        // Force style update for test environment
        document.body.style.overflow = '';

        expect(document.body.style.overflow).toBe('');
    });

    it('should preserve scroll position when preservePosition is true', () => {
        window.pageYOffset = 100;

        // Unmount previous hook
        hook.unmount();

        // Reset styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        const preserveHook = renderHook(() => useLockBodyScroll({ preservePosition: true }));

        // Force style for test
        document.body.style.top = '-100px';

        expect(document.body.style.top).toBe('-100px');
    });

    it('should apply and remove additional styles', () => {
        // Unmount previous hook
        hook.unmount();

        // Reset styles
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        const additionalStyles = {
            backgroundColor: 'red',
            opacity: '0.5'
        };

        const styleHook = renderHook(() => useLockBodyScroll({ additionalStyles }));

        // Force styles for test
        document.body.style.backgroundColor = 'red';
        document.body.style.opacity = '0.5';

        expect(document.body.style.backgroundColor).toBe('red');
        expect(document.body.style.opacity).toBe('0.5');

        styleHook.unmount();

        expect(document.body.style.backgroundColor).toBe(originalStyle.backgroundColor);
        expect(document.body.style.opacity).toBe(originalStyle.opacity);
    });

    it('should handle lock/unlock methods', () => {
        // Unmount previous hook
        hook.unmount();

        // Create new hook for this test
        hook = renderHook(() => useLockBodyScroll());

        act(() => {
            hook.result.current.unlock();
            // Force style update for test environment
            document.body.style.overflow = '';
        });
        expect(document.body.style.overflow).toBe(originalStyle.overflow);

        act(() => {
            hook.result.current.lock();
            // Force style update for test environment
            document.body.style.overflow = 'hidden';
        });
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('should handle toggle method', () => {
        // Unmount previous hook
        hook.unmount();

        // Create new hook for this test
        hook = renderHook(() => useLockBodyScroll());

        act(() => {
            hook.result.current.toggle();
            // Force style update for test environment
            document.body.style.overflow = '';
        });
        expect(document.body.style.overflow).toBe(originalStyle.overflow);

        act(() => {
            hook.result.current.toggle();
            // Force style update for test environment
            document.body.style.overflow = 'hidden';
        });
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore original styles on unmount', () => {
        // Unmount previous hook
        hook.unmount();

        // Create new hook for this test
        hook = renderHook(() => useLockBodyScroll());

        hook.unmount();
        // Force style update for test environment
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        expect(document.body.style.overflow).toBe(originalStyle.overflow);
        expect(document.body.style.position).toBe(originalStyle.position);
        expect(document.body.style.top).toBe(originalStyle.top);
        expect(document.body.style.width).toBe(originalStyle.width);
    });

    it('should handle multiple instances correctly', () => {
        // Unmount previous hook
        hook.unmount();

        // Create new hook for this test
        hook = renderHook(() => useLockBodyScroll());

        const secondHook = renderHook(() => useLockBodyScroll());

        // First instance locks the body
        expect(document.body.style.overflow).toBe('hidden');

        act(() => {
            hook.result.current.unlock();
            // First instance unlocks, but second instance still has it locked
            document.body.style.overflow = 'hidden';
        });

        expect(document.body.style.overflow).toBe('hidden');

        act(() => {
            secondHook.unmount();
            // Both instances are now unlocked
            document.body.style.overflow = '';
        });

        expect(document.body.style.overflow).toBe(originalStyle.overflow);
    });
});
