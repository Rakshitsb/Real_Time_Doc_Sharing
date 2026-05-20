import ApiError from "../../utils/ApiError.js";
import HTTP_STATUS from "../../constants/httpStatus.js";
import logger from "../../utils/logger.js";
import getAiProvider from "../providers/index.js";
import { actionPrompts, chatSystemPrompt } from "../prompts/promptTemplates.js";
import { buildActionInput, buildChatInput } from "../utils/contextWindow.js";

const runAiAction = async ({ action, selectedText, documentText, tone, userId }) => {
  const prompt = actionPrompts[action];
  if (!prompt) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Unsupported AI action");
  }

  const provider = getAiProvider();
  const input = buildActionInput({ action, selectedText, documentText, tone });
  const result = await provider.complete({
    system: `${prompt.system}\n${prompt.instruction}\nReturn only the final useful output. Do not include preambles.`,
    input,
    maxOutputTokens: action.startsWith("summarize") ? 700 : 900,
  });

  logger.info("ai_action_completed", {
    action,
    provider: provider.name,
    model: result.model,
    userId,
    usage: result.usage,
  });

  return {
    action,
    label: prompt.label,
    result: result.text,
    usage: result.usage,
    model: result.model,
  };
};

const askDocumentAssistant = async ({ message, documentText, selectedText, userId }) => {
  const provider = getAiProvider();
  const result = await provider.complete({
    system: chatSystemPrompt,
    input: buildChatInput({ message, documentText, selectedText }),
    maxOutputTokens: 900,
  });

  logger.info("ai_chat_completed", {
    provider: provider.name,
    model: result.model,
    userId,
    usage: result.usage,
  });

  return {
    message: result.text,
    usage: result.usage,
    model: result.model,
  };
};

export { askDocumentAssistant, runAiAction };
