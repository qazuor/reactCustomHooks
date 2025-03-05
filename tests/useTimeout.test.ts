import { renderHook } from '@testing-library/react';
import { useTimeout } from '../src/hooks/useTimeout';

jest.useFakeTimers();

describe('useTimeout', () => {
    it('ejecuta callback después de X ms', () => {
        const callback = jest.fn();
        renderHook(() => useTimeout({ callback, delay: 2000 }));

        jest.advanceTimersByTime(1999);
        expect(callback).not.toBeCalled();

        jest.advanceTimersByTime(1);
        expect(callback).toBeCalled();
    });

    it('no hace nada si delay = null', () => {
        const callback = jest.fn();
        renderHook(() => useTimeout({ callback, delay: null }));

        jest.advanceTimersByTime(5000);
        expect(callback).not.toBeCalled();
    });
});
