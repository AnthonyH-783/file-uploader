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
    const allowedTypes = ["png", "jpeg", "jpg", "gif", "pdf", "webp"];

    const subtype = file.mimetype.split("/")[1];
    if(!subtype && !allowedTypes.includes(subtype)){
        return cb(null, false);
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