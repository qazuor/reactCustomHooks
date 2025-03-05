import { act, renderHook } from '@testing-library/react';
import { useWindowWidth } from '../src/hooks/useWindowWidth';

describe('useWindowWidth hook', () => {
    const originalInnerWidth = window.innerWidth;

    afterEach(() => {
        window.innerWidth = originalInnerWidth;
    });

    it('debe retornar el ancho inicial correcto', () => {
        window.innerWidth = 1024;

        const { result } = renderHook(() => useWindowWidth());
        expect(result.current).toBe(1024);
    });

    it('debe actualizar el ancho tras un evento de resize', () => {
        window.innerWidth = 800;
        const { result } = renderHook(() => useWindowWidth());
        expect(result.current).toBe(800);

        act(() => {
            window.innerWidth = 1200;
            window.dispatchEvent(new Event('resize'));
        });

        expect(result.current).toBe(1200);
    });
});
