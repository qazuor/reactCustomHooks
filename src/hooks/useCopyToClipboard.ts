import { useCallback, useEffect, useRef, useState } from 'react';

interface CopyToClipboardState {
    copied: boolean;
    error: Error | null;
}

interface UseCopyToClipboardReturn extends CopyToClipboardState {
    copy: (text: string) => Promise<void>;
    reset: () => void;
}

/**
 * useCopyToClipboard
 *
 * @description Provides a function to copy text to the user's clipboard. It returns
 * a status indicating whether the copy operation succeeded, and any error if it failed.
 *
 * @returns {UseCopyToClipboardReturn} - An object containing:
 *  - `copy`: A function that attempts to write `text` to the clipboard.
 *  - `copied`: A boolean that is `true` if the last copy attempt was successful.
 *  - `error`: An Error object if the last attempt failed, or `null`.
 *  - `reset`: A function to reset the copied and error states.
 *
 * @example
 * ```ts
 * const { copy, copied, error } = useCopyToClipboard();
 *
 * async function handleCopy() {
 *   await copy('Hello Clipboard');
 *   if (copied) console.log('Copied successfully!');
 *   if (error) console.log('Error copying text');
 * }
 * ```
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
    const [state, setState] = useState<CopyToClipboardState>({
        copied: false,
        error: null
    });

    const timeoutRef = useRef<number | null>(null);

    const copy = useCallback(async (text: string) => {
        try {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }

            await navigator.clipboard.writeText(text);
            setState({ copied: true, error: null });

            // Auto-reset after 2 seconds
            timeoutRef.current = window.setTimeout(() => {
                setState((prev) => ({ ...prev, copied: false }));
            }, 2000);
        } catch (err) {
            setState({ copied: false, error: err as Error });
        }
    }, []);

    const reset = useCallback(() => {
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
        }
        setState({ copied: false, error: null });
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { copy, reset, ...state };
}
