import { type RenderHookResult, act, renderHook } from '@testing-library/react';
import { useLogger } from '../src/hooks/useLogger';

describe('useLogger', () => {
    let hook: RenderHookResult<() => void, { label: string; value: unknown }>;
    let consoleSpy: jest.SpyInstance;
    let warnSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;
    let debugSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
        debugSpy.mockRestore();
        jest.clearAllMocks();
    });

    it('should log initial value', () => {
        const hook = renderHook(({ label, value }) => useLogger(label, value), {
            initialProps: { label: 'Test', value: 'initial' }
        });
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Test] "initial"'));
    });

    it('should log when value changes', () => {
        const hook = renderHook(({ label, value }) => useLogger(label, value), {
            initialProps: { label: 'Test', value: 'initial' }
        });
        consoleSpy.mockClear();
        hook.rerender({ label: 'Test', value: 'updated' });
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Test] "updated"'));
    });

    it('should not log when value remains the same', () => {
        const hook = renderHook(({ label, value }) => useLogger(label, value), {
            initialProps: { label: 'Test', value: 'initial' }
        });
        consoleSpy.mockClear();
        hook.rerender({ label: 'Test', value: 'initial' });
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should respect log level option', () => {
        renderHook(() => useLogger('Test', 'value', { level: 'warn' }));
        expect(warnSpy).toHaveBeenCalled();

        renderHook(() => useLogger('Test', 'value', { level: 'error' }));
        expect(errorSpy).toHaveBeenCalled();

        renderHook(() => useLogger('Test', 'value', { level: 'debug' }));
        expect(debugSpy).toHaveBeenCalled();
    });

    it('should handle disabled logging', () => {
        const { rerender } = renderHook(({ value }) => useLogger('Test', value, { enabled: false }), {
            initialProps: { value: 'initial' }
        });

        consoleSpy.mockClear();
        rerender({ value: 'updated' });
        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should use custom formatter', () => {
        consoleSpy.mockClear();
        const formatter = (label: string, value: unknown) => `Custom: ${label} = ${value}`;
        renderHook(() => useLogger('Test', 'value', { formatter }));

        expect(consoleSpy).toHaveBeenCalledWith('Custom: Test = value');
    });

    it('should include timestamp when enabled', () => {
        consoleSpy.mockClear();
        const { rerender } = renderHook(({ value }) => useLogger('Test', value, { timestamp: true }), {
            initialProps: { value: 'initial' }
        });

        rerender({ value: 'updated' });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*\].*/));
    });

    it('should manually trigger logging', () => {
        const hook = renderHook(({ label, value }) => useLogger(label, value), {
            initialProps: { label: 'Test', value: 'initial' }
        });
        const log = hook.result.current;
        consoleSpy.mockClear();

        act(() => {
            log();
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Test] "initial"'));
    });
});
