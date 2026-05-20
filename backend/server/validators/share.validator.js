import Joi from "joi";

const roleSchema = Joi.string().valid("editor", "viewer", "commenter");

const inviteCollaboratorSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  role: roleSchema.default("viewer"),
});

const updateCollaboratorRoleSchema = Joi.object({
  role: roleSchema.required(),
});

const updateVisibilitySchema = Joi.object({
  visibility: Joi.string().valid("private", "collaborators-only", "public-readonly").required(),
});

export { inviteCollaboratorSchema, updateCollaboratorRoleSchema, updateVisibilitySchema };
