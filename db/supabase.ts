import { createClient } from '@supabase/supabase-js'
import "dotenv/config";
import { AppError } from '../errors/AppError';
import { promises as fs } from "node:fs";

const {SUPABASE_URL, SUPABASE_KEY} = process.env;

if(!SUPABASE_URL || !SUPABASE_KEY){
    throw new AppError(500, "Storage url/key not found", true);
}
    
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Upload file using standard upload
export async function uploadFile(file:Express.Multer.File, bucketName:string) {
    try{
        const fileBuffer = await fs.readFile(file.path);
        const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(file.path, fileBuffer, {contentType: file.mimetype});

        if (error) throw error;
        return data;
    }
    finally{
        await fs.unlink(file.path); // Deletes the file from server
    }

}