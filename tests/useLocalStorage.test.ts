import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from '../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
    it('lee y escribe en localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('testKey', 'hola'));

        expect(result.current[0]).toBe('hola');

        act(() => {
            result.current[1]('mundo');
        });
        expect(window.localStorage.getItem('testKey')).toBe('"mundo"');
        expect(result.current[0]).toBe('mundo');
    });
});
