import Joi from "joi";

export interface QuestionDTO {
    userId: string;
    resumeId: string;
}

export interface historyDTO {
    userId: string;
    resumeId: string;
}

export interface answerDTO {
    userId: string;
    resumeId: string;
    question: string;
    answer: string;
    questionId: string;
}

export const QuestionSchema = Joi.object<QuestionDTO>({
    userId: Joi.string().required(),
    resumeId: Joi.string().required()
});


export const historySchema = Joi.object<historyDTO>({
    userId: Joi.string().required(),
    resumeId: Joi.string().required()
});

export const answerSchema = Joi.object<answerDTO>({
    userId: Joi.string().required(),
    resumeId: Joi.string().required(),
    question: Joi.string().required(),
    answer: Joi.string().required(),
    questionId: Joi.string().required()
});