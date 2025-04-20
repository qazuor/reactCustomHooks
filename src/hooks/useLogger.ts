import { useCallback, useEffect, useRef } from 'react';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type LoggerOptions = {
    /** Log level to use. Defaults to 'info'. */
    level?: LogLevel;
    /** Whether to include timestamps in logs. Defaults to true. */
    timestamp?: boolean;
    /** Whether logging is enabled. Defaults to true. */
    enabled?: boolean;
    /** Custom formatter for the log message. */
    formatter?: (label: string, value: unknown) => string;
};

/**
 * useLogger
 *
 * @description Logs a message to the console whenever the provided `value` changes.
 * This can be useful for debugging or tracking state changes.
 *
 * @param {string} label - A string label to precede the value in the console log.
 * @param {unknown} value - The value to log whenever it changes.
 * @param {LoggerOptions} [options] - Optional configuration for the logger.
 * @returns {() => void} - A function to manually trigger logging.
 *
 * @example
 * ```ts
 * useLogger('Current count', count);
 * ```
 */
export function useLogger(label: string, value: unknown, options: LoggerOptions = {}) {
    const { level = 'info', timestamp = true, enabled = true, formatter } = options;

    const prevValue = useRef<unknown>(null);
    const isFirstRender = useRef(true);

    const getTimestamp = useCallback(() => {
        if (!timestamp) return '';
        return `[${new Date().toISOString()}] `;
    }, [timestamp]);

    const formatMessage = useCallback(
        (msg: unknown) => {
            if (formatter) {
                return formatter(label, msg);
            }
            return `${getTimestamp()}[${label}] ${JSON.stringify(msg)}`;
        },
        [label, getTimestamp, formatter]
    );

    const log = useCallback(() => {
        if (!enabled) return;

        const message = formatMessage(value);
        switch (level) {
            case 'warn':
                console.warn(message);
                break;
            case 'error':
                console.error(message);
                break;
            case 'debug':
                console.debug(message);
                break;
            default:
                console.info(message);
        }
    }, [enabled, level, value, formatMessage]);

    useEffect(() => {
        // Log on first render or when value changes
        if (isFirstRender.current || value !== prevValue.current) {
            log();
            isFirstRender.current = false;
            prevValue.current = value;
        }
    }, [value, log]);

    return log;
}
