import mongoose, { Schema, model, Document } from 'mongoose';

export interface IInterview extends Document {
    userId: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    evaluation: string;
    score: number;
    resumeId: mongoose.Types.ObjectId;
}


const InterviewSchema = new Schema<IInterview>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

export default model<IInterview>("InterviewConversation", InterviewSchema);