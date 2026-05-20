import asyncHandler from "../../utils/asyncHandler.js";
import sendSuccess from "../../utils/sendResponse.js";
import { askDocumentAssistant, runAiAction } from "../services/ai.service.js";

const executeAiAction = asyncHandler(async (req, res) => {
  const result = await runAiAction({
    ...req.body,
    userId: req.user._id,
  });

  sendSuccess(res, result);
});

const chatWithDocument = asyncHandler(async (req, res) => {
  const result = await askDocumentAssistant({
    ...req.body,
    userId: req.user._id,
  });

  sendSuccess(res, result);
});

export { chatWithDocument, executeAiAction };
