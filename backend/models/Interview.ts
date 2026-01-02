import mongoose, { Schema, model, Document } from 'mongoose';

export interface IInterview extends Document {
    userId: string;
    question: string;
    answer: string;
    evaluation: string;
    score: number;
    resumeId: mongoose.Types.ObjectId;
}


const InterviewSchema = new Schema<IInterview>(
    {
        userId: { type: String, required: true },
        question: String,
        answer: String,
        evaluation: String,
        score: Number,
        resumeId: {
            type: Schema.Types.ObjectId,
            ref: "Resume",
            required: true
        }
    },
    { timestamps: true }
);

export default model<IInterview>("Interview", InterviewSchema);