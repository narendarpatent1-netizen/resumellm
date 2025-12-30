import * as jwt from "jsonwebtoken";   // <-- important for TS typings
import { Secret, SignOptions } from "jsonwebtoken";

const {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ISSUER,
    JWT_AUDIENCE,
    ACCESS_TOKEN_EXPIRES = "15m",
    REFRESH_TOKEN_EXPIRES = "7d",
} = process.env;

if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets are missing in environment variables");
}

const baseOptions: SignOptions = {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: "HS256",
};

export const signAccessToken = (payload: object) => {
    const options: SignOptions = {
        ...baseOptions,
        expiresIn: ACCESS_TOKEN_EXPIRES as jwt.StringValue, // <-- fix
    };

    return jwt.sign(payload, JWT_ACCESS_SECRET as Secret, options);
};

export const signRefreshToken = (payload: object) => {
    const options: SignOptions = {
        ...baseOptions,
        expiresIn: REFRESH_TOKEN_EXPIRES as string | number,
    };

    return jwt.sign(payload, JWT_REFRESH_SECRET as Secret, options);
};
