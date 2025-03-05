import { act, renderHook } from '@testing-library/react';
import { useCopyToClipboard } from '../src/hooks/useCopyToClipboard';

describe('useCopyToClipboard', () => {
    beforeAll(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn()
            }
        });
    });

    it('copia texto al portapapeles', async () => {
        const { result } = renderHook(() => useCopyToClipboard());

        await act(async () => {
            await result.current.copy('hello');
        });
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
        expect(result.current.copied).toBe(true);
        expect(result.current.error).toBe(null);
    });
});
