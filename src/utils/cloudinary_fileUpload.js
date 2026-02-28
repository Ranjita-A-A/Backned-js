import {v2 as cloud} from "cloudinary"
import fs from "fs"

cloud.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    

const uploadOnCloudinary = async function(localFilePath) {

    try{
        if(!localFilePath) return null;

        // Upload the file to cloudinary
        const uploadResult = await cloud.uploader.upload(localFilePath,{
            resource_type: "auto",
            transformation: [{width: 500, height:500, crop: "fill"}]
        })
        console.log("Clodinary response :")
        console.log(uploadResult);
        fs.unlinkSync(localFilePath)
        return uploadResult

    } catch(error) {
        fs.unlinkSync(localFilePath) //remove the locally saved file
        return null
    }

};

const deleteFromCloudinary = async function (localFilePath) {
    try {
       if(!localFilePath) return null
       
       cloud.uploader.destroy(localFilePath.url, {invalidate: true})

    } catch (error) {
        throw new Error("Something went wrong while deleting video file from cloudinary")
    }
}

export {
    uploadOnCloudinary,
    deleteFromCloudinary
}