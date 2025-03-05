import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from '../src/hooks/useClickOutside';

describe('useClickOutside', () => {
    it('llama al handler si se hace click fuera del ref', () => {
        const handler = jest.fn();
        const { result } = renderHook(() => {
            const ref = useRef<HTMLElement>(document.body);
            useClickOutside(ref, handler);
            return ref;
        });

        act(() => {
            document.dispatchEvent(new MouseEvent('mousedown'));
        });
        expect(handler).toHaveBeenCalled();
    });
});
