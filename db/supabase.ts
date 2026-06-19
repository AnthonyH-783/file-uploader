import { createClient } from '@supabase/supabase-js'
import "dotenv/config";
import { AppError } from '../errors/AppError';
import { promises as fs } from "node:fs";

const {SUPABASE_URL, SUPABASE_KEY, PUBLISHABLE_KEY} = process.env;

if(!SUPABASE_URL || !SUPABASE_KEY || !PUBLISHABLE_KEY){
    throw new AppError(500, "Storage url/key not found", true);
}
console.log(SUPABASE_URL, SUPABASE_KEY, PUBLISHABLE_KEY);
    
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY); 

// Upload file using standard upload
export async function uploadFile(file:Express.Multer.File, bucketName:string) {
    try{
        const fileBuffer = await fs.readFile(file.path);

        const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(file.filename, fileBuffer, {contentType: file.mimetype});

        if (error) throw error;

        const urlData = await supabase.storage.from(bucketName)
                        .getPublicUrl(data.path);         
        const url = urlData.data;
        return url.publicUrl;
    }
    finally{
        await fs.unlink(file.path); // Deletes the file from server
    }
}

