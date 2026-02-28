import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose,{isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asynsHandler";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler( async (req, res) => {
    const channelId = req.params
    const userId = req.user?._id

    if(! isValidObjectId(channelId)){
        throw new ApiError(403, "Invalid channel Id")
    }

    if(userId.equals(channelId)){
        throw new ApiError(403, "U can't subscribe to yourself")
    } 

    const existingSubscriber = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    if(existingSubscriber){
        await existingSubscriber.deleteOne()

        return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    }

    const newSubscriber = await Subscription.create({
        subscriber: userId,
        channel: channelId    
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, newSubscriber, "Subscription added successfully")
    )
})

// Get the list of subscriber of a Channel
const getUserChannelSubscriber = asyncHandler( async (req, res) => {
    const {channelId} = req.params

    if(! isValidObjectId(channelId)){
        throw new ApiError(403, "Invalid channel Id")
    }

    const subscriberList = await Subscription.find({ channel: channelId }).populate("subscriber", "username fullName avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscriberList, "Subscriber list fetched successfully")
    )
})

//Get the list of Channels of a user
const getChannelList = asyncHandler( async (req, res) => {
    const subscriberId = req.user?._id
    
    if(! isValidObjectId(subscriberId)){
        throw new ApiError(403, "User id not valid")
    }

    const subscriptions = await Subscription.find({subscriber: subscriberId}).populate("channel", "username fullName avatar")

    const channelList = subscriptions.map( sub => sub.channel)

    return res
    .status(200)
    .json(
        new ApiResponse(200, channelList, "Channels fetched successfully")
    )
})

export{
    toggleSubscription,
    getUserChannelSubscriber,
    getChannelList
}