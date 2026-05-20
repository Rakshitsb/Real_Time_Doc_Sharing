import Joi from "joi";
import { editorContentSchema } from "./editor.validator.js";

const documentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required(),
  content: editorContentSchema.required(),
});

export { documentSchema };
