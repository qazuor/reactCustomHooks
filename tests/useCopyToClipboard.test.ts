import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useCopyToClipboard } from '../src/hooks/useCopyToClipboard';

const mockWriteText = jest.fn();

describe('useCopyToClipboard', () => {
    let hook: RenderHookResult<ReturnType<typeof useCopyToClipboard>, unknown>;

    beforeAll(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: mockWriteText
            }
        });
    });

    beforeEach(() => {
        hook = renderHook(() => useCopyToClipboard());
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    it('should copy text to clipboard successfully', async () => {
        mockWriteText.mockResolvedValueOnce(undefined);

        await act(async () => {
            await hook.result.current.copy('test text');
        });

        expect(mockWriteText).toHaveBeenCalledWith('test text');
        expect(hook.result.current.copied).toBe(true);
        expect(hook.result.current.error).toBe(null);
    });

    it('should handle copy failures', async () => {
        const error = new Error('Copy failed');
        mockWriteText.mockRejectedValueOnce(error);

        await act(async () => {
            await hook.result.current.copy('test text');
        });

        expect(hook.result.current.copied).toBe(false);
        expect(hook.result.current.error).toBe(error);
    });

    it('should reset state after successful copy', async () => {
        mockWriteText.mockResolvedValueOnce(undefined);

        await act(async () => {
            await hook.result.current.copy('test text');
        });

        expect(hook.result.current.copied).toBe(true);

        act(() => {
            jest.advanceTimersByTime(2000);
        });

        expect(hook.result.current.copied).toBe(false);
    });

    it('should reset state manually', async () => {
        mockWriteText.mockResolvedValueOnce(undefined);

        await act(async () => {
            await hook.result.current.copy('test text');
        });

        expect(hook.result.current.copied).toBe(true);

        act(() => {
            hook.result.current.reset();
        });

        expect(hook.result.current.copied).toBe(false);
        expect(hook.result.current.error).toBe(null);
    });
});
