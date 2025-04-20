import { act, renderHook } from '@testing-library/react';
import { usePageLeave } from '../src/hooks/usePageLeave';

describe('usePageLeave', () => {
    let onLeave: jest.Mock;
    let onReturn: jest.Mock;
    let originalAddEventListener: typeof document.addEventListener;
    let originalRemoveEventListener: typeof document.removeEventListener;
    let mockDocumentHandlers: Map<string, EventListener[]>;

    beforeEach(() => {
        onLeave = jest.fn();
        onReturn = jest.fn();

        originalAddEventListener = document.addEventListener;
        originalRemoveEventListener = document.removeEventListener;
        mockDocumentHandlers = new Map();

        document.addEventListener = jest.fn((type: string, handler: EventListenerOrEventListenerObject) => {
            // console.log(`[Mock] addEventListener called for ${type}`); // Debugging
            if (!mockDocumentHandlers.has(type)) {
                mockDocumentHandlers.set(type, []);
            }
            mockDocumentHandlers.get(type)!.push(handler as EventListener);
            // console.log(`[Mock] Handlers for ${type}: ${mockDocumentHandlers.get(type)!.length}`); // Debugging
        });

        document.removeEventListener = jest.fn((type: string, handler: EventListenerOrEventListenerObject) => {
            // console.log(`[Mock] removeEventListener called for ${type}`); // Debugging
            const handlers = mockDocumentHandlers.get(type);
            if (handlers) {
                const index = handlers.indexOf(handler as EventListener);
                if (index > -1) {
                    handlers.splice(index, 1);
                    // console.log(`[Mock] Handlers for ${type} after removal: ${handlers.length}`); // Debugging
                }
            }
        });
    });

    afterEach(() => {
        document.addEventListener = originalAddEventListener;
        document.removeEventListener = originalRemoveEventListener;
        jest.clearAllMocks();
        mockDocumentHandlers.clear();
    });

    const simulateMouseEvent = (type: string, eventProperties: MouseEventInit = {}) => {
        const handlers = mockDocumentHandlers.get(type);
        if (handlers) {
            const mockEvent = new MouseEvent(type, eventProperties);

            [...handlers].forEach((handler) => {
                if (mockDocumentHandlers.get(type)?.includes(handler)) {
                    if (typeof handler === 'function') {
                        // console.log(`[Mock Dispatch] Calling function handler for ${type}`); // Debugging
                        handler(mockEvent);
                    } else if (handler && typeof (handler as EventListenerObject).handleEvent === 'function') {
                        // console.log(`[Mock Dispatch] Calling object handler for ${type}`); // Debugging
                        (handler as EventListenerObject).handleEvent(mockEvent);
                    } else {
                        // console.log(`[Mock Dispatch] Handler for ${type} is not a function or object with handleEvent`); // Debugging
                    }
                } else {
                    // console.log(`[Mock Dispatch] Handler for ${type} removed before dispatch`); // Debugging
                }
            });
            // console.log(`[Mock] Dispatched ${type}. Called ${handlers.length} potential handlers.`); // Debugging
        } else {
            // console.log(`[Mock] Dispatched ${type}. No handlers found.`); // Debugging
        }
    };

    it('should initialize with hasLeft as false', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ onLeave, onReturn }));
        expect(result.current.hasLeft).toBe(false);

        expect(document.addEventListener).toHaveBeenCalledTimes(3);
        expect(document.addEventListener).toHaveBeenCalledWith('mouseout', expect.any(Function));
        expect(document.addEventListener).toHaveBeenCalledWith('mouseover', expect.any(Function));

        expect(mockDocumentHandlers.get('mouseout')?.length).toBe(1);
        expect(mockDocumentHandlers.get('mouseover')?.length).toBe(1);

        expect(document.removeEventListener).not.toHaveBeenCalled();

        act(() => {
            unmount();
        });
    });

    it('should detect when mouse leaves page from top', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ onLeave, onReturn }));

        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).not.toHaveBeenCalled();
        act(() => {
            simulateMouseEvent('mouseout', { clientY: 0 });
        });

        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(1);
        expect(onReturn).not.toHaveBeenCalled();

        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled();

        act(() => {
            unmount();
        });
    });

    it('should detect when mouse returns to page', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ onLeave, onReturn }));
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).not.toHaveBeenCalled();

        act(() => {
            simulateMouseEvent('mouseout', { clientY: 0 });
        });
        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(1);
        expect(onReturn).not.toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled();

        act(() => {
            simulateMouseEvent('mouseover');
        });

        expect(result.current.hasLeft).toBe(false);
        expect(onReturn).toHaveBeenCalledTimes(1);
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled();

        act(() => {
            unmount();
        });
    });

    it('should respect threshold option', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ threshold: 50, onLeave, onReturn }));
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).not.toHaveBeenCalled();

        act(() => {
            simulateMouseEvent('mouseout', { clientY: 40 });
        });

        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(1);
        expect(onReturn).not.toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled(); // Removidos por la re-ejecución

        act(() => {
            simulateMouseEvent('mouseout', { clientY: 60 });
        });

        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(1);

        act(() => {
            simulateMouseEvent('mouseover');
        });
        expect(result.current.hasLeft).toBe(false);
        expect(onReturn).toHaveBeenCalledTimes(1);
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled();

        act(() => {
            unmount();
        });
    });

    it('should handle enable/disable', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ onLeave, onReturn }));
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).not.toHaveBeenCalled();

        act(() => {
            result.current.disable();
        });

        expect(result.current.hasLeft).toBe(false);
        expect(onLeave).not.toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled();

        act(() => {
            simulateMouseEvent('mouseout', { clientY: 0 });
        });

        expect(result.current.hasLeft).toBe(false);
        expect(onLeave).not.toHaveBeenCalled();

        act(() => {
            result.current.enable();
        });

        expect(result.current.hasLeft).toBe(false); // Sigue en false
        expect(onLeave).not.toHaveBeenCalled(); // Sigue sin llamarse
        expect(document.addEventListener).toHaveBeenCalled(); // Se añadieron de nuevo
        act(() => {
            simulateMouseEvent('mouseout', { clientY: 0 });
        });

        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(1);
        expect(document.removeEventListener).toHaveBeenCalled();

        act(() => {
            unmount();
        });
    });

    it('should cleanup event listeners on unmount', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ onLeave, onReturn }));

        act(() => {
            unmount();
        });

        expect(document.removeEventListener).toHaveBeenCalled();
        expect(mockDocumentHandlers.get('mouseout')?.length).toBe(0);
        expect(mockDocumentHandlers.get('mouseover')?.length).toBe(0);
    });

    it('should not trigger when disabled on mount', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ enabled: false, onLeave, onReturn }));

        expect(document.addEventListener).not.toHaveBeenCalled();
        expect(document.removeEventListener).not.toHaveBeenCalled();
        expect(mockDocumentHandlers.get('mouseout')).toBeUndefined();
        expect(mockDocumentHandlers.get('mouseover')).toBeUndefined();

        act(() => {
            simulateMouseEvent('mouseout', { clientY: 0 });
        });

        expect(document.addEventListener).not.toHaveBeenCalled();
        expect(document.removeEventListener).not.toHaveBeenCalled();
        expect(result.current.hasLeft).toBe(false);
        expect(onLeave).not.toHaveBeenCalled();

        act(() => {
            unmount();
        });
    });

    it('should handle rapid mouse movements (using separate acts)', () => {
        const { result, unmount } = renderHook(() => usePageLeave({ onLeave, onReturn }));
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).not.toHaveBeenCalled();

        act(() => {
            simulateMouseEvent('mouseout', { clientY: 0 });
        });
        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(1);
        expect(onReturn).not.toHaveBeenCalled();
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled(); // Removidos por la re-ejecución

        act(() => {
            simulateMouseEvent('mouseover');
        });
        expect(result.current.hasLeft).toBe(false);
        expect(onLeave).toHaveBeenCalledTimes(1); // Sigue 1
        expect(onReturn).toHaveBeenCalledTimes(1); // Ahora 1
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled(); // Removidos por la re-ejecución

        act(() => {
            simulateMouseEvent('mouseout', { clientY: 0 });
        });
        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(2); // Ahora 2
        expect(onReturn).toHaveBeenCalledTimes(1); // Sigue 1
        expect(document.addEventListener).toHaveBeenCalled();
        expect(document.removeEventListener).toHaveBeenCalled(); // Removidos por la re-ejecución
        expect(result.current.hasLeft).toBe(true);
        expect(onLeave).toHaveBeenCalledTimes(2);
        expect(onReturn).toHaveBeenCalledTimes(1);

        act(() => {
            unmount();
        });
    });
});
