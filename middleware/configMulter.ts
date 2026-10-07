import multer from "multer";
import { AppError } from "../errors/AppError";
import {Request} from "express";

// Defining multer configuration

// 1) Storage
const storage: multer.StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "data/uploads");
    },
    filename: (req, file, cb) => {
        const subtype = file.mimetype.split("/")[1];
        cb(null, createFileName(file, subtype));
    }
});

// 2) Size Limits

const limits: multer.Options["limits"]= {
    files: 10,
    fileSize: 10000000 // 10 MB
}

// 3) File Filter

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image', 'application', 'video', 'audio'];

    const fileType = file.mimetype.split("/")[0];
    if(!fileType || !allowedTypes.includes(fileType)){
        const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE');
        err.message = `Invalid file type: ${file.mimetype}. Accepted: image/*, application/*, video/*, audio/*`;
        return cb(err);
    }
    return cb(null, true);
}

// Utility Function
function createFileName(file: Express.Multer.File, subtype:string){
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    const fileName = file.fieldname + uniqueSuffix + "." + subtype;
    return fileName;

}
// Configuring multer
const upload = multer({storage, limits, fileFilter});



export default upload;