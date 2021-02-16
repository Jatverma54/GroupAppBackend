var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
var postModel = require('./../model/posts');
var NotificationModel = require('./../model/notifications');


function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

exports.getNotification = async (req, res, next) => {
    try {
        //sort
        var newArrayLikes = [];
        var newArrayComments = [];

        var newArrayCommentLike = [];
        var newArrayReplyComment = [];
        var newArrayReplycommentsData = [];
        var notificationData = await NotificationModel.find({ group_id: req.params.id }).sort('-createdAt').exec()

        notificationData = paginate(notificationData, parseInt(req.query.page_size + 4), req.query.page_number)

        let ToBeInserted = []

        for (var data in notificationData) {
            var userData = await notificationData[data].populate({ path: 'activity_by', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate();
            var PostData = await notificationData[data].populate('post_id').execPopulate();

            if (notificationData[data].notificationType === "all" && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                var notify = notificationData[data].toObject();

                ToBeInserted.push(notify)


            } else if (notificationData[data].notificationType === "UserSpecific" && notificationData[data].activity === "PostLikedBy") {

                if (PostData.post_id && PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();

                    let indicator = newArrayLikes.find(a => a.toString() === notify.post_id._id.toString()) ? true : false
                    if (indicator === false) {  //activity
                        newArrayLikes.push(notify.post_id._id)

                        if (notify.post_id.likedBy.length > 1) {
                            notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(notify.post_id.likedBy.length - 1) + " other grouphelpme user"
                            ToBeInserted.push(notify)

                        } else {
                            ToBeInserted.push(notify)
                        }
                    }
                }
            }
            else if (notificationData[data].notificationType === "UserSpecific" && notificationData[data].activity === "CommentBy") {

                if (PostData.post_id && PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();

                    let indicator = newArrayComments.find(a => a.toString() === notify.post_id._id.toString()) ? true : false
                    if (indicator === false) {
                        newArrayComments.push(notify.post_id._id)

                        if (notify.post_id.Comments.length > 1) {
                            notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(notify.post_id.Comments.length - 1) + " other grouphelpme user"
                            ToBeInserted.push(notify)

                        } else {
                            ToBeInserted.push(notify)
                        }
                    }
                }
            }
            else if (notificationData[data].notificationType === "UserSpecificComments" && notificationData[data].activity === "CommentLike") {

                let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());

                if (comments && comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    notify.comment = comments


                    let indicator = newArrayCommentLike.find(a => a.toString() === comments._id.toString()) ? true : false
                    if (indicator === false) {
                        newArrayCommentLike.push(comments._id)

                        if (comments.LikedBy.length > 1) {
                            notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(comments.LikedBy.length - 1) + " other grouphelpme user"
                            ToBeInserted.push(notify)

                        } else {
                            ToBeInserted.push(notify)
                        }
                    }
                }
            }
            else if (notificationData[data].notificationType === "UserSpecificComments" && notificationData[data].activity === "RepliedOnComment") {

                let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());

                //notificationData[data].activity === "RepliedOnComment") {
                if (comments && comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    notify.comment = comments

                    let indicator = newArrayReplyComment.find(a => a.toString() === comments._id.toString()) ? true : false
                    if (indicator === false) {
                        newArrayReplyComment.push(comments._id)

                        if (comments.ReplyComment.length > 1) {
                            notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(comments.ReplyComment.length - 1) + " other grouphelpme user"
                            ToBeInserted.push(notify)

                        } else {
                            ToBeInserted.push(notify)
                        }
                    }
                }
            }
            else if (notificationData[data].notificationType === "UserSpecificComments" && notificationData[data].activity === "RepliedOnCommentLike") {
                let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());
                let ReplycommentsData = comments.ReplyComment.find(id => id._id.toString() === notificationData[data].Replycomment_id.toString())

                if (ReplycommentsData && ReplycommentsData.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    notify.comment = comments;
                    notify.Replycomment = ReplycommentsData


                    let indicator = newArrayReplycommentsData.find(a => a.toString() === ReplycommentsData._id.toString()) ? true : false
                    if (indicator === false) {
                        newArrayReplycommentsData.push(ReplycommentsData._id)

                        if (ReplycommentsData.LikedBy.length > 1) {
                            notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(ReplycommentsData.LikedBy.length - 1) + " other grouphelpme user"
                            ToBeInserted.push(notify)

                        } else {
                            ToBeInserted.push(notify)
                        }
                    }

                }
            }
        }

        res.status(200).send({ message: "Notifications", result: ToBeInserted })

    } catch (err) {
      
        res.status(500).send({ error: "Category is not present in DB" });
    }
}




