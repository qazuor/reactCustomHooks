import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useQueue } from '../src/hooks/useQueue';

describe('useQueue', () => {
    let hook: RenderHookResult<ReturnType<typeof useQueue<number>>, unknown>;
    let onFull: jest.Mock;
    let onEmpty: jest.Mock;

    beforeEach(() => {
        onFull = jest.fn();
        onEmpty = jest.fn();
        hook = renderHook(() => useQueue<number>([], { onFull, onEmpty }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with empty queue', () => {
        expect(hook.result.current.isEmpty).toBe(true);
        expect(hook.result.current.size).toBe(0);
        expect(hook.result.current.peek()).toBeUndefined();
        expect(hook.result.current.peekLast()).toBeUndefined();
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should initialize with initial values', () => {
        const initialHook = renderHook(() => useQueue([1, 2, 3], { onFull, onEmpty }));
        expect(initialHook.result.current.size).toBe(3);
        expect(initialHook.result.current.peek()).toBe(1);
        expect(initialHook.result.current.peekLast()).toBe(3);
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should enqueue and dequeue items correctly', () => {
        act(() => {
            hook.result.current.enqueue(1);
            hook.result.current.enqueue(2);
        });

        expect(hook.result.current.size).toBe(2);
        expect(hook.result.current.peek()).toBe(1);
        expect(onEmpty).not.toHaveBeenCalled();

        act(() => {
            const item = hook.result.current.dequeue();
            expect(item).toBe(1);
        });

        expect(hook.result.current.size).toBe(1);
        expect(hook.result.current.peek()).toBe(2);
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should respect maxSize option', () => {
        const maxSizeHook = renderHook(() => useQueue<number>([], { maxSize: 2, onFull, onEmpty }));

        act(() => {
            maxSizeHook.result.current.enqueue(1);
            maxSizeHook.result.current.enqueue(2);
            maxSizeHook.result.current.enqueue(3);
        });

        expect(maxSizeHook.result.current.size).toBe(2);
        expect(onFull).toHaveBeenCalledTimes(1);
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should call onEmpty when queue becomes empty', () => {
        const initialHook = renderHook(() => useQueue([1], { onFull, onEmpty }));
        expect(onEmpty).not.toHaveBeenCalled();

        act(() => {
            initialHook.result.current.dequeue();
        });

        expect(initialHook.result.current.isEmpty).toBe(true);
        expect(onEmpty).toHaveBeenCalledTimes(1);
    });

    it('should clear queue', () => {
        const initialHook = renderHook(() => useQueue([1, 2], { onFull, onEmpty }));
        expect(onEmpty).not.toHaveBeenCalled();

        act(() => {
            initialHook.result.current.clear();
        });

        expect(initialHook.result.current.isEmpty).toBe(true);
        expect(initialHook.result.current.size).toBe(0);
        expect(onEmpty).toHaveBeenCalledTimes(1);
    });

    it('should check if queue contains item', () => {
        act(() => {
            hook.result.current.enqueue(1);
            hook.result.current.enqueue(2);
        });

        expect(hook.result.current.contains(1)).toBe(true);
        expect(hook.result.current.contains(3)).toBe(false);
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should use custom equality function', () => {
        interface TestItem {
            id: number;
        }
        const equalityFn = (a: TestItem, b: TestItem) => a.id === b.id;

        const objectHook = renderHook(() => useQueue<TestItem>([], { equalityFn, onFull, onEmpty }));

        act(() => {
            objectHook.result.current.enqueue({ id: 1 });
        });

        expect(objectHook.result.current.contains({ id: 1 })).toBe(true);
        expect(objectHook.result.current.contains({ id: 2 })).toBe(false);
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should convert queue to array', () => {
        act(() => {
            hook.result.current.enqueue(1);
            hook.result.current.enqueue(2);
        });

        expect(hook.result.current.toArray()).toEqual([1, 2]);
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should handle dequeue on empty queue', () => {
        const item = hook.result.current.dequeue();
        expect(item).toBeUndefined();
        expect(hook.result.current.isEmpty).toBe(true);
        expect(onEmpty).not.toHaveBeenCalled();
    });

    it('should maintain FIFO order', () => {
        act(() => {
            hook.result.current.enqueue(1);
            hook.result.current.enqueue(2);
            hook.result.current.enqueue(3);
        });
        expect(onEmpty).not.toHaveBeenCalled();

        act(() => {
            expect(hook.result.current.dequeue()).toBe(1);
        });
        expect(hook.result.current.size).toBe(2);
        expect(onEmpty).not.toHaveBeenCalled();

        act(() => {
            expect(hook.result.current.dequeue()).toBe(2);
        });
        expect(hook.result.current.size).toBe(1);
        expect(onEmpty).not.toHaveBeenCalled();

        act(() => {
            expect(hook.result.current.dequeue()).toBe(3);
        });
        expect(hook.result.current.size).toBe(0);
        expect(onEmpty).toHaveBeenCalledTimes(1);

        const itemAfterEmpty = hook.result.current.dequeue();
        expect(itemAfterEmpty).toBeUndefined();
        expect(hook.result.current.isEmpty).toBe(true);
        expect(onEmpty).toHaveBeenCalledTimes(1);
    });
});
