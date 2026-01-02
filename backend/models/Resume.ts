import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
    userId: string;
    fileName: string;
    text: string;
    embedding: number[];
    hash: string;
}


const ResumeSchema = new Schema<IResume>({
    userId: { type: String, required: true },
    fileName: { type: String, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    hash: { type: String, required: true, index: true },
});

// Optional: prevent exact-duplicate resumes per user
ResumeSchema.index({ userId: 1, hash: 1 }, { unique: true });

export default mongoose.model<IResume>("Resume", ResumeSchema);