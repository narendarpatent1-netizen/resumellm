import mongoose, { Document, CallbackWithoutResultAndOptionalError, HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
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
        isActive: { type: Boolean, default: true },
        lastLoginAt: { type: Date }
    },
    { timestamps: true }
);

// 🔐 Pre-save hook
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// 🔎 Compare password
userSchema.methods.comparePassword = function (password: string) {
    return bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
