import { Router } from "express";
import {
    getUserChannelSubscriber,
    toggleSubscription,
    getChannelList
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route(verifyJWT)

router.route("/toggle-subscription/:channelId").patch(toggleSubscription)
router.route("/get-subscriber/:channelId").get(getUserChannelSubscriber)
router.route("/get-channels").get(getChannelList)

export default router