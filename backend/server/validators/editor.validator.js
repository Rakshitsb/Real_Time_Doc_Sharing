import Joi from "joi";

const editorContentSchema = Joi.alternatives().try(
  Joi.string().allow(""),
  Joi.object({
    type: Joi.string().valid("doc").required(),
    content: Joi.array().items(Joi.object().unknown(true)).optional(),
  }).unknown(true)
);

export { editorContentSchema };
