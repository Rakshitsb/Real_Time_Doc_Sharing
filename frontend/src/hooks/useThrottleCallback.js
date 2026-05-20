import { useCallback, useEffect, useRef } from "react";

const useThrottleCallback = (callback, delay = 100) => {
  const callbackRef = useRef(callback);
  const lastRunRef = useRef(0);
  const timeoutRef = useRef();
  const argsRef = useRef([]);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return useCallback(
    (...args) => {
      argsRef.current = args;
      const remaining = delay - (Date.now() - lastRunRef.current);

      const run = () => {
        lastRunRef.current = Date.now();
        timeoutRef.current = undefined;
        callbackRef.current(...argsRef.current);
      };

      if (remaining <= 0 || !lastRunRef.current) {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        run();
        return;
      }

      if (!timeoutRef.current) {
        timeoutRef.current = window.setTimeout(run, remaining);
      }
    },
    [delay]
  );
};

export default useThrottleCallback;
