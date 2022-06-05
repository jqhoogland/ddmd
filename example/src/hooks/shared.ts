import React, {SyntheticEvent} from "react";

/**
 * Attach an modify an event listener `callback` to `event` on `item`.
 */
export function useEventListener<T extends HTMLElement, S extends SyntheticEvent>(item: T | undefined, event: string, callback: (e: S) => void) {
    const [{prev}, setCallback] = React.useState({
        prev: (e: S) => {}
    });

    React.useEffect(() => {
        if (item) {
            // @ts-ignore
            item.removeEventListener(event, prev);
            // @ts-ignore
            item.addEventListener(event, callback);
            setCallback({prev: callback});

            return () => item.removeEventListener(event, callback);
        }
    }, [item, callback !== prev])
}


/**
 * See: [Goodbye, useEffect by David Khourshid](https://youtu.be/HPoC-k7Rxwo?t=1314)
 */
export const useMount = (effect) => {
    const executedRef = React.useRef(false);
    React.useEffect(() => {
        if (executedRef.current) return;
        const res = effect();
        executedRef.current = true;
        return res;
    }, [])
}