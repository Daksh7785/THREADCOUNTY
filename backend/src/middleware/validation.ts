import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export interface ValidatedRequest extends Request {
  validated?: any;
}

/**
 * Reusable Joi validation middleware.
 * @param schema  - Joi schema to validate against
 * @param source  - Where to read data from: 'body' | 'params' | 'query'
 */
export const validateRequest = (
  schema: Joi.Schema,
  source: 'body' | 'params' | 'query' = 'body'
) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction): void => {
    const data =
      source === 'body' ? req.body : source === 'params' ? req.params : req.query;

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
        type: detail.type,
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details,
      });
      return;
    }

    req.validated = value;
    next();
  };
};
