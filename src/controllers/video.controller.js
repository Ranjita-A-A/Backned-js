import { asyncHandler } from "../utils/asynsHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary_fileUpload.js";
import { deleteFromCloudinary } from "../utils/cloudinary_fileUpload.js";

const getAllVideos = asyncHandler( async(req, res) => {
    const{ page=1, limit=10, query, sortBy, sortType, userId} = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    const skip = (pageNumber - 1) * limitNumber

    const filter= {}

    if(userId)
        filter.owner = userId

    if(query){
        filter.$or = [
            title = {$regex: query , $options: "i"},
            description = {$regex: query , $options: "i"}
        ]
    }

    const sort= {}

    sort[sortBy] = sortType === 'asc' ? 1 : -1

    const videos = await Video
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)

    const totalDocuments = await Video.countDocuments(filter)
    const totalPages = Math.ceil( totalDocuments / limitNumber )

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {
                page: pageNumber,
                limit: limitNumber,
                totalDocuments,
                totalPages,
                data: videos
            },
            "Videos fetched successfully"
        )
    )

})

const publishVideo = asyncHandler( async(req, res) => {
    // accept the input from user
    // upload it to cloudinary
    // return the res

    const {title, description} = req.body

    if(title?.trim() === "" || description?.trim() === ""){
        throw new ApiError(400, "Title and description are required")
    }

    const localVideoFile = req.files.videoFile[0]?.path
    const localthumbnailFile = req.files.thumbnail[0]?.path

    if(!localVideoFile){
        throw new ApiError(400, "Video file is missing")
    }

    if(!localthumbnailFile){
        throw new ApiError(401, "Thumbnail file is missing")
    }

    const videoFileURL = await uploadOnCloudinary(localVideoFile)
    const thumbnailURL = await uploadOnCloudinary(localthumbnailFile)

    if(!videoFileURL){
        throw new ApiError(400, "Something went wrong while uploading the video file to cloud")
    }

    if(!thumbnailURL){
        throw new ApiError(400, "Something went wrong while uploading the thumbnail file to cloud")
    }

    const video = await Video.create({
        videoFile: videoFileURL.url,
        thumbnail: thumbnailURL.url,
        title,
        description,
        duration: videoFileURL.duration,
        owner: req.user?._id
    })

    const iscreated = await Video.findById(video?._id)

    if(!iscreated){
        throw new ApiError(400, "Something went wrong while saving the video file")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, iscreated, "Video uploaded successfully")
    )

})

const getVideoById = asyncHandler(async(req, res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId
    const {title, description} = req.body

    if(!title && !description){
        throw new ApiError(400 , "Atleast one field is required")
    }

    const isvideo = await Video.findById(videoId)

    if(!isvideo){
        throw new ApiError(400, "Video not found")
    }

    if(isvideo.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "User not Authenticated")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                title: title,
                description: description
            }
        },
        {new: true, runValidators: true}
    )

    res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video details updated successfully")
    )
})

const updateThumbnail = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const thumbnailFile = req.file?.path

    if(!thumbnailFile){
        throw new ApiError(400, "Thumbnail file is missing")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "User not authenticated")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailFile)

    if(!thumbnail){
        throw new ApiError(400, "Something went wrong while uploading file to cloudinary")
    }

    video.thumbnail = thumbnail.url
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Thumbnail updated successfully")
    )

})

const updateVideoViews = asyncHandler(async(req, res) => {
    const {videoId} = req.params

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc:{
                views: 1
            }
        },
        {new: true}
    )

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(200, video.views, "Views updated successfully")
})

const deleteVideo = asyncHandler( async (req, res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "Forbidden")
    }

    await deleteFromCloudinary(video.videoFile)
    await deleteFromCloudinary(video.thumbnail)

    await video.deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler( async (req, res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "Forbidden");
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Toggled successfully")
    )
})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    updateThumbnail,
    updateVideoViews,
    deleteVideo,
    togglePublishStatus
}