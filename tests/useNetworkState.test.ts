import { act, renderHook } from '@testing-library/react';
import { useNetworkState } from '../src/hooks/useNetworkState';

describe('useNetworkState', () => {
    it('refleja el estado online/offline', () => {
        const { result } = renderHook(() => useNetworkState());
        expect(typeof result.current).toBe('boolean');

        act(() => {
            window.dispatchEvent(new Event('offline'));
        });
        expect(result.current).toBe(false);

        act(() => {
            window.dispatchEvent(new Event('online'));
        });
        expect(result.current).toBe(true);
    });
});
