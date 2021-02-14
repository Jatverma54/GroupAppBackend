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
        var notificationData = await NotificationModel.find({ group_id: req.params.id }).sort('-createdAt').exec()
        notificationData= paginate(notificationData,req.query.page_size,req.query.page_number)
       
        let ToBeInserted = []

        for (var data in notificationData) {
            var userData = await notificationData[data].populate({path:'activity_by',select:['username','profile.full_name','profile.profile_pic']}).execPopulate();
            var PostData = await notificationData[data].populate('post_id').execPopulate();

            if (notificationData[data].notificationType === "all" && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {


                var notify = notificationData[data].toObject();
                ToBeInserted.push(notify)

            } else if (notificationData[data].notificationType === "UserSpecific") {

                if (PostData.post_id&&PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    ToBeInserted.push(notify)
                }
            }
            else if (notificationData[data].notificationType === "UserSpecificComments") {

                let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());

                 if (notificationData[data].activity === "CommentLike"||notificationData[data].activity === "RepliedOnComment") {
                if (comments&&comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    notify.comment = comments

                    ToBeInserted.push(notify)
                }
            }
                else if (notificationData[data].activity === "RepliedOnCommentLike") {
                    let ReplycommentsData = comments.ReplyComment.find(id => id._id.toString() === notificationData[data].Replycomment_id.toString())
               
                    if (ReplycommentsData&&ReplycommentsData.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                        var notify = notificationData[data].toObject();
                        notify.comment = comments;
                        notify.Replycomment = ReplycommentsData


                        ToBeInserted.push(notify)
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
        let ToBeInserted = []
        GroupData =await req.user.populate('joined_groups.groupid').execPopulate();
    
        groupData = GroupData.joined_groups.filter(a => a.groupid.group_type.toString() === "public")

        for (var data in groupData) {
           
           
            var notificationData = await NotificationModel.find({ group_id:groupData[data].groupid._id  }).limit(50).sort('-createdAt').exec()
            notificationData= paginate(notificationData,req.query.page_size,req.query.page_number)

        for (var data in notificationData) {
            var userData = await notificationData[data].populate({path:'activity_by',select:['username','profile.full_name','profile.profile_pic']}).execPopulate();
            var PostData = await notificationData[data].populate('post_id').execPopulate();

            if (notificationData[data].notificationType === "all" && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {


                var notify = notificationData[data].toObject();
                ToBeInserted.push(notify)

            } else if (notificationData[data].notificationType === "UserSpecific") {

                if (PostData.post_id&&PostData.post_id.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    ToBeInserted.push(notify)
                }
            }
            else if (notificationData[data].notificationType === "UserSpecificComments") {

                let comments = PostData.post_id.Comments.find(a => a._id.toString() === notificationData[data].comment_id.toString());

                if (notificationData[data].activity === "CommentLike"||notificationData[data].activity === "RepliedOnComment") {
                if (comments&&comments.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
                    var notify = notificationData[data].toObject();
                    notify.comment = comments

                    ToBeInserted.push(notify)
                }
            }
                else if (notificationData[data].activity === "RepliedOnCommentLike") {
                    let ReplycommentsData = comments.ReplyComment.find(id => id._id.toString() === notificationData[data].Replycomment_id.toString())
                    if (ReplycommentsData&&ReplycommentsData.OnwerId.toString() === req.user._id.toString() && req.user._id.toString() !== notificationData[data].activity_by._id.toString()) {
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
   
    } catch (err) {
        
        res.status(500).send({ error: "Category is not present in DB" });
    }
}


