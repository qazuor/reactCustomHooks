import { act, renderHook } from '@testing-library/react';
import { useBoolean } from '../src/hooks/useBoolean';

describe('useBoolean', () => {
    it('permite setear, forzar y togglear boolean', () => {
        const { result } = renderHook(() => useBoolean());
        expect(result.current.value).toBe(false);

        act(() => {
            result.current.setTrue();
        });
        expect(result.current.value).toBe(true);

        act(() => {
            result.current.toggle();
        });
        expect(result.current.value).toBe(false);

        act(() => {
            result.current.setFalse();
        });
        expect(result.current.value).toBe(false);
    });
});
