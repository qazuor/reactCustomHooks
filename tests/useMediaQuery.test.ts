import { renderHook } from '@testing-library/react';
import { useMediaQuery } from '../src/hooks/useMediaQuery';

describe('useMediaQuery', () => {
    it('retorna false si no hay match', () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        }));

        const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
        expect(result.current).toBe(false);
    });

    it('retorna true si coincide la media query', () => {
        window.matchMedia = jest.fn().mockImplementation((query) => ({
            matches: true,
            media: query,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        }));

        const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
        expect(result.current).toBe(true);
    });
});
