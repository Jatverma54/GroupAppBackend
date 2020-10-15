var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
var postModel = require('./../model/posts');
var NotificationModel = require('./../model/notifications');

exports.getNotification = async (req, res, next) => {
    try {

        var notificationData = await NotificationModel.find({ group_id: req.params.id }).sort('-Createddate').exec()

        let ToBeInserted = []

        for (var data in notificationData) {
            var userData = await notificationData[data].populate('activity_by').execPopulate();
            var PostData = await notificationData[data].populate('post_id').execPopulate();

            if (notificationData[data].notificationType === "all" && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {


                var notify = notificationData[data].toObject();
                ToBeInserted.push(notify)

            } else if (notificationData[data].notificationType === "UserSpecific") {

                if (PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    ToBeInserted.push(notify)
                }
            }
            else if (notificationData[data].notificationType === "UserSpecificComments") {

                let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());


                if (comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    notify.comment = comments

                    ToBeInserted.push(notify)
                }
                else if (notificationData[data].activity === "RepliedOnCommentLike") {
                    let ReplycommentsData = comments.ReplyComment.find(id => id._id.toString() === notificationData[data].Replycomment_id.toString())
                    if (ReplycommentsData.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();
                        notify.comment = comments;
                        notify.Replycomment = ReplycommentsData


                        ToBeInserted.push(notify)
                    }
                }

            }
        }

        res.status(200).send({ message: "Notifications", result: ToBeInserted })

        //   if(PostData.image.length!==0){
        //     notify.attachment=PostData.image[0];
        //   }
        //  else if(PostData.document){
        //     notify.attachment=PostData.document;
        // }
        // else if(PostData.video){
        //     notify.attachment=PostData.video;  
        // }else{
        //     notify.attachment=null;  
        // }


    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Category is not present in DB" });
    }
}




exports.getAllNotification = async (req, res, next) => {
    try {
        let ToBeInserted = []
        for (var data in req.user.joined_groups) {


            var notificationData = await NotificationModel.find({ group_id:req.user.joined_groups[data].groupid  }).sort('-Createddate').exec()
           

        for (var data in notificationData) {
            var userData = await notificationData[data].populate('activity_by').execPopulate();
            var PostData = await notificationData[data].populate('post_id').execPopulate();

            if (notificationData[data].notificationType === "all" && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {


                var notify = notificationData[data].toObject();
                ToBeInserted.push(notify)

            } else if (notificationData[data].notificationType === "UserSpecific") {

                if (PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    ToBeInserted.push(notify)
                }
            }
            else if (notificationData[data].notificationType === "UserSpecificComments") {

                let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());


                if (comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    notify.comment = comments

                    ToBeInserted.push(notify)
                }
                else if (notificationData[data].activity === "RepliedOnCommentLike") {
                    let ReplycommentsData = comments.ReplyComment.find(id => id._id.toString() === notificationData[data].Replycomment_id.toString())
                    if (ReplycommentsData.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();
                        notify.comment = comments;
                        notify.Replycomment = ReplycommentsData


                        ToBeInserted.push(notify)
                    }
                }

            }
        }
    }
        res.status(200).send({ message: "Notifications", result: ToBeInserted })

        //   if(PostData.image.length!==0){
        //     notify.attachment=PostData.image[0];
        //   }
        //  else if(PostData.document){
        //     notify.attachment=PostData.document;
        // }
        // else if(PostData.video){
        //     notify.attachment=PostData.video;  
        // }else{
        //     notify.attachment=null;  
        // }

   
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Category is not present in DB" });
    }
}


