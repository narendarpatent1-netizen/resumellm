import mongoose, { Schema, Document } from "mongoose";

export enum Status {
    COMPLETED = "COMPLETED",
    EXITED = "EXITED",
};

export interface ISubmitted extends Document {
    userId: mongoose.Types.ObjectId;
    resumeId: mongoose.Types.ObjectId;
    status: Status;
}

const SubmittedSchema = new Schema<ISubmitted>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    status: { type: String, enum: Object.values(Status), default: Status.COMPLETED },
}, { timestamps: true });

export default mongoose.model<ISubmitted>("InterviewSubmission", SubmittedSchema);

