import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { runAiAction } from "../services/aiService";
import getErrorMessage from "../../utils/getErrorMessage";

const useAiAction = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const execute = useCallback(async (payload) => {
    setIsRunning(true);
    setError("");

    try {
      const response = await runAiAction(payload);
      setResult(response);
      return response;
    } catch (requestError) {
      const message = getErrorMessage(requestError, "AI request failed");
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError("");
  }, []);

  return { error, execute, isRunning, reset, result };
};

export default useAiAction;
