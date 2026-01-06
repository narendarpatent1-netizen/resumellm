import "express";
import "express-serve-static-core";

declare global {
    namespace Express {
        interface Request {
            file?: Multer.File;
            user?: {
                sub: string;
                role?: string;
                iat?: number;
                exp?: number;
            };
        }
    }
}

