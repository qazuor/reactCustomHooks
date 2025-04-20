import { act, renderHook } from '@testing-library/react';
import { useNetworkState } from '../src/hooks/useNetworkState';

interface MockConnection {
    downlink?: number;
    downlinkMax?: number;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    rtt?: number;
    saveData?: boolean;
    type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    addEventListener: jest.Mock<void, [string, EventListenerOrEventListenerObject]>;
    removeEventListener: jest.Mock<void, [string, EventListenerOrEventListenerObject]>;
    listeners: Map<string, EventListenerOrEventListenerObject[]>;
    dispatchEvent: (event: Event) => void;
}

describe('useNetworkState', () => {
    let mockConnection: MockConnection;
    let hook: ReturnType<typeof renderHook<ReturnType<typeof useNetworkState>, unknown>>;

    beforeEach(() => {
        mockConnection = {
            downlink: 10,
            downlinkMax: 20,
            effectiveType: '4g',
            rtt: 50,
            saveData: false,
            type: 'wifi',
            listeners: new Map(),
            addEventListener: jest.fn((type, handler) => {
                if (!mockConnection.listeners.has(type)) {
                    mockConnection.listeners.set(type, []);
                }
                mockConnection.listeners.get(type)!.push(handler);
            }),
            removeEventListener: jest.fn((type, handler) => {
                const handlers = mockConnection.listeners.get(type);
                if (handlers) {
                    const index = handlers.indexOf(handler);
                    if (index > -1) {
                        handlers.splice(index, 1);
                    }
                }
            }),
            dispatchEvent: jest.fn((event) => {
                const handlers = mockConnection.listeners.get(event.type);
                if (handlers) {
                    handlers.forEach((handler) => {
                        if (typeof handler === 'function') {
                            handler(event);
                        } else if (handler && typeof (handler as EventListenerObject).handleEvent === 'function') {
                            (handler as EventListenerObject).handleEvent(event);
                        }
                    });
                }
            })
        };

        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true
        });

        Object.defineProperty(navigator, 'connection', {
            configurable: true,
            value: mockConnection
        });

        hook = renderHook(() => useNetworkState());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with correct network state', () => {
        expect(hook.result.current.online).toBe(true);
        expect(hook.result.current.downlink).toBe(10);
        expect(hook.result.current.downlinkMax).toBe(20);
        expect(hook.result.current.effectiveType).toBe('4g');
        expect(hook.result.current.rtt).toBe(50);
        expect(hook.result.current.saveData).toBe(false);
        expect(hook.result.current.type).toBe('wifi');
        expect(mockConnection.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update when online status changes', () => {
        act(() => {
            Object.defineProperty(navigator, 'onLine', { value: false });
            window.dispatchEvent(new Event('offline'));
        });

        expect(hook.result.current.online).toBe(false);

        act(() => {
            Object.defineProperty(navigator, 'onLine', { value: true });
            window.dispatchEvent(new Event('online'));
        });

        expect(hook.result.current.online).toBe(true);
    });

    it('should update when connection changes', () => {
        const updatedConnectionProperties = {
            downlink: 5,
            downlinkMax: 15,
            effectiveType: '3g',
            rtt: 100,
            saveData: true,
            type: 'cellular'
        };

        act(() => {
            Object.defineProperty(navigator, 'connection', { value: updatedConnectionProperties });
            mockConnection.dispatchEvent(new Event('change'));
        });

        expect(hook.result.current.downlink).toBe(5);
        expect(hook.result.current.downlinkMax).toBe(15);
        expect(hook.result.current.effectiveType).toBe('3g');
        expect(hook.result.current.rtt).toBe(100);
        expect(hook.result.current.saveData).toBe(true);
        expect(hook.result.current.type).toBe('cellular');
    });

    it('should handle missing connection API', () => {
        Object.defineProperty(navigator, 'connection', { value: undefined });
        const noConnectionHook = renderHook(() => useNetworkState());

        expect(noConnectionHook.result.current.online).toBe(true);
        expect(noConnectionHook.result.current.downlink).toBeUndefined();
        expect(noConnectionHook.result.current.type).toBeUndefined();
    });

    it('should cleanup event listeners on unmount', () => {
        const removeWindowListenerSpy = jest.spyOn(window, 'removeEventListener');

        act(() => {
            hook.unmount();
        });

        expect(removeWindowListenerSpy).toHaveBeenCalledWith('online', hook.result.current.checkConnection); // checkConnection is updateNetworkInfo
        expect(removeWindowListenerSpy).toHaveBeenCalledWith('offline', hook.result.current.checkConnection);

        expect(mockConnection.removeEventListener).toHaveBeenCalledWith('change', hook.result.current.checkConnection);

        removeWindowListenerSpy.mockRestore();
    });

    it('should handle manual connection check', () => {
        const newConnectionProperties = {
            downlink: 15,
            type: 'ethernet'
        };

        act(() => {
            Object.defineProperty(navigator, 'connection', { value: newConnectionProperties });
            hook.result.current.checkConnection();
        });

        expect(hook.result.current.downlink).toBe(15);
        expect(hook.result.current.type).toBe('ethernet');
    });
});
