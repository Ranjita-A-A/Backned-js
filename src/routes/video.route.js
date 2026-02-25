import { Router } from "express";
import router from "./user.route";
import { 
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    updateThumbnail,
    updateVideoViews,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router
.route("/video-publish")
.get(getAllVideos)
.post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
)

router.route("get-video/:videoId").get(getVideoById)
router.route("update-video/:videoId").patch(verifyJWT, updateVideo)
router.route("update-thumbnail/:videoId").patch(verifyJWT, upload.single("thumbnail", updateThumbnail))
router.route("update-views/:videoId").patch(verifyJWT, updateVideoViews)
router.route("delete-video/:videoId").delete(verifyJWT, deleteVideo)
router.route("toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus)

export default router