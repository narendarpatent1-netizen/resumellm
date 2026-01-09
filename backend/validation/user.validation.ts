import Joi from "joi";

export interface RegisterDTO {
    email: string;
    password: string;
    age: Number;
}

export interface loginDTO {
    email: string;
    password: string;
}

export const registerSchema = Joi.object<RegisterDTO>({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    age: Joi.number().optional(),
});


export const loginSchema = Joi.object<loginDTO>({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});