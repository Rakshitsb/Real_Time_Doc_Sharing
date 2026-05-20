import { useCallback, useEffect, useRef, useState } from "react";

const useDebouncedAutosave = ({ value, enabled, onSave, delay = 1200 }) => {
  const [status, setStatus] = useState("saved");
  const lastSavedValueRef = useRef(null);
  const saveRequestRef = useRef(0);

  useEffect(() => {
    if (!enabled || !value) return undefined;

    const serializedValue = JSON.stringify(value);

    if (lastSavedValueRef.current === serializedValue) {
      return undefined;
    }

    setStatus("saving");

    const timeoutId = window.setTimeout(async () => {
      const requestId = saveRequestRef.current + 1;
      saveRequestRef.current = requestId;

      try {
        await onSave(value);

        if (saveRequestRef.current === requestId) {
          lastSavedValueRef.current = serializedValue;
          setStatus("saved");
        }
      } catch {
        if (saveRequestRef.current === requestId) {
          setStatus("error");
        }
      }
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay, enabled, onSave, value]);

  const markSaved = useCallback((nextValue) => {
    lastSavedValueRef.current = JSON.stringify(nextValue);
    setStatus("saved");
  }, []);

  return { status, markSaved };
};

export default useDebouncedAutosave;