exports.getAllNotification = async (req, res, next) => {
    try {
        var newArrayLikes = [];
        var newArrayComments = [];
        var newArrayCommentLike = [];
        var newArrayReplyComment = [];
        var newArrayReplycommentsData = [];
        let ToBeInserted = []
        GroupData = await req.user.populate('joined_groups.groupid').execPopulate();

        groupData = GroupData.joined_groups.filter(a => a.groupid.group_type.toString() === "public")

        for (var data in groupData) {


            var notificationData = await NotificationModel.find({ group_id: groupData[data].groupid._id }).limit(50).sort('-createdAt').exec()
            notificationData = paginate(notificationData, parseInt(req.query.page_size + 4), req.query.page_number)

            for (var data in notificationData) {
                var userData = await notificationData[data].populate({ path: 'activity_by', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate();
                var PostData = await notificationData[data].populate('post_id').execPopulate();

                if (notificationData[data].notificationType === "all" && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {


                    var notify = notificationData[data].toObject();
                    ToBeInserted.push(notify)

                } else if (notificationData[data].notificationType === "UserSpecific" && notificationData[data].activity === "PostLikedBy") {

                    if (PostData.post_id && PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();

                        let indicator = newArrayLikes.find(a => a.toString() === notify.post_id._id.toString()) ? true : false
                        if (indicator === false) {  //activity
                            newArrayLikes.push(notify.post_id._id)

                            if (notify.post_id.likedBy.length > 1) {
                                notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(notify.post_id.likedBy.length - 1) + " other grouphelpme user"
                                ToBeInserted.push(notify)

                            } else {
                                ToBeInserted.push(notify)
                            }
                        }
                    }
                }
                else if (notificationData[data].notificationType === "UserSpecific" && notificationData[data].activity === "CommentBy") {

                    if (PostData.post_id && PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();

                        let indicator = newArrayComments.find(a => a.toString() === notify.post_id._id.toString()) ? true : false
                        if (indicator === false) {
                            newArrayComments.push(notify.post_id._id)

                            if (notify.post_id.Comments.length > 1) {
                                notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(notify.post_id.Comments.length - 1) + " other grouphelpme user"
                                ToBeInserted.push(notify)

                            } else {
                                ToBeInserted.push(notify)
                            }
                        }
                    }
                }
                else if (notificationData[data].notificationType === "UserSpecificComments" && notificationData[data].activity === "CommentLike") {

                    let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());

                    if (comments && comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();
                        notify.comment = comments


                        let indicator = newArrayCommentLike.find(a => a.toString() === comments._id.toString()) ? true : false
                        if (indicator === false) {
                            newArrayCommentLike.push(comments._id)

                            if (comments.LikedBy.length > 1) {
                                notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(comments.LikedBy.length - 1) + " other grouphelpme user"
                                ToBeInserted.push(notify)

                            } else {
                                ToBeInserted.push(notify)
                            }
                        }
                    }
                }
                else if (notificationData[data].notificationType === "UserSpecificComments" && notificationData[data].activity === "RepliedOnComment") {

                    let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());

                    //notificationData[data].activity === "RepliedOnComment") {
                    if (comments && comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();
                        notify.comment = comments

                        let indicator = newArrayReplyComment.find(a => a.toString() === comments._id.toString()) ? true : false
                        if (indicator === false) {
                            newArrayReplyComment.push(comments._id)

                            if (comments.ReplyComment.length > 1) {
                                notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(comments.ReplyComment.length - 1) + " other grouphelpme user"
                                ToBeInserted.push(notify)

                            } else {
                                ToBeInserted.push(notify)
                            }
                        }
                    }
                }
                else if (notificationData[data].notificationType === "UserSpecificComments" && notificationData[data].activity === "RepliedOnCommentLike") {
                    let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());
                    let ReplycommentsData = comments.ReplyComment.find(id => id._id.toString() === notificationData[data].Replycomment_id.toString())

                    if (ReplycommentsData && ReplycommentsData.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();
                        notify.comment = comments;
                        notify.Replycomment = ReplycommentsData


                        let indicator = newArrayReplycommentsData.find(a => a.toString() === ReplycommentsData._id.toString()) ? true : false
                        if (indicator === false) {
                            newArrayReplycommentsData.push(ReplycommentsData._id)

                            if (ReplycommentsData.LikedBy.length > 1) {
                                notify.activity_by.profile.full_name = notify.activity_by.profile.full_name + " and " + parseInt(ReplycommentsData.LikedBy.length - 1) + " other grouphelpme user"
                                ToBeInserted.push(notify)

                            } else {
                                ToBeInserted.push(notify)
                            }
                        }

                    }
                }
            }
        }


       let arr= ToBeInserted.sort((a, b) => b.createdAt - a.createdAt)

        res.status(200).send({ message: "Notifications", result: arr })

    } catch (err) {

        res.status(500).send({ error: "Category is not present in DB" });
    }
}


