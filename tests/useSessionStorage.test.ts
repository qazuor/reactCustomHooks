import { act, renderHook } from '@testing-library/react';
import { useSessionStorage } from '../src/hooks/useSessionStorage';

describe('useSessionStorage', () => {
    it('lee y escribe en sessionStorage', () => {
        const { result } = renderHook(() => useSessionStorage('testKey', 0));

        expect(result.current[0]).toBe(0);

        act(() => {
            result.current[1](42);
        });
        expect(window.sessionStorage.getItem('testKey')).toBe('42');
        expect(result.current[0]).toBe(42);
    });
});
