import { useState } from 'react';

/**
 * useQueue
 *
 * @description A custom hook that manages a FIFO (first-in-first-out) queue.
 * It provides methods to add items, remove items, reset the queue, and retrieve the first/last element.
 *
 * @typeParam T - The type of items in the queue.
 * @param {T[]} initialValues - Initial items in the queue.
 * @returns {{
 *   queue: T[],
 *   add: (item: T) => void,
 *   remove: () => void,
 *   reset: () => void,
 *   getFirst: () => T | undefined,
 *   getLast: () => T | undefined,
 *   size: number
 * }} - An object containing:
 *  - `queue`: The current queue array.
 *  - `add(item)`: Adds an item to the end of the queue.
 *  - `remove()`: Removes the first item from the queue.
 *  - `reset()`: Clears the queue.
 *  - `getFirst()`: Retrieves the first item without removing it.
 *  - `getLast()`: Retrieves the last item without removing it.
 *  - `size`: The number of items in the queue.
 *
 * @example
 * ```ts
 * const { queue, add, remove, reset, getFirst, getLast, size } = useQueue<number>([1, 2]);
 * add(3);
 * console.log(queue); // [1, 2, 3]
 * remove(); // queue -> [2, 3]
 * ```
 */
export function useQueue<T>(initialValues: T[] = []) {
    const [queue, setQueue] = useState<T[]>(initialValues);

    const add = (item: T) => {
        setQueue((q) => [...q, item]);
    };

    const remove = () => {
        setQueue((q) => q.slice(1));
    };

    const reset = () => {
        setQueue([]);
    };

    const getFirst = () => queue[0];
    const getLast = () => queue[queue.length - 1];
    const size = queue.length;

    return { queue, add, remove, reset, getFirst, getLast, size };
}
