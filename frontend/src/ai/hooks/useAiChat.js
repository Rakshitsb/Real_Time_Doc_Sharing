import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { askAiAssistant } from "../services/aiService";
import getErrorMessage from "../../utils/getErrorMessage";

const useAiChat = () => {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async ({ message, documentText, selectedText }) => {
    if (!message.trim()) return;

    const userMessage = { id: crypto.randomUUID(), role: "user", content: message };
    setMessages((items) => [...items, userMessage]);
    setIsSending(true);

    try {
      const response = await askAiAssistant({ message, documentText, selectedText });
      setMessages((items) => [
        ...items,
        { id: crypto.randomUUID(), role: "assistant", content: response.message, model: response.model },
      ]);
    } catch (error) {
      const failure = getErrorMessage(error, "AI assistant failed");
      toast.error(failure);
      setMessages((items) => [...items, { id: crypto.randomUUID(), role: "assistant", content: failure, error: true }]);
    } finally {
      setIsSending(false);
    }
  }, []);

  return { isSending, messages, sendMessage };
};

export default useAiChat;
