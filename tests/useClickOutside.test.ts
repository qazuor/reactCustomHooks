import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from '../src/hooks/useClickOutside';

describe('useClickOutside', () => {
    let handler: jest.Mock<void, [MouseEvent]>;
    let targetElement: HTMLDivElement;
    let outsideElement: HTMLDivElement;
    let body: HTMLElement;

    beforeEach(() => {
        handler = jest.fn();
        targetElement = document.createElement('div');
        outsideElement = document.createElement('div');
        body = document.body;

        body.appendChild(targetElement);
        body.appendChild(outsideElement);
    });

    afterEach(() => {
        body.removeChild(targetElement);
        body.removeChild(outsideElement);
        jest.clearAllMocks();
    });

    it('should handle clicks outside the target element', () => {
        const { result } = renderHook(() => {
            const ref = useRef(targetElement);
            useClickOutside(ref, handler);
            return { ref };
        });

        act(() => {
            outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        });

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not trigger when clicking inside the target element', () => {
        const { result } = renderHook(() => {
            const ref = useRef(targetElement);
            useClickOutside(ref, handler);
            return { ref };
        });

        act(() => {
            targetElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        });
        expect(handler).not.toHaveBeenCalled();
    });

    it('should support different event types', () => {
        const mouseupHandler = jest.fn();
        const clickHandler = jest.fn();
        const touchHandler = jest.fn();

        renderHook(() => {
            const ref = useRef(targetElement);
            useClickOutside(ref, mouseupHandler, { eventType: 'mouseup' });
            return { ref };
        });

        renderHook(() => {
            const ref = useRef(targetElement);
            useClickOutside(ref, clickHandler, { eventType: 'click' });
            return { ref };
        });

        renderHook(() => {
            const ref = useRef(targetElement);
            useClickOutside(ref, touchHandler, { eventType: 'mousedown' });
            return { ref };
        });

        act(() => {
            outsideElement.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        });
        expect(mouseupHandler).toHaveBeenCalledTimes(1);
        expect(clickHandler).not.toHaveBeenCalled();

        act(() => {
            outsideElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
        expect(clickHandler).toHaveBeenCalledTimes(1);

        act(() => {
            outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        });
        expect(touchHandler).toHaveBeenCalledTimes(1);
    });

    it('should respect enabled option', () => {
        const { result, rerender } = renderHook(
            ({ enabled }) => {
                const ref = useRef(targetElement);
                useClickOutside(ref, handler, { enabled });
                return { ref };
            },
            { initialProps: { enabled: false } }
        );

        act(() => {
            outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        });
        expect(handler).not.toHaveBeenCalled();

        rerender({ enabled: true });

        act(() => {
            outsideElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        });
        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should cleanup event listeners on unmount', () => {
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        const { unmount } = renderHook(() => {
            const ref = useRef(targetElement);
            useClickOutside(ref, handler);
            return { ref };
        });

        unmount();
        expect(removeEventListenerSpy).toHaveBeenCalled();
    });
});
