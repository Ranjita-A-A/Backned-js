import {v2 as cloud} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    

const uploadOnCloudinary = async function(localFilePath) {

    try{
        if(!localFilePath) return null;

        // Upload the file to cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        console.log(uploadResult.url);
        return uploadResult

    } catch(error) {
        fs.unlinkSync(localFilePath) //remove the locally saved file
        return null
    }

};

export {uploadOnCloudinary}