import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
    userId: string;
    text: string;
    embedding: number[];
}


const ResumeSchema = new Schema<IResume>({
    userId: { type: String, required: true },
    text: { type: String, required: true },
    embedding: { type: [Number], required: true }
});

export default mongoose.model<IResume>("Resume", ResumeSchema);