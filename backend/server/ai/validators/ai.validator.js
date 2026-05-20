import Joi from "joi";

const aiActionSchema = Joi.object({
  action: Joi.string()
    .valid(
      "summarize_short",
      "summarize_bullets",
      "summarize_meeting",
      "grammar",
      "improve",
      "professional",
      "simplify",
      "expand",
      "fix_tone",
      "continue",
      "title",
      "action_items",
      "brainstorm",
      "explain"
    )
    .required(),
  selectedText: Joi.string().allow("").max(6000).default(""),
  documentText: Joi.string().allow("").max(16000).default(""),
  tone: Joi.string().allow("").max(80).default(""),
});

const aiChatSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
  selectedText: Joi.string().allow("").max(6000).default(""),
  documentText: Joi.string().allow("").max(16000).default(""),
});

export { aiActionSchema, aiChatSchema };
