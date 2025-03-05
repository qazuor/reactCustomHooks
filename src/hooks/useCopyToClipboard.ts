import { useCallback, useState } from 'react';

/**
 * useCopyToClipboard
 *
 * @description Provides a function to copy text to the user's clipboard. It returns
 * a status indicating whether the copy operation succeeded, and any error if it failed.
 *
 * @returns {{
 *   copy: (text: string) => Promise<void>,
 *   copied: boolean,
 *   error: Error | null
 * }} - An object containing:
 *  - `copy`: A function that attempts to write `text` to the clipboard.
 *  - `copied`: A boolean that is `true` if the last copy attempt was successful.
 *  - `error`: An Error object if the last attempt failed, or `null`.
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
export function useCopyToClipboard() {
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setError(null);
        } catch (err) {
            setError(err as Error);
            setCopied(false);
        }
    }, []);

    return { copy, copied, error };
}
