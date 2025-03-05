import { act, renderHook } from '@testing-library/react';
import { useHandledInterval } from '../src/hooks/useHandledInterval';

jest.useFakeTimers();

describe('useHandledInterval', () => {
    it('inicia automáticamente el intervalo y puede pausarse', () => {
        const callback = jest.fn();
        const { result } = renderHook(() => useHandledInterval({ callback, delay: 1000 }));

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(callback).toHaveBeenCalledTimes(3);

        act(() => {
            result.current.pause();
            jest.advanceTimersByTime(3000);
        });
        expect(callback).toHaveBeenCalledTimes(3);
    });
});
