import { act, renderHook } from '@testing-library/react';
import { useQueue } from '../src/hooks/useQueue';

describe('useQueue', () => {
    it('inicia con valores y agrega/quita correctamente', () => {
        const { result } = renderHook(() => useQueue([1, 2]));
        expect(result.current.queue).toEqual([1, 2]);

        act(() => {
            result.current.add(3);
        });
        expect(result.current.queue).toEqual([1, 2, 3]);
        expect(result.current.getFirst()).toBe(1);
        expect(result.current.getLast()).toBe(3);

        act(() => {
            result.current.remove();
        });
        expect(result.current.queue).toEqual([2, 3]);
    });
});
