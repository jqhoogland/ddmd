import React, { SyntheticEvent } from "react";


/**
 * Credits: [usehooks](https://usehooks.com/useEventListener/).
 */
export function useEventListener<T extends SyntheticEvent, S extends EventTarget | DocumentAndElementEventHandlers | undefined | null>(
  eventName: string,
  handler: EventListener,
  element: S  // TODO: default = window
) {
  const savedHandler = React.useRef<EventListener>(() => {});

  React.useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  React.useEffect(
    () => {
      if (element?.addEventListener) {
        element.addEventListener(eventName, savedHandler.current);
        return () => element.removeEventListener(eventName, savedHandler.current);
      }
    },
    [eventName, element]
  );
}


/**
 * See: [Goodbye, useEffect by David Khourshid](https://youtu.be/HPoC-k7Rxwo?t=1314)
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
