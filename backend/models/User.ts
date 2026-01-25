import mongoose, { Document, CallbackWithoutResultAndOptionalError, HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    refreshToken: string;
    isActive: boolean;
    lastLoginAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser>;

const userSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 10, unique: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6, select: false },
        refreshToken: { type: String },
        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
