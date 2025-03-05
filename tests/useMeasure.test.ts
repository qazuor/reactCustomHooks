import { renderHook } from '@testing-library/react';
import { useMeasure } from '../src/hooks/useMeasure';

describe('useMeasure', () => {
    it('retorna width/height inicial (0,0) y actualiza con ResizeObserver', () => {
        const observe = jest.fn();
        const disconnect = jest.fn();
        window.ResizeObserver = jest.fn().mockImplementation(() => ({ observe, disconnect }));

        const { result } = renderHook(() => useMeasure());
        expect(result.current.size).toEqual({ width: 0, height: 0 });

        const node = document.createElement('div');
        result.current.ref(node);
        expect(observe).toHaveBeenCalledWith(node);
    });
});
