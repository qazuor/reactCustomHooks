import { act, renderHook } from '@testing-library/react';
import { useIdleness } from '../src/hooks/useIdleness';

jest.useFakeTimers();
describe('useIdleness', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    it('debe volverse inactivo después del tiempo configurado', () => {
        const { result } = renderHook(() => useIdleness({ timeout: 3000 }));
        expect(result.current).toBe(false);

        act(() => {
            jest.advanceTimersByTime(3000);
            jest.runAllTimers();
        });
        expect(result.current).toBe(true);
    });

    it('debe resetear a activo si ocurre un evento antes de inactividad', () => {
        const { result } = renderHook(() => useIdleness({ timeout: 3000 }));
        expect(result.current).toBe(false);

        act(() => {
            jest.advanceTimersByTime(2000);
            window.dispatchEvent(new Event('mousemove')); // Resetea la inactividad
        });
        expect(result.current).toBe(false);

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(result.current).toBe(true);
    });
});
