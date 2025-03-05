import { act, renderHook } from '@testing-library/react';
import { useToggle } from '../src/hooks/useToggle';

describe('useToggle', () => {
    it('alterna entre true y false', () => {
        const { result } = renderHook(() => useToggle());
        expect(result.current[0]).toBe(false);

        act(() => {
            result.current[1]();
        });
        expect(result.current[0]).toBe(true);
    });
});
