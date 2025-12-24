import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uniqueName = crypto.randomUUID();
        cb(null, `${uniqueName}${ext}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "application/pdf" ||
            file.mimetype === "text/plain"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and TXT files are allowed"));
        }
    },
});

export default upload;
