import { useCallback, useEffect, useState } from 'react';

interface NavigatorConnection {
    downlink?: number;
    downlinkMax?: number;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    rtt?: number;
    saveData?: boolean;
    type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
    addEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
    removeEventListener?: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

interface NavigatorExtended extends Navigator {
    connection?: NavigatorConnection;
}

interface NetworkState {
    online: boolean;
    downlink?: number;
    downlinkMax?: number;
    effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
    rtt?: number;
    saveData?: boolean;
    type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
}

interface UseNetworkStateReturn extends NetworkState {
    checkConnection: () => void;
}

/**
 * useNetworkState
 *
 * @description Tracks the user's network connectivity (online/offline). Returns `true` if the user is online, `false` if offline.
 * Under the hood, it listens to the browser's `online` and `offline` events.
 *
 * @returns {UseNetworkStateReturn} - Network state and control methods.
 * @returns {boolean} - A boolean indicating whether the user is currently online (`true`) or offline (`false`).
 *
 * @example
 * ```ts
 * const isOnline = useNetworkState();
 * console.log(isOnline ? 'Connected' : 'Disconnected');
 * ```
 */
export function useNetworkState(): UseNetworkStateReturn {
    const [state, setState] = useState<NetworkState>(() => ({
        online: navigator.onLine,
        ...((navigator as NavigatorExtended).connection || {})
    }));

    const updateNetworkInfo = useCallback(() => {
        const connection = (navigator as NavigatorExtended).connection;
        setState({
            online: navigator.onLine,
            downlink: connection?.downlink,
            downlinkMax: connection?.downlinkMax,
            effectiveType: connection?.effectiveType,
            rtt: connection?.rtt,
            saveData: connection?.saveData,
            type: connection?.type
        });
    }, []);

    useEffect(() => {
        const connection = (navigator as NavigatorExtended).connection;

        window.addEventListener('online', updateNetworkInfo);
        window.addEventListener('offline', updateNetworkInfo);

        if (connection) {
            connection?.addEventListener?.('change', updateNetworkInfo);
        }

        return () => {
            window.removeEventListener('online', updateNetworkInfo);
            window.removeEventListener('offline', updateNetworkInfo);
            if (connection) {
                connection?.removeEventListener?.('change', updateNetworkInfo);
            }
        };
    }, [updateNetworkInfo]);

    return { ...state, checkConnection: updateNetworkInfo };
}
