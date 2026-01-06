import mongoose, { Schema, model, Document } from 'mongoose';

export interface IInterviewState extends Document {
    userId: mongoose.Types.ObjectId;
    resumeId: mongoose.Types.ObjectId;
    expectingExitConfirmation: boolean;
    exitConfirmed?: boolean;
    submissionStatus?: boolean;
    lastPrompt?: string;     // optional: store the last bot question
    updatedAt: Date;
}


const InterviewStateSchema = new Schema<IInterviewState>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true, index: true },
        expectingExitConfirmation: { type: Boolean, default: false },
        exitConfirmed: { type: Boolean, default: undefined },
        submissionStatus: { type: Boolean, default: undefined },
        lastPrompt: { type: String },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

// One state per user
InterviewStateSchema.index({ userId: 1, resumeId: 1 }, { unique: true });

export default model<IInterviewState>("InterviewState", InterviewStateSchema);
