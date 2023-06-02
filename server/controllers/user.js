import { createError } from "../error.js";
import User from "../models/User.js";
import Video from "../models/Video.js";

export const update = async (req, res, next) => {
  //req.params.id comes from api url
  //req.user.id comes from token
  if (req.params.id === req.user.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        //will return the newest version of model
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can only update your account!"));
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("User has been deleted!");
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can only delete your account!"));
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const subscribe = async (req, res, next) => {
  try {
    //finding the user
    await User.findByIdAndUpdate(req.user.id, {
      //pushing the other channel's id to the user's subscribedUsers, $ denotes a mongoDB method
      $push: { subscribedUsers: req.params.id },
    });
    //finding the other channel's id and increasing the subscriber count
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: 1 },
    });
    res.status(200).json("Subcription successful!");
  } catch (err) {
    next(err);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    //finding the user
    await User.findByIdAndUpdate(req.user.id, {
      //getting channel id from params and pulling/deleting from the subscribedUsers array
      $pull: { subscribedUsers: req.params.id },
    });
    //finding the other channel's id and decreasing the subscriber count
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: -1 },
    });
    res.status(200).json("Unsubcription successful!");
  } catch (err) {
    next(err);
  }
};

export const like = async (req, res, next) => {
  const id = req.user.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      //$addToSet prevents duplicate id's from being pushed to the likes array, this would happen if using $push
      //$pull gets rid of user id if they have already disliked the video
      $addToSet: { likes: id },
      $pull: { dislikes: id },
    });
    res.status(200).json("The video has been liked!");
  } catch (err) {
    next(err);
  }
};

export const dislike = async (req, res, next) => {
  const id = req.user.id;
  const videoId = req.params.videoId;
  try {
    await Video.findByIdAndUpdate(videoId, {
      //$addToSet prevents duplicate id's from being pushed to the dislikes array, this would happen if using $push
      //$pull gets rid of user id if they have already liked the video
      $addToSet: { dislikes: id },
      $pull: { likes: id },
    });
    res.status(200).json("The video has been disliked!");
  } catch (err) {
    next(err);
  }
};
