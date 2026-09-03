import { createClient } from '@supabase/supabase-js'
import "dotenv/config";
import { AppError } from '../errors/AppError';
import { promises as fs } from "node:fs";

// Extracting and validating env variables
const {SUPABASE_URL, SUPABASE_KEY, PUBLISHABLE_KEY, BUCKET} = process.env;

if(!SUPABASE_URL || !SUPABASE_KEY || !PUBLISHABLE_KEY || !BUCKET){
    throw new AppError(500, "Storage url/key not found", true);
}

// Creating supabase client    
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY); 

// Upload file using standard upload
export async function uploadFile(file:Express.Multer.File, storageKey:string) {
    try{
        // Retrieving bytes from file system
        const fileBuffer = await fs.readFile(file.path);

        // Uploading to supabase bucket
        const { data, error } = await supabase.storage
        .from(BUCKET as string)
        .upload(storageKey, fileBuffer, {contentType: file.mimetype});

        if (error) throw error;

    }
    finally{
        await fs.unlink(file.path); // Deletes the file from server after cloud upload
    }
}



export async function deleteFilesFromStorage(storageKeys:string[]){
    const MAX_BULK_DELETE = 1000;
    // Validating storageKeys array
    if(storageKeys.length === 0) return;
    // Slicing storageKeys in batches if size beyond 1000
    for(let i = 0; i < storageKeys.length; i += MAX_BULK_DELETE){
        const batch = storageKeys.slice(i, i + MAX_BULK_DELETE);
        const {data, error} = await supabase.storage.from(BUCKET as string).remove(batch);
        if(error) throw error;
        if(data.length !== batch.length){
            const removed = new Set(data.map((f) => f.name));
            console.warn("Some storage objects were not removed:",
                 batch.filter((file) => !removed.has(file)));
        }
    }
}

export const getFileURL = async(storageKey:string) => {
    const {data, error} = await supabase.storage.from(BUCKET as string)
                            .createSignedUrl(storageKey, 3600);
    if(error) throw error;
    return data.signedUrl;
    

}



