import React, { SyntheticEvent } from "react";


/**
 * Credits: [usehooks](https://usehooks.com/useEventListener/).
 */
export function useEventListener<T extends SyntheticEvent, S extends EventTarget | DocumentAndElementEventHandlers | undefined>(
  eventName: string,
  handler: EventListener,
  element: S  // TODO: default = window
) {
  const savedHandler = React.useRef<EventListener>();

  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  React.useEffect(
    () => {
      if (!element || !element.addEventListener) {
        return;
      }
      if (savedHandler?.current) {
        // @ts-ignore
        const eventListener = ((e: T) => savedHandler.current(e)) as unknown as EventListener;
        element.addEventListener(eventName, eventListener);
        return () => element.removeEventListener(eventName, eventListener);
      }
    },
    [eventName, element]
  );
}


/**
 * See: [Goodbye, useEffect by David
 * Khourshid](https://youtu.be/HPoC-k7Rxwo?t=1314)
 */
export const useMount = (effect: () => void) => {
  const executedRef = React.useRef(false);
  React.useEffect(() => {
    if (executedRef.current) {
      return;
    }
    const res = effect();
    executedRef.current = true;
    return res;
  }, []);
};
