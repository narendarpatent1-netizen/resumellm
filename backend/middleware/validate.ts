import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validate =
    (schema: ObjectSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            const { error, value } = schema.validate(req.body, {
                abortEarly: false,
            });

            if (error) {
                return res.status(400).json({
                    errors: error.details.map((d) => d.message),
                });
            }

            req.body = value; // validated data
            next();
        };
