import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from '../src/hooks/useMediaQuery';

type MediaQueryHandler = (event: MediaQueryListEvent) => void;
type MediaQueryListEventMock = Partial<MediaQueryListEvent> & { matches: boolean };

interface MediaQueryListMock {
    matches: boolean;
    media: string;
    addEventListener: jest.Mock<void, [string, MediaQueryHandler]>;
    removeEventListener: jest.Mock<void, [string, MediaQueryHandler]>;
    handlers: MediaQueryHandler[];
    dispatchChange: (matches: boolean) => void;
}

describe('useMediaQuery', () => {
    let originalMatchMedia: typeof window.matchMedia;
    let mediaQueryListMocks: Map<string, MediaQueryListMock>;

    beforeEach(() => {
        originalMatchMedia = window.matchMedia;
        mediaQueryListMocks = new Map();

        // Mock window.matchMedia to return a cached mock instance or a new one
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query) => {
                if (mediaQueryListMocks.has(query)) {
                    // console.log(`[Mock] Returning cached mock for query: ${query}`); // Debugging
                    return mediaQueryListMocks.get(query);
                }

                const handlers: MediaQueryHandler[] = [];
                const mediaQueryListMock: MediaQueryListMock = {
                    matches: false,
                    media: query,
                    handlers,
                    addEventListener: jest.fn((type, handler) => {
                        // console.log(`[Mock] ${query}: addEventListener called with type ${type}`); // Debugging
                        if (type === 'change' && !handlers.includes(handler)) {
                            handlers.push(handler);
                        }
                    }),
                    removeEventListener: jest.fn((type, handler) => {
                        // console.log(`[Mock] ${query}: removeEventListener called with type ${type}`); // Debugging
                        if (type === 'change') {
                            const index = handlers.indexOf(handler);
                            const splicedItems = handlers.splice(index, 1);
                            // console.log(`[Mock] ${query}: Removed ${splicedItems.length} handlers`); // Debugging
                        }
                    }),
                    dispatchChange: (matches: boolean) => {
                        // console.log(`[Mock] ${query}: dispatchChange called with matches ${matches}`); // Debugging
                        const event: MediaQueryListEventMock = { matches, media: query };
                        handlers.forEach((handler) => handler(event as MediaQueryListEvent));
                    }
                };
                // console.log(`[Mock] Creating new mock for query: ${query}`); // Debugging

                mediaQueryListMocks.set(query, mediaQueryListMock);

                return mediaQueryListMock;
            }),
            configurable: true
        });
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore the original window.matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: originalMatchMedia,
            configurable: true
        });
        jest.clearAllMocks();
        mediaQueryListMocks.clear();
    });

    it('should initialize with correct match state', () => {
        const query = '(min-width: 768px)';
        let mockList: MediaQueryListMock;

        mockList = window.matchMedia(query) as unknown as MediaQueryListMock;
        mockList.matches = true;

        const { result } = renderHook(() => useMediaQuery(query, { ssrSafe: false }));

        expect(window.matchMedia).toHaveBeenCalledTimes(3);
        expect(window.matchMedia).toHaveBeenCalledWith(query);

        expect(result.current.matches).toBe(true);

        expect(mockList.addEventListener).toHaveBeenCalledTimes(1);
        expect(mockList.removeEventListener).not.toHaveBeenCalled();
    });

    it('should update when media query changes', () => {
        const query = '(min-width: 768px)';
        let mockList: MediaQueryListMock;

        const { result } = renderHook(() => useMediaQuery(query, { ssrSafe: false }));
        mockList = mediaQueryListMocks.get(query) as unknown as MediaQueryListMock;

        // window.matchMedia was called 2 times: 1 for initial state, 1 for the main effect
        expect(window.matchMedia).toHaveBeenCalledTimes(2);
        expect(window.matchMedia).toHaveBeenCalledWith(query);
        expect(result.current.matches).toBe(false);
        expect(mockList.addEventListener).toHaveBeenCalledTimes(1);

        act(() => {
            mockList.dispatchChange(true);
        });

        expect(result.current.matches).toBe(true);

        expect(mockList.removeEventListener).not.toHaveBeenCalled();

        expect(window.matchMedia).toHaveBeenCalledTimes(2);
    });

    it('should handle SSR safely', () => {
        const originalMatchMedia = window.matchMedia;
        Object.defineProperty(window, 'matchMedia', { value: undefined });

        const ssrHook = renderHook(() =>
            useMediaQuery('(min-width: 768px)', {
                ssrSafe: true,
                ssrDefaultValue: true
            })
        );

        expect(ssrHook.result.current.matches).toBe(true);

        Object.defineProperty(window, 'matchMedia', { value: originalMatchMedia });
    });

    it('should start/stop watching when requested', () => {
        const query = '(min-width: 768px)';
        let mockList: MediaQueryListMock;

        const { result } = renderHook(() => useMediaQuery(query, { watchImmediately: false, ssrSafe: false }));
        mockList = mediaQueryListMocks.get(query) as unknown as MediaQueryListMock;

        // Initial state: watchImmediately is false, shouldListen is false.
        // matchMedia was called 1 time for the initial state
        expect(window.matchMedia).toHaveBeenCalledTimes(1);
        expect(window.matchMedia).toHaveBeenCalledWith(query);
        expect(mockList.addEventListener).not.toHaveBeenCalled();
        expect(result.current.matches).toBe(false);

        act(() => {
            result.current.startWatching();
        });

        // After starting: shouldListen is true, the main effect runs.
        // The effect calls matchMedia again (2nd call), adds listener and updates matches
        expect(window.matchMedia).toHaveBeenCalledTimes(2);
        expect(mockList.addEventListener).toHaveBeenCalledTimes(1);
        expect(result.current.matches).toBe(false);

        act(() => {
            mockList.dispatchChange(true);
        });
        expect(result.current.matches).toBe(true);

        act(() => {
            result.current.stopWatching();
        });

        expect(mockList.removeEventListener).toHaveBeenCalledTimes(1);

        act(() => {
            mockList.dispatchChange(false);
        });
        expect(result.current.matches).toBe(true);
        expect(window.matchMedia).toHaveBeenCalledTimes(2);
    });

    it('should cleanup listeners on unmount', () => {
        const query = '(min-width: 768px)';
        let mockList: MediaQueryListMock;

        // Render the hook with watchImmediately: true by default and disabling SSR
        const { result, unmount } = renderHook(() => useMediaQuery(query, { ssrSafe: false })); // Calls matchMedia (1 & 2) for initialQuery
        mockList = mediaQueryListMocks.get(query) as unknown as MediaQueryListMock;

        // Initial state: watchImmediately is true, shouldListen is true, the main effect has run.
        // matchMedia was called 2 times (initial state + effect)
        expect(window.matchMedia).toHaveBeenCalledTimes(2);
        expect(window.matchMedia).toHaveBeenCalledWith(query);
        expect(mockList.addEventListener).toHaveBeenCalledTimes(1);

        act(() => {
            unmount();
        });

        // On unmount, the main effect's cleanup MUST remove the listener exactly once
        expect(mockList.removeEventListener).toHaveBeenCalledTimes(1);
        expect(window.matchMedia).toHaveBeenCalledTimes(2);
    });

    it('should handle dynamic query changes', () => {
        const initialQuery = '(min-width: 768px)';
        const newQuery = '(min-width: 1024px)';
        let initialMockList: MediaQueryListMock;
        let newMockList: MediaQueryListMock;

        const { result, rerender } = renderHook(({ query }) => useMediaQuery(query, { ssrSafe: false }), {
            initialProps: { query: initialQuery }
        });

        initialMockList = mediaQueryListMocks.get(initialQuery) as unknown as MediaQueryListMock;

        // Initial render (flushed by renderHook):
        // matchMedia called for initialQuery (2 times: initial state + main effect)
        expect(window.matchMedia).toHaveBeenCalledTimes(2);
        expect(window.matchMedia).toHaveBeenCalledWith(initialQuery);
        expect(initialMockList.addEventListener).toHaveBeenCalledTimes(1);
        expect(initialMockList.removeEventListener).not.toHaveBeenCalled();
        expect(result.current.matches).toBe(false);

        act(() => {
            rerender({ query: newQuery });
        });

        // After rerender:
        // The previous effect's cleanup for initialQuery runs -> removes listener from initialMockList
        expect(initialMockList.removeEventListener).toHaveBeenCalledTimes(1);

        // The hook re-evaluates with the new query.
        // matchMedia called for newQuery (2 times: initial state + main effect for newQuery)
        expect(window.matchMedia).toHaveBeenCalledTimes(3);
        expect(window.matchMedia).toHaveBeenCalledWith(newQuery);

        newMockList = mediaQueryListMocks.get(newQuery) as unknown as MediaQueryListMock;

        expect(newMockList.addEventListener).toHaveBeenCalledTimes(1);

        expect(result.current.matches).toBe(false);

        act(() => {
            newMockList.dispatchChange(true);
        });
        expect(result.current.matches).toBe(true);

        act(() => {
            initialMockList.dispatchChange(false);
        });
        expect(result.current.matches).toBe(true);

        expect(window.matchMedia).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple hook instances with different queries', () => {
        const query1 = '(min-width: 768px)';
        const query2 = '(prefers-color-scheme: dark)';
        let mockList1: MediaQueryListMock;
        let mockList2: MediaQueryListMock;

        const { result: result1 } = renderHook(() => useMediaQuery(query1, { ssrSafe: false }));
        const { result: result2 } = renderHook(() => useMediaQuery(query2, { ssrSafe: false }));

        mockList1 = mediaQueryListMocks.get(query1) as unknown as MediaQueryListMock;
        mockList2 = mediaQueryListMocks.get(query2) as unknown as MediaQueryListMock;

        // Verify that matchMedia was called a total of 4 times (2 for each hook)
        expect(window.matchMedia).toHaveBeenCalledTimes(4);
        expect(window.matchMedia).toHaveBeenCalledWith(query1);
        expect(window.matchMedia).toHaveBeenCalledWith(query2);

        expect(mockList1.addEventListener).toHaveBeenCalledTimes(1);
        expect(mockList2.addEventListener).toHaveBeenCalledTimes(1);

        // The initial states are false by default of the mock
        expect(result1.current.matches).toBe(false);
        expect(result2.current.matches).toBe(false);

        act(() => {
            mockList1.dispatchChange(true);
        });
        expect(result1.current.matches).toBe(true);
        expect(result2.current.matches).toBe(false); // The second hook's state should NOT change

        act(() => {
            mockList2.dispatchChange(true);
        });
        expect(result1.current.matches).toBe(true); // The first hook's state should NOT change
        expect(result2.current.matches).toBe(true);

        expect(window.matchMedia).toHaveBeenCalledTimes(4);
    });
});
