import { act, renderHook } from '@testing-library/react';
import { usePageLeave } from '../src/hooks/usePageLeave';

describe('usePageLeave', () => {
    it('cambia a true cuando se mueve el mouse fuera de la parte superior', () => {
        const { result } = renderHook(() => usePageLeave());
        expect(result.current).toBe(false);

        act(() => {
            document.dispatchEvent(new MouseEvent('mouseout', { clientY: 0 }));
        });
        expect(result.current).toBe(true);
    });

    it('cambia a false al reingresar', () => {
        const { result } = renderHook(() => usePageLeave());

        act(() => {
            document.dispatchEvent(new MouseEvent('mouseout', { clientY: 0 }));
        });
        expect(result.current).toBe(true);

        act(() => {
            document.dispatchEvent(new MouseEvent('mouseover'));
        });
        expect(result.current).toBe(false);
    });
});
