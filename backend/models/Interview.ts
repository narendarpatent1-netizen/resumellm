import { Schema, model, Document } from 'mongoose';

export interface IInterview extends Document {
    userId: string;
    question: string;
    answer: string;
    evaluation: string;
    score: number;
}


const InterviewSchema = new Schema<IInterview>(
    {
        userId: String,
        question: String,
        answer: String,
        evaluation: String,
        score: Number
    },
    { timestamps: true }
);

export default model<IInterview>("Interview", InterviewSchema);