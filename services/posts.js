var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
var postModel = require('./../model/posts');
var NotificationModel = require('./../model/notifications');
const CONSTANT = require('./../common/constant');
var s3BucketConfig = require('./../common/s3_bucket_config');
const expoNotification = require('./../common/expoSendNotifications');

//expoNotification.sendNotification()


exports.addNewPost = async (req, res, next) => {
    try {

        if (req.body.content === "video") {
            req.body.video = req.files[0].location.replace(CONSTANT.BucketURL,CONSTANT.CloudFrontURL);
        }
        else if (req.body.content === "document") {
            req.body.document = req.files[0].location.replace(CONSTANT.BucketURL,CONSTANT.CloudFrontURL);
        }
        else if (req.body.content === "image") {

            var ImagesUrl = []
            var imagesobject = req.files;
            for (var data in imagesobject) {
                ImagesUrl.push(imagesobject[data].location.replace(CONSTANT.BucketURL,CONSTANT.CloudFrontURL))

                req.body.image = ImagesUrl;
            }

        }

        savePostInDB(req, res)
    } catch (err) {
        
        res.status(500).send({ error: err });
    }
}

function savePostInDB(req, res,) {

    try {

        req.body.OnwerName = req.user.profile.full_name;
        req.body.OnwerProfilePic = req.user.profile.profile_pic;

        var PostData = new postModel(req.body);
        PostData.save(async (err, result) => {

            if (err) {

                
                res.status(400).send({ error: err })


            } else {
                var notify = {

                    group_id: req.body.GroupId,
                    activity_by: req.body.OnwerId,
                    activity: "NewPostAdded",
                    post_id: result._id,
                    notificationType: "all",
                    activity_byName: req.body.OnwerName,

                }
                var notificationData = new NotificationModel(notify);
                notificationData.save();
                res.status(201).send({ message: "Data saved successfully.", result: "", })
               
                var groupData= await groupModel.findById(notify.group_id)
    if(groupData.group_type==="private"){
        var notifyData = {

            group_id: notify.group_id,
            activity_by: notify.activity_by,
            activity: "NewPostAdded",
            post_id: notify.post_id,
            notificationType: "all",
            GroupName: groupData.GroupName,
            activity_byName:notify.activity_byName
        }
        
        expoNotification.sendNotification(notifyData)
    }
            }


        })

    } catch (err) {
                res.status(500).send({ error: err });
    }
}


exports.getAllPostofGroupFromNotification = async (req, res) => {
    try {
        const postData = await postModel.findById(req.params.id);
        await postData.populate("GroupId").execPopulate();


        let postdataObjectArray = [];

        let postdataObject = postData.toObject()
        postdataObject.countLikes = postData.likedBy.length;
        postdataObject.countcomments = postData.Comments.length;
        postdataObject.GroupName = postData.GroupId.GroupName;
        postdataObject.GroupOwnerId = postData.GroupId.owner_id;
        postdataObject.AllPublicFeed = true;
        postdataObject.Groupid = postData.GroupId._id;
        postdataObject.GroupAdmin = postData.GroupId.admin_id;
      
        await postData.GroupId.populate({ path: 'admin_id', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate();
        postdataObject.admin_id = postData.GroupId.admin_id;

        postdataObject.isLiked = postData.likedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
        postdataObject.currentUser = req.user._id;
        postdataObject.currentUserPic = req.user.profile.profile_pic;

        var userData = await postData.populate({ path: 'OnwerId', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()

        postdataObject.OnwerProfilePic = userData.OnwerId.profile.profile_pic;
        postdataObject.OnwerName = userData.OnwerId.profile.full_name;

        let toBeInserted = [];
        if (postData.likedBy.length !== 0) {

            const userData = await postData.populate({ path: 'likedBy', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()

            for (var i = 0; i < userData.likedBy.length; i++) {
                if (i <= 5) {

                    toBeInserted.push(userData.likedBy[i].profile.profile_pic);

                } else {
                    break;
                }

            }

        }
        postdataObject.LikePictures = toBeInserted
        delete postdataObject.GroupId
        postdataObjectArray.push(postdataObject)


        res.status(200).json({ message: "User as Admin: ", result: postdataObjectArray });
    } catch (err) {
        
        res.status(400).json({ message: err });
    }

}


exports.getAllPostofGroup = async (req, res) => {
    try {
        const group = await groupModel.findById(req.body.groupId);

        await group.populate({ path: 'posts', options: { sort: { createdAt: -1 }, limit: parseInt(req.query.limit), skip: parseInt(req.query.skip) } }).execPopulate();
        var postData = group.posts;

        let postdataObjectArray = [];
        for (var data in postData) {
            let postdataObject = postData[data].toObject();
            postdataObject.countLikes = postData[data].likedBy.length;
            postdataObject.countcomments = postData[data].Comments.length;
            postdataObject.GroupName = group.GroupName;

            postdataObject.GroupAdmin = group.admin_id;
            postdataObject.isLiked = postData[data].likedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
            postdataObject.currentUser = req.user._id;
            postdataObject.currentUserPic = req.user.profile.profile_pic;
            //To Be Changed
            var userData = await postData[data].populate({ path: 'OnwerId', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()

            postdataObject.OnwerProfilePic = userData.OnwerId.profile.profile_pic;
            postdataObject.OnwerName = userData.OnwerId.profile.full_name;

            let toBeInserted = [];
            if (postData[data].likedBy.length !== 0) {

                const userData = await postData[data].populate({ path: 'likedBy', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()

                for (var i = 0; i < userData.likedBy.length; i++) {
                    if (i <= 5) {

                        toBeInserted.push(userData.likedBy[i].profile.profile_pic);

                    } else {
                        break;
                    }

                }

            }
            postdataObject.LikePictures = toBeInserted

            postdataObjectArray.push(postdataObject)
        }

        res.status(200).json({ message: "User as Admin: ", result: postdataObjectArray });
    } catch (err) {
        
        res.status(400).json({ message: err });
    }

}






exports.getAllUserPostofGroup = async (req, res) => {
    try {
        const group = await groupModel.findById(req.body.groupId);

        const user = await UserModel.findById(req.user._id);
        await user.populate({ path: 'posts', options: { sort: { createdAt: -1 }, limit: parseInt(req.query.limit), skip: parseInt(req.query.skip) } }).execPopulate();

        var postData = user.posts.filter(a => a.GroupId.toString() === group._id.toString());

        let postdataObjectArray = [];
        for (var data in postData) {
            let postdataObject = postData[data].toObject();
            postdataObject.countLikes = postData[data].likedBy.length;
            postdataObject.countcomments = postData[data].Comments.length;
            postdataObject.GroupName = group.GroupName;
            postdataObject.GroupAdmin = group.admin_id;
            postdataObject.isLiked = postData[data].likedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
            postdataObject.currentUser = req.user._id;
            postdataObject.currentUserPic = req.user.profile.profile_pic;

            //To Be Changed

            postdataObject.OnwerProfilePic = req.user.profile.profile_pic;
            postdataObject.OnwerName = req.user.profile.full_name;

            let toBeInserted = [];
            if (postData[data].likedBy.length !== 0) {
                const userData = await postData[data].populate({ path: 'likedBy', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()
                for (var i = 0; i < userData.likedBy.length; i++) {
                    if (i <= 5) {

                        toBeInserted.push(userData.likedBy[i].profile.profile_pic);
                    } else {
                        break;
                    }
                }

            }
            postdataObject.LikePictures = toBeInserted

            postdataObjectArray.push(postdataObject)
        }

        res.status(200).json({ message: "User as Admin: ", result: postdataObjectArray });
    } catch (err) {
        
        res.status(400).json({ message: err });
    }

}


exports.deleteData = async (req, res) => {
    try {
        const postData = await postModel.findById(req.params.id);
        const RemovedData = await postModel.remove({ _id: req.params.id });
        res.status(200).json({ message: "Removed Group: ", result: RemovedData });
        if (postData.image && postData.image.length > 0) {
            var fileArr = postData.image;
            s3BucketConfig.removeMultipleFilesFromS3(fileArr, CONSTANT.PostMediaBucketName, function (err, data) {
                if (err) {
                    ;
                }
            });
        } else {
            var fileName = "";
            if (postData.video || postData.document) {
                fileName = postData.video ? postData.video : postData.document;
            }
            fileName = fileName.split('/').slice(-1)[0];
            if (fileName) {
                s3BucketConfig.removeFileFromS3(fileName, CONSTANT.PostMediaBucketName, function (err, res) {
                    if (err) {
                        ;
                    }
                });
            }
        }
        const RemoveNotification = await NotificationModel.deleteMany({ post_id: req.params.id });
    } catch (err) {
        
        res.status(400).json({ message: err });
    }
}


exports.deleteDataAndUserfromGroup = async (req, res) => {
    try {
        const postData = await postModel.findById(req.body.postId);
        const RemovedData = await postModel.remove({ _id: req.body.postId });

        const userdata = await UserModel.findOne({ _id: req.body.userId });

        userdata.joined_groups = userdata.joined_groups.filter((groupid) => {
            return groupid.groupid.toString() !== req.body.groupid
        })
        await userdata.save();

        if (req.body.isAdmin) {
           
            const groupdata = await groupModel.findOne({ _id: req.body.groupid });
         
            groupdata.admin_id = groupdata.admin_id.filter((groupid) => {
                return groupid.toString() !== req.body.userId
            })
            await groupdata.save();
        }

        res.status(200).json({ message: "Removed Group: ", result: "" });
        if (postData.image && postData.image.length > 0) {
            var fileArr = postData.image;
            s3BucketConfig.removeMultipleFilesFromS3(fileArr, CONSTANT.PostMediaBucketName, function (err, data) {
                if (err) {
                    ;
                }
            });
        } else {
            var fileName = "";
            if (postData.video || postData.document) {
                fileName = postData.video ? postData.video : postData.document;
            }
            fileName = fileName.split('/').slice(-1)[0];
            if (fileName) {
                s3BucketConfig.removeFileFromS3(fileName, CONSTANT.PostMediaBucketName, function (err, res) {
                    if (err) {
                        ;
                    }
                });
            }
        }
        const RemoveNotification = await NotificationModel.deleteMany({ post_id: req.body.postId })

        var notify = {

            group_id: req.body.groupid,
            activity_byName: req.user.profile.full_name,
            notificationType: "Deleted from Group",
            SelectedUsersExpoTokens: userdata.ExpopushToken

        }


        expoNotification.sendNotification(notify)
    } catch (err) {
        
        res.status(400).json({ message: err });
    }
}


exports.like = async (req, res) => {
    try {

        var PostId = req.body.PostId;
        var PostData = await postModel.findById(PostId);

        if (req.body.isLiked) {
            PostData.likedBy.push(req.user._id);

            PostData.save();
            res.status(200).send("Liked Array updated");

            var notify = {

                group_id: PostData.GroupId,
                activity_by: req.user._id,
                activity: "PostLikedBy",
                post_id: PostId,
                notificationType: "UserSpecific"

            }
            var notificationData = new NotificationModel(notify);
            notificationData.save();

            if(PostData.likedBy.length<10){
            expoNotification.sendNotification(notify)
            }

        } else {
            
            PostData.likedBy = PostData.likedBy.filter(a => a.toString() !== req.user._id.toString())
            PostData.save();
            res.status(200).send("Liked Array updated");
            const RemoveNotification = await NotificationModel.remove({ post_id: PostId, activity_by: req.user._id, activity: "PostLikedBy" })



        }


    } catch (err) {

        res.status(500).send({ error: "Something went wrong" });

    }
}


exports.viewlikes = async (req, res) => {
    try {

        var PostId = req.params.id;
        var PostData = await postModel.findById(PostId);
        LikedUser = []
        if (PostData.likedBy.length !== 0) {
            var userData = await PostData.populate({ path: 'likedBy', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()

            userData.likedBy = paginate(userData.likedBy, req.query.page_size, req.query.page_number)

            for (var data in userData.likedBy) {

                LikedUser.push(userData.likedBy[data]);
            }

        }


        res.status(200).send({ result: LikedUser });

    } catch (err) {
        
        res.status(500).send({ error: "Something went wrong" });

    }
}


exports.addNewComment = async (req, res) => {

    try {

        var comment = req.body.comment;

        var PostData = await postModel.findById(req.body.postId)

        PostData.Comments = PostData.Comments.concat({ comment: comment, LikedBy: [], OnwerId: req.user._id, createdAt: Date.now })//name: result.GroupName,

        PostData.save();



        var notify = {

            group_id: PostData.GroupId,
            activity_by: req.user._id,
            activity: "CommentBy",
            post_id: req.body.postId,
            notificationType: "UserSpecific",
            comment_id: req.body.commentId

        }
        res.status(200).send("Comments updated successfully");

        var notificationData = new NotificationModel(notify);
        notificationData.save();

        if(PostData.Comments.length<10){
            expoNotification.sendNotification(notify)
            }
      
    } catch (err) {
                res.status(500).send({ error: "Comments are not getting updated" });
    }
}

function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

exports.getComments = async (req, res) => {

    try {

        var PostId = req.params.id;

        var PostData = await postModel.findById(PostId)

        var Response = [];


        if (PostData.Comments.length !== 0) {

            PostData.Comments = paginate(PostData.Comments, req.query.page_size, req.query.page_number)

            for (var data in PostData.Comments) {

                let postdataObject = PostData.Comments[data].toObject();
                postdataObject.ReplyCount = PostData.Comments[data].ReplyComment.length;
                postdataObject.isLiked = PostData.Comments[data].LikedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
                postdataObject.likeCount = PostData.Comments[data].LikedBy.length;
                postdataObject.LikedBy = [];

                var UserData = await UserModel.findById(PostData.Comments[data].OnwerId);
                postdataObject.name = UserData.profile.full_name;
                postdataObject.image = UserData.profile.profile_pic;
                postdataObject.currentUserId = req.user._id;
                postdataObject.currentUserPic = req.user.profile.profile_pic;
                postdataObject.currentUseProfileName = req.user.profile.full_name;
                postdataObject.currentUserName = req.user.username;
                postdataObject.PostId = PostData._id;
                postdataObject.PostOwnerId = PostData.OnwerId;
                Response.push(postdataObject)

            }
        }
        res.status(200).send({ result: Response });

    } catch (err) {
                res.status(500).send({ error: "Not able to fetch comments" });
    }
}



exports.Commentslike = async (req, res) => {
    try {

        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId)

        var commentsData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)


        if (req.body.isLiked) {
            commentsData.LikedBy.push(req.user._id);
            PostData.save();
            res.status(200).send("Comment Liked Array updated");
            var notify = {

                group_id: PostData.GroupId,
                activity_by: req.user._id,
                activity: "CommentLike",
                post_id: req.body.postId,
                notificationType: "UserSpecificComments",
                comment_id: req.body.commentId
            }
            var notificationData = new NotificationModel(notify);
            notificationData.save();
            if(commentsData.LikedBy.length<10){
            expoNotification.sendNotification(notify)
            }
        } else {
            commentsData.LikedBy = commentsData.LikedBy.filter(a => a.toString() !== req.user._id.toString())
            PostData.save();
            res.status(200).send("Comment Liked Array updated");
            const RemoveNotification = await NotificationModel.remove({ post_id: PostId, comment_id: req.body.commentId, activity_by: req.user._id, activity: "CommentLike" })

        }

    } catch (err) {
        
        res.status(500).send({ error: "Something went wrong" });

    }
}



exports.viewCommentlikes = async (req, res) => {
    try {
    
        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId);

        var commentsData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)

        LikedUser = []
        if (commentsData.LikedBy.length !== 0) {

            commentsData.LikedBy = paginate(commentsData.LikedBy, req.query.page_size, req.query.page_number)

            for (var data in commentsData.LikedBy) {

                var userData = await UserModel.findById(commentsData.LikedBy[data], { username: 1, 'profile.full_name': 1, 'profile.profile_pic': 1 });
                LikedUser.push(userData);
            }

        }


        res.status(200).send({ result: LikedUser });

    } catch (err) {
        
        res.status(500).send({ error: "Something went wrong" });

    }
}




exports.deleteComment = async (req, res) => {
    try {

        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId);

        PostData.Comments = PostData.Comments.filter(id => id._id.toString() !== req.body.commentId)

        PostData.save();
        const RemoveNotification = await NotificationModel.deleteMany({ post_id: PostId, comment_id: req.body.commentId })
        res.status(200).send({ result: "" });

    } catch (err) {
        
        res.status(500).send({ error: "Something went wrong" });

    }
}



exports.getReplyComments = async (req, res) => {

    try {

        var PostId = req.body.postId;

        var PostData = await postModel.findById(PostId)

        var ReplyComments = PostData.Comments.find(id => id._id.toString() === req.body.commentId)
        var Response = [];



        if (ReplyComments.ReplyComment.length) {
            ReplyComments.ReplyComment = paginate(ReplyComments.ReplyComment, req.query.page_size, req.query.page_number)
            for (var data in ReplyComments.ReplyComment) {

                let postdataObject = ReplyComments.ReplyComment[data].toObject();
                postdataObject.isLiked = ReplyComments.ReplyComment[data].LikedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
                postdataObject.likeCount = ReplyComments.ReplyComment[data].LikedBy.length;
                postdataObject.LikedBy = [];
                var UserData = await UserModel.findById(ReplyComments.ReplyComment[data].OnwerId);
                postdataObject.name = UserData.profile.full_name;
                postdataObject.image = UserData.profile.profile_pic;
                postdataObject.currentUserId = req.user._id;

                postdataObject.currentUserPic = req.user.profile.profile_pic;
                postdataObject.currentUseProfileName = req.user.profile.full_name;
                postdataObject.currentUserName = req.user.username;
                postdataObject.PostId = PostData._id;
                postdataObject.PostOwnerId = PostData.OnwerId;
                postdataObject.CommentOwnerId = ReplyComments.OnwerId;
                postdataObject.CommentId = ReplyComments._id;


                Response.push(postdataObject)

            }
        }

        res.status(200).send({ result: Response });

    } catch (err) {
                res.status(500).send({ error: "Not able to fetch comments" });
    }
}




exports.addNewReplyComment = async (req, res) => {

    try {

        var comment = req.body.comment;

        var PostData = await postModel.findById(req.body.postId)

        var commentData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)

        commentData.ReplyComment = commentData.ReplyComment.concat({ comment: comment, LikedBy: [], OnwerId: req.user._id, createdAt: Date.now })//name: result.GroupName,

        PostData.save();
        res.status(200).send("Reply Comments updated successfully");
        var notify = {

            group_id: PostData.GroupId,
            activity_by: req.user._id,
            activity: "RepliedOnComment",
            post_id: req.body.postId,
            notificationType: "UserSpecificComments",
            comment_id: req.body.commentId
        }
        var notificationData = new NotificationModel(notify);
        notificationData.save();

        if(commentData.ReplyComment.length<10){
            expoNotification.sendNotification(notify)
        }
      
    } catch (err) {
                res.status(500).send({ error: "Comments are not getting updated" });
    }
}


exports.replyCommentslike = async (req, res) => {
    try {

        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId)

        var commentsData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)

        var ReplycommentsData = commentsData.ReplyComment.find(id => id._id.toString() === req.body.ReplycommentId)

        if (req.body.isLiked) {
            ReplycommentsData.LikedBy.push(req.user._id);

            PostData.save();
            res.status(200).send("Reply Comment Liked Array updated");

            var notify = {

                group_id: PostData.GroupId,
                activity_by: req.user._id,
                activity: "RepliedOnCommentLike",
                post_id: req.body.postId,
                notificationType: "UserSpecificComments",
                comment_id: req.body.commentId,
                Replycomment_id: req.body.ReplycommentId
            }
            var notificationData = new NotificationModel(notify);
            notificationData.save();

            if( ReplycommentsData.LikedBy.length<10){
                expoNotification.sendNotification(notify)
            }
         

        } else {
            ReplycommentsData.LikedBy = ReplycommentsData.LikedBy.filter(a => a.toString() !== req.user._id.toString())
            PostData.save();
            res.status(200).send("Reply Comment Liked Array updated");
        }


    } catch (err) {
        
        res.status(500).send({ error: "Something went wrong" });

    }
}



exports.viewReplyCommentlikes = async (req, res) => {
    try {

        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId);

        var commentsData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)

        var ReplycommentsData = commentsData.ReplyComment.find(id => id._id.toString() === req.body.ReplycommentId)

        LikedUser = []
        if (ReplycommentsData.LikedBy.length !== 0) {
            ReplycommentsData.LikedBy = paginate(ReplycommentsData.LikedBy, req.query.page_size, req.query.page_number)

            for (var data in ReplycommentsData.LikedBy) {

                var userData = await UserModel.findById(ReplycommentsData.LikedBy[data], { username: 1, 'profile.full_name': 1, 'profile.profile_pic': 1 });
                LikedUser.push(userData);
            }

        }


        res.status(200).send({ result: LikedUser });

    } catch (err) {
        
        res.status(500).send({ error: "Something went wrong" });

    }
}




exports.deleteReplyComment = async (req, res) => {
    try {

        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId);

        var commentsData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)


        commentsData.ReplyComment = commentsData.ReplyComment.filter(id => id._id.toString() !== req.body.ReplycommentId)


        PostData.save();
        const RemoveNotification = await NotificationModel.deleteMany({ post_id: PostId, Replycomment_id: req.body.ReplycommentId })
        res.status(200).send({ result: PostData });

    } catch (err) {
        
        res.status(500).send({ error: "Something went wrong" });

    }
}




exports.getAllPublicJoinedPostofGroup = async (req, res) => {
    try {
        let postdataObjectArray = [];
        for (var data in req.user.joined_groups) {


            const group = await groupModel.findById(req.user.joined_groups[data].groupid);
           

            if (group.group_type === 'public') {
                await group.populate({ path: 'posts', options: { sort: { createdAt: -1 }, limit: parseInt(req.query.limit), skip: parseInt(req.query.skip) } }).execPopulate();
                var postData = group.posts;
                  await group.populate({path:'admin_id',select: ['username', 'profile.full_name', 'profile.profile_pic']}).execPopulate()
                for (var data in postData) {
                    let postdataObject = postData[data].toObject();
                    postdataObject.countLikes = postData[data].likedBy.length;
                    postdataObject.countcomments = postData[data].Comments.length;
                    postdataObject.GroupName = group.GroupName;
                    postdataObject.GroupOwnerId = group.owner_id;
                    postdataObject.AllPublicFeed = true;
                    postdataObject.Groupid = group._id;
                    postdataObject.GroupAdmin = group.admin_id;
                 
                    postdataObject.admin_id = group.admin_id;
                    postdataObject.isLiked = postData[data].likedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
                    postdataObject.currentUser = req.user._id;
                    postdataObject.currentUserPic = req.user.profile.profile_pic;

                    var userData = await postData[data].populate({ path: 'OnwerId', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()

                    postdataObject.OnwerProfilePic = userData.OnwerId.profile.profile_pic;
                    postdataObject.OnwerName = userData.OnwerId.profile.full_name;


                    let toBeInserted = [];
                    if (postData[data].likedBy.length !== 0) {
                        const userData = await postData[data].populate({ path: 'likedBy', select: ['username', 'profile.full_name', 'profile.profile_pic'] }).execPopulate()
                        for (var i = 0; i < userData.likedBy.length; i++) {
                            if (i <= 5) {

                                toBeInserted.push(userData.likedBy[i].profile.profile_pic);
                                break;
                            }
                            else {
                                break;
                            }
                        }

                    }
                    postdataObject.LikePictures = toBeInserted

                    postdataObjectArray.push(postdataObject)
                }
            }
        }
        postdataObjectArray = postdataObjectArray.sort(function (a, b) {
            return b.GroupName.localeCompare(a.GroupName);

        });

        var arr = postdataObjectArray;
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);


        arr = arr.sort(function (a, b) {

            var time = new Date(a.time).getTime()
            var newtime = new Date(b.time).getTime()
            return newtime - time;
        });

        res.status(200).json({ message: "User as Admin: ", result: arr });
    } catch (err) {
        
        res.status(400).json({ message: err });
    }

}
