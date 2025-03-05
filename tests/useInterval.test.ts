import { act, renderHook } from '@testing-library/react';
import { useInterval } from '../src/hooks/useInterval';

jest.useFakeTimers();

describe('useInterval', () => {
    it('ejecuta callback en intervalos regulares', () => {
        const callback = jest.fn();
        renderHook(() => useInterval({ callback, delay: 1000 }));

        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(callback).toHaveBeenCalledTimes(3);
    });

    it('pausa si delay = null', () => {
        const callback = jest.fn();
        renderHook(() => useInterval({ callback, delay: null }));
        act(() => {
            jest.advanceTimersByTime(3000);
        });
        expect(callback).not.toBeCalled();
    });
});
