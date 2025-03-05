import { renderHook } from '@testing-library/react';
import { useLockBodyScroll } from '../src/hooks/useLockBodyScroll';

describe('useLockBodyScroll', () => {
    it('bloquea el scroll al montar y lo restaura al desmontar', () => {
        const original = document.body.style.overflow;
        const { unmount } = renderHook(() => useLockBodyScroll());
        expect(document.body.style.overflow).toBe('hidden');
        unmount();
        expect(document.body.style.overflow).toBe(original);
    });
});
