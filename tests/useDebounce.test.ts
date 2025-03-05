import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '../src/hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
    it('retrasa la actualización del valor', () => {
        const { result, rerender } = renderHook(({ val }) => useDebounce(val, 500), {
            initialProps: { val: 'Hola' }
        });

        expect(result.current).toBe('Hola');

        rerender({ val: 'Mundo' });
        expect(result.current).toBe('Hola');

        act(() => {
            jest.advanceTimersByTime(500);
        });
        expect(result.current).toBe('Mundo');
    });
});
