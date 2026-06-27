import Joi from 'joi';

const emailSchema = Joi.string().email().required().max(255).trim();

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.pattern.base': 'Password must contain at least one uppercase letter and one number.',
    'any.required': 'Password is required.',
  });

export const schemas = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  signup: Joi.object({
    name: Joi.string().required().max(255).trim().messages({
      'any.required': 'Name is required.',
    }),
    email: emailSchema,
    password: passwordSchema,
    company: Joi.string().max(255).trim().allow('', null).optional(),
  }),

  login: Joi.object({
    email: emailSchema,
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false),
  }),

  forgotPassword: Joi.object({
    email: emailSchema,
  }),

  resetPassword: Joi.object({
    email: emailSchema,
    code: Joi.string().required().trim(),
    newPassword: passwordSchema,
  }),

  verifyOtp: Joi.object({
    email: emailSchema,
    code: Joi.string().required().trim(),
  }),

  // ── User ────────────────────────────────────────────────────────────────────
  updateProfile: Joi.object({
    name: Joi.string().max(255).trim().optional(),
    company: Joi.string().max(255).trim().allow('', null).optional(),
    avatar_url: Joi.string().uri().allow('', null).optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: passwordSchema,
  }),

  // ── Contact ─────────────────────────────────────────────────────────────────
  contact: Joi.object({
    name: Joi.string().required().max(255).trim(),
    email: emailSchema,
    subject: Joi.string().required().max(500).trim(),
    message: Joi.string().required().max(5000).trim(),
  }),

  // ── Report ──────────────────────────────────────────────────────────────────
  shareReport: Joi.object({
    email: emailSchema,
    message: Joi.string().max(1000).allow('').optional(),
  }),

  // ── Checkout ────────────────────────────────────────────────────────────────
  createCheckout: Joi.object({
    planId: Joi.string()
      .required()
      .valid('free', 'student', 'professional', 'enterprise'),
    billingCycle: Joi.string().valid('monthly', 'annual').default('monthly'),
  }),

  // ── Notifications ───────────────────────────────────────────────────────────
  notificationPreferences: Joi.object({
    email_on_analysis_complete: Joi.boolean().optional(),
    email_on_upload_success: Joi.boolean().optional(),
    email_on_subscription_changes: Joi.boolean().optional(),
    email_newsletter: Joi.boolean().optional(),
  }),
};
