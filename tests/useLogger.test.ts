import { renderHook } from '@testing-library/react';
import { useLogger } from '../src/hooks/useLogger';

describe('useLogger', () => {
    it('loguea valor en consola', () => {
        console.log = jest.fn();
        const { rerender } = renderHook(({ label, val }) => useLogger(label, val), {
            initialProps: { label: 'Test', val: 123 }
        });
        expect(console.log).toHaveBeenCalledWith('[Test]', 123);

        rerender({ label: 'Test', val: 456 });
        expect(console.log).toHaveBeenCalledWith('[Test]', 456);
    });
});
