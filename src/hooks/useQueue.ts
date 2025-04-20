import { useCallback, useMemo, useState } from 'react';

interface QueueOperations<T> {
    /** Add an item to the end of the queue */
    enqueue: (item: T) => void;
    /** Remove and return the first item from the queue */
    dequeue: () => T | undefined;
    /** Clear all items from the queue */
    clear: () => void;
    /** Get the first item without removing it */
    peek: () => T | undefined;
    /** Get the last item without removing it */
    peekLast: () => T | undefined;
    /** Check if the queue is empty */
    isEmpty: boolean;
    /** Get the current size of the queue */
    size: number;
    /** Get all items as an array */
    toArray: () => T[];
    /** Check if an item exists in the queue */
    contains: (item: T) => boolean;
}

interface UseQueueOptions<T> {
    /** Maximum size of the queue. Default is unlimited. */
    maxSize?: number;
    /** Callback when queue is full */
    onFull?: () => void;
    /** Callback when queue becomes empty */
    onEmpty?: () => void;
    /** Custom equality function for contains() */
    equalityFn?: (a: T, b: T) => boolean;
}

/**
 * useQueue
 *
 * @description A custom hook that manages a FIFO (first-in-first-out) queue.
 * It provides methods to add items, remove items, reset the queue, and retrieve the first/last element.
 *
 * @param {T[]} initialValues - Initial items in the queue.
 * @param {UseQueueOptions<T>} [options] - Optional configuration.
 * @typeParam T - The type of items in the queue.
 * @returns {QueueOperations<T>} - An object containing queue operations and state.
 *
 * @example
 * ```ts
 * const { enqueue, dequeue, size, peek, toArray } = useQueue<number>([1, 2]);
 * enqueue(3);
 * console.log(toArray()); // [1, 2, 3]
 * const first = dequeue(); // first is 1, queue becomes [2, 3]
 * console.log(peek()); // 2
 * ```
 */
export function useQueue<T>(initialValues: T[] = [], options: UseQueueOptions<T> = {}): QueueOperations<T> {
    const { maxSize, onFull, onEmpty, equalityFn = (a, b) => a === b } = options;
    const [queue, setQueue] = useState<T[]>(initialValues);

    const enqueue = useCallback(
        (item: T) => {
            setQueue((q) => {
                if (maxSize && q.length >= maxSize) {
                    onFull?.();
                    return q;
                }
                return [...q, item];
            });
        },
        [maxSize, onFull]
    );

    const dequeue = useCallback(() => {
        // Get the element to return BEFORE scheduling the state update
        if (queue.length === 0) {
            return undefined;
        }
        const itemToDequeue = queue[0];

        // Schedule the state update to remove the first element
        setQueue((currentQueue) => {
            if (currentQueue.length === 0) return currentQueue;
            const newQueue = currentQueue.slice(1);
            if (onEmpty && currentQueue.length > 0 && newQueue.length === 0) {
                onEmpty();
            }
            return newQueue;
        });

        // Return the element we got BEFORE scheduling the state update
        return itemToDequeue;
    }, [queue, onEmpty]);

    const clear = useCallback(() => {
        if (onEmpty && queue.length > 0) {
            onEmpty();
        }
        setQueue([]);
    }, [onEmpty, queue]);

    const peek = useCallback(() => queue[0], [queue]);
    const peekLast = useCallback(() => queue[queue.length - 1], [queue]);
    const contains = useCallback((item: T) => queue.some((i) => equalityFn(i, item)), [queue, equalityFn]);

    const state = useMemo(
        () => ({
            isEmpty: queue.length === 0,
            size: queue.length,
            toArray: () => [...queue]
        }),
        [queue]
    );

    return {
        enqueue,
        dequeue,
        clear,
        peek,
        peekLast,
        contains,
        ...state
    };
}
