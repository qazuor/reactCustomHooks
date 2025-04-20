import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useMeasure } from '../src/hooks/useMeasure';

describe('useMeasure', () => {
    let hook: RenderHookResult<ReturnType<typeof useMeasure>, unknown>;
    let resizeObserverCallback: (entries: ResizeObserverEntry[]) => void;
    let observeMock: jest.Mock;
    let unobserveMock: jest.Mock;
    let disconnectMock: jest.Mock;

    beforeEach(() => {
        // Create mock functions
        observeMock = jest.fn();
        unobserveMock = jest.fn();
        disconnectMock = jest.fn();

        // Create ResizeObserver mock class
        class MockResizeObserver {
            constructor(callback: (entries: ResizeObserverEntry[]) => void) {
                resizeObserverCallback = callback;
            }
            observe = observeMock;
            unobserve = unobserveMock;
            disconnect = disconnectMock;
        }

        // Assign the mock to window
        window.ResizeObserver = MockResizeObserver as any;

        hook = renderHook(() => useMeasure());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with zero dimensions', () => {
        expect(hook.result.current.size).toEqual({ width: 0, height: 0 });
    });

    it('should observe element when ref is set', () => {
        const element = document.createElement('div');
        act(() => {
            hook.result.current.ref(element);
        });
        expect(observeMock).toHaveBeenCalledWith(element);
    });

    it('should update dimensions when element resizes', () => {
        const element = document.createElement('div');
        act(() => {
            hook.result.current.ref(element);
            resizeObserverCallback([
                {
                    contentRect: { width: 100, height: 50 },
                    target: element
                } as unknown as ResizeObserverEntry
            ]);
        });

        expect(hook.result.current.size).toEqual({ width: 100, height: 50 });
    });

    it('should handle null ref', () => {
        act(() => {
            hook.result.current.ref(null);
        });
        expect(observeMock).not.toHaveBeenCalled();
    });

    it('should disconnect observer when unmounting', () => {
        const element = document.createElement('div');
        act(() => {
            hook.result.current.ref(element);
        });

        hook.unmount();
        expect(disconnectMock).toHaveBeenCalled();
    });

    it('should handle multiple resize events', () => {
        const element = document.createElement('div');
        act(() => {
            hook.result.current.ref(element);
            resizeObserverCallback([
                {
                    contentRect: { width: 100, height: 50 },
                    target: element
                } as unknown as ResizeObserverEntry
            ]);
        });

        act(() => {
            resizeObserverCallback([
                {
                    contentRect: { width: 200, height: 100 },
                    target: element
                } as unknown as ResizeObserverEntry
            ]);
        });

        expect(hook.result.current.size).toEqual({ width: 200, height: 100 });
    });

    it('should handle new element references', () => {
        const element1 = document.createElement('div');
        const element2 = document.createElement('div');

        act(() => {
            hook.result.current.ref(element1);
        });
        expect(observeMock).toHaveBeenCalledWith(element1);

        act(() => {
            hook.result.current.ref(element2);
        });
        expect(observeMock).toHaveBeenCalledWith(element2);
    });
});
