import { act, renderHook } from '@testing-library/react';
import { useVisibilityChange } from '../src/hooks/useVisibilityChange';

describe('useVisibilityChange', () => {
    it('cambia el estado cuando el documento se oculta/muestra', () => {
        const { result } = renderHook(() => useVisibilityChange());
        expect(result.current).toBe(true); // document.hidden = false por defecto

        act(() => {
            Object.defineProperty(document, 'hidden', { value: true, writable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        expect(result.current).toBe(false);

        act(() => {
            Object.defineProperty(document, 'hidden', { value: false });
            document.dispatchEvent(new Event('visibilitychange'));
        });
        expect(result.current).toBe(true);
    });
});
