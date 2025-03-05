import { useEffect, useState } from 'react';

/**
 * useNetworkState
 *
 * @description Tracks the user's network connectivity (online/offline). Returns `true` if the user is online, `false` if offline.
 * Under the hood, it listens to the browser's `online` and `offline` events.
 *
 * @returns {boolean} - A boolean indicating whether the user is currently online (`true`) or offline (`false`).
 *
 * @example
 * ```ts
 * const isOnline = useNetworkState();
 * console.log(isOnline ? 'Connected' : 'Disconnected');
 * ```
 */
export function useNetworkState() {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    return online;
}
