var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
var postModel = require('./../model/posts');
var NotificationModel = require('./../model/notifications');

exports.addNewPost = async (req, res, next) => {
    try {

        // console.log(categoryData,"sssssssssssssssssssssssssss")
        // console.log("req.body",file);
        //changed
        // if (req.body.image.length != 0 || req.body.video || req.body.document) {
        //     console.log("req.body", req.body.video);
        //     uploadFile(req.body.video, req.body.GroupId, CONSTANT.GroupProfilePictureBucketName)
        //         .then(picLocation => savePostInDB(req, res, picLocation))
        //         .catch(function (e) {
        //             //console.log("Failed to upload profile pic", e);

        //             res.status(400).send({ error: "Failed to upload profile pic" });
        //         });

        // }
        // else {
        //     savePostInDB(req, res)
        // }

        if (req.body.content === "video") {
            req.body.video = req.files[0].location;
        }
        else if (req.body.content === "document") {
            req.body.document = req.files[0].location;
        }
        else if (req.body.content === "image") {
            console.log(req.files)
            var ImagesUrl = []
            var imagesobject = req.files;
            for (var data in imagesobject) {
                ImagesUrl.push(imagesobject[data].location)

                req.body.image = ImagesUrl;
            }

        }

        savePostInDB(req, res)
    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Category is not present in DB" });
    }
}

function savePostInDB(req, res,) {

    try {

        req.body.OnwerName = req.user.profile.full_name;
        req.body.OnwerProfilePic = req.user.profile.profile_pic;

        // req.body.GroupId = req.body.GroupId;
        // req.body.postMetaData =req.body.postMetaData;
        // req.body.OnwerId = req.body.OnwerId;
        // req.body.createdAt = req.body.createdAt;



        var PostData = new postModel(req.body);



        PostData.save(async (err, result) => {
            //console.log("*****err", err);
            if (err) {

                console.log("*****err", err);

                res.status(400).send({ error: "Something went wrong" })


            } else {
                var notify = {

                    group_id: req.body.GroupId,
                    activity_by: req.body.OnwerId,
                    activity: "NewPostAdded",
                    post_id: result._id,
                    notificationType: "all"
                   
                }
                var notificationData = new NotificationModel(notify);
                notificationData.save();
                res.status(201).send({ message: "Data saved successfully.", result, })
                //console.log(result, "Resultttttttttt")
            }


        })

    } catch (err) {
        console.log("*****err", err);
        res.status(500).send({ error: "Category is not present in DB" });
    }
}


exports.getAllPostofGroup = async (req, res) => {
    try {
        const group = await groupModel.findById(req.body.groupId);

        await group.populate({ path: 'posts', options: { sort: { time: -1 } } }).execPopulate();
        var postData = group.posts;

        // const userData = await UserModel.findById(postdata[0].OnwerId);
        //   await user.populate('posts').execPopulate();
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
            var userData = await postData[data].populate('OnwerId').execPopulate()

            // var userData=await UserModel.findById(postdataObject.OnwerId);
            postdataObject.OnwerProfilePic = userData.OnwerId.profile.profile_pic;
            postdataObject.OnwerName = userData.OnwerId.profile.full_name;

            // postdataObject.currentUser = req.user._id;
            let toBeInserted = [];
            if (postData[data].likedBy.length !== 0) {

                const userData = await postData[data].populate(['likedBy']).execPopulate()

                for (var i = 0; i < userData.likedBy.length; i++) {
                    if (i <= 5) {

                        // console.log(userData)
                        //await UserModel.findById(postData[data].likedBy[i]);
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
        console.log(err)
        res.status(400).json({ message: err });
    }

}



exports.getAllUserPostofGroup = async (req, res) => {
    try {
        const group = await groupModel.findById(req.body.groupId);
        // await group.populate('posts').execPopulate();
        // var postData = group.posts;
        const user = await UserModel.findById(req.user._id);
        await user.populate({ path: 'posts', options: { sort: { time: -1 } } }).execPopulate();

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
                const userData = await postData[data].populate(['likedBy']).execPopulate()
                for (var i = 0; i < userData.likedBy.length; i++) {
                    if (i <= 5) {
                        //   const userData = await UserModel.findById(postData[data].likedBy[i]);
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
        console.log(err)
        res.status(400).json({ message: err });
    }

}


exports.deleteData = async (req, res) => {
    try {
        const RemovedData = await postModel.remove({ _id: req.params.id });
        const RemoveNotification= await NotificationModel.deleteMany({post_id:req.params.id})

        res.status(200).json({ message: "Removed Group: ", result: RemovedData });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.deleteDataAndUserfromGroup = async (req, res) => {
    try {
        const RemovedData = await postModel.remove({ _id: req.body.postId });

         const RemoveNotification= await NotificationModel.deleteMany({post_id:req.body.postId})

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

        res.status(200).json({ message: "Removed Group: ", result: RemovedData });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.like = async (req, res) => {
    try {

        var PostId = req.body.PostId;
        var PostData = await postModel.findById(PostId);

        if (req.body.isLiked) {
            PostData.likedBy.push(req.user._id);

            var notify = {

                group_id: PostData.GroupId,
                activity_by: req.user._id,
                activity: "PostLikedBy",
                post_id: PostId,
                notificationType: "UserSpecific"
               
            }
            var notificationData = new NotificationModel(notify);
            notificationData.save();

        } else {
            PostData.likedBy = PostData.likedBy.filter(a => a.toString() !== req.user._id.toString())

            const RemoveNotification= await NotificationModel.remove({post_id:PostId, activity_by: req.user._id, activity: "PostLikedBy"})
           
        }

        PostData.save();
        res.status(200).send("Liked Array updated");

    } catch (err) {
        //console.log(err)
        res.status(500).send({ error: "Something went wrong" });

    }
}


exports.viewlikes = async (req, res) => {
    try {

        var PostId = req.params.id;
        var PostData = await postModel.findById(PostId);
        LikedUser = []
        if (PostData.likedBy.length !== 0) {
              const userData =await PostData.populate(['likedBy']).execPopulate()
         
            for (var data in userData.likedBy) {

              //  var userData = await UserModel.findById(PostData.likedBy[data]);
                LikedUser.push(userData.likedBy[data]);
            }

        }


        res.status(200).send({ result: LikedUser });

    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Something went wrong" });

    }
}


exports.addNewComment = async (req, res) => {

    try {

        var comment = req.body.comment;

        var PostData = await postModel.findById(req.body.postId)

        PostData.Comments = PostData.Comments.concat({ comment: comment, LikedBy: [], OnwerId: req.user._id, createdAt: new Date() })//name: result.GroupName,

        PostData.save();



        var notify = {

            group_id: PostData.GroupId,
            activity_by: req.user._id,
            activity: "CommentBy",
            post_id: req.body.postId,
            notificationType: "UserSpecific",
            comment_id:req.body.commentId
           
        }
        var notificationData = new NotificationModel(notify);
        notificationData.save();
        res.status(200).send("Comments updated successfully");

    } catch (err) {
        console.log("*****err", err);
        res.status(500).send({ error: "Comments are not getting updated" });
    }
}


exports.getComments = async (req, res) => {

    try {

        var PostId = req.params.id;

        var PostData = await postModel.findById(PostId)

        var Response = [];
        if (PostData.Comments.length !== 0) {
            for (var data in PostData.Comments) {

                let postdataObject = PostData.Comments[data].toObject();
                // postdataObject.comment=PostData.Comments[data].comment;
                //  postdataObject._id=PostData.Comments[data]._id;

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
        console.log("*****err", err);
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

            var notify = {

                group_id: PostData.GroupId,
                activity_by: req.user._id,
                activity: "CommentLike",
                post_id: req.body.postId,
                notificationType: "UserSpecificComments",
                comment_id:req.body.commentId
            }
            var notificationData = new NotificationModel(notify);
            notificationData.save();

        } else {
            commentsData.LikedBy = commentsData.LikedBy.filter(a => a.toString() !== req.user._id.toString())
            const RemoveNotification= await NotificationModel.remove({post_id:PostId,comment_id:req.body.commentId, activity_by: req.user._id, activity: "CommentLike"})
        }

        PostData.save();
        res.status(200).send("Comment Liked Array updated");

    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Something went wrong" });

    }
}



exports.viewCommentlikes = async (req, res) => {
    try {
        console.log(req.body.postId)
        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId);

        var commentsData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)

        LikedUser = []
        if (commentsData.LikedBy.length !== 0) {

            for (var data in commentsData.LikedBy) {

                var userData = await UserModel.findById(commentsData.LikedBy[data]);
                LikedUser.push(userData);
            }

        }


        res.status(200).send({ result: LikedUser });

    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Something went wrong" });

    }
}




exports.deleteComment = async (req, res) => {
    try {

        var PostId = req.body.postId;
        var PostData = await postModel.findById(PostId);

        PostData.Comments = PostData.Comments.filter(id => id._id.toString() !== req.body.commentId)

        PostData.save();
        const RemoveNotification= await NotificationModel.deleteMany({post_id:PostId, comment_id:req.body.commentId})
        res.status(200).send({ result: PostData });

    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Something went wrong" });

    }
}



exports.getReplyComments = async (req, res) => {

    try {

        var PostId = req.body.postId;

        var PostData = await postModel.findById(PostId)

        var ReplyComments = PostData.Comments.find(id => id._id.toString() === req.body.commentId)
        //   if(PostData.Comments.length!==0){
        var Response = [];



        if (ReplyComments.ReplyComment.length) {
            for (var data in ReplyComments.ReplyComment) {

                let postdataObject = ReplyComments.ReplyComment[data].toObject();
                // postdataObject.comment=PostData.Comments[data].comment;
                //  postdataObject._id=PostData.Comments[data]._id;


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
        console.log("*****err", err);
        res.status(500).send({ error: "Not able to fetch comments" });
    }
}




exports.addNewReplyComment = async (req, res) => {

    try {

        var comment = req.body.comment;

        var PostData = await postModel.findById(req.body.postId)

        var commentData = PostData.Comments.find(id => id._id.toString() === req.body.commentId)

        commentData.ReplyComment = commentData.ReplyComment.concat({ comment: comment, LikedBy: [], OnwerId: req.user._id, createdAt: new Date() })//name: result.GroupName,

        PostData.save();

        var notify = {

            group_id: PostData.GroupId,
            activity_by: req.user._id,
            activity: "RepliedOnComment",
            post_id: req.body.postId,
            notificationType: "UserSpecificComments",
            comment_id:req.body.commentId
        }
        var notificationData = new NotificationModel(notify);
        notificationData.save();



        res.status(200).send("Reply Comments updated successfully");

    } catch (err) {
        console.log("*****err", err);
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
            
        var notify = {

            group_id: PostData.GroupId,
            activity_by: req.user._id,
            activity: "RepliedOnCommentLike",
            post_id: req.body.postId,
            notificationType: "UserSpecificComments",
            comment_id:req.body.commentId,
            Replycomment_id:req.body.ReplycommentId
        }
        var notificationData = new NotificationModel(notify);
        notificationData.save();
        
        } else {
            ReplycommentsData.LikedBy = ReplycommentsData.LikedBy.filter(a => a.toString() !== req.user._id.toString())
        }

        PostData.save();



        res.status(200).send("Reply Comment Liked Array updated");

    } catch (err) {
        console.log(err)
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

            for (var data in ReplycommentsData.LikedBy) {

                var userData = await UserModel.findById(ReplycommentsData.LikedBy[data]);
                LikedUser.push(userData);
            }

        }


        res.status(200).send({ result: LikedUser });

    } catch (err) {
        console.log(err)
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

        res.status(200).send({ result: PostData });

    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Something went wrong" });

    }
}




exports.getAllPublicJoinedPostofGroup = async (req, res) => {
    try {
        let postdataObjectArray = [];
        for (var data in req.user.joined_groups) {


            const group = await groupModel.findById(req.user.joined_groups[data].groupid);

            if (group.group_type === 'public') {
                await group.populate({ path: 'posts', options: { sort: { time: -1 } } }).execPopulate();
                var postData = group.posts;
                // const userData = await UserModel.findById(postdata[0].OnwerId);
                //   await user.populate('posts').execPopulate();

                for (var data in postData) {
                    let postdataObject = postData[data].toObject();
                    postdataObject.countLikes = postData[data].likedBy.length;
                    postdataObject.countcomments = postData[data].Comments.length;
                    postdataObject.GroupName = group.GroupName;
                    postdataObject.AllPublicFeed = true;
                    postdataObject.Groupid = group._id;
                    postdataObject.GroupAdmin = group.admin_id;
                    postdataObject.admin_id = group.admin_id;
                    postdataObject.isLiked = postData[data].likedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
                    postdataObject.currentUser = req.user._id;
                    postdataObject.currentUserPic = req.user.profile.profile_pic;
                    // postdataObject.currentUser = req.user._id;

                    //To Be Changed
                    // var userData=await UserModel.findById(postdataObject.OnwerId);

                    var userData = await postData[data].populate('OnwerId').execPopulate()

                    postdataObject.OnwerProfilePic = userData.OnwerId.profile.profile_pic;
                    postdataObject.OnwerName = userData.OnwerId.profile.full_name;


                    let toBeInserted = [];
                    if (postData[data].likedBy.length !== 0) {
                        const userData = await postData[data].populate(['likedBy']).execPopulate()
                        for (var i = 0; i < userData.likedBy.length; i++) {
                            if (i <= 5) {
                                //  const userData = await UserModel.findById(postData[data].likedBy[i]);
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

        res.status(200).json({ message: "User as Admin: ", result: postdataObjectArray });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }

}




// exports.getAllPersonalPostofGroup = async (req, res) => {
//     try {
//         const group = await groupModel.findById(req.body.groupId);

//         await group.populate({ path: 'posts', options: { sort: { time: -1 } } }).execPopulate();
//         var postData = group.posts;
//         // const userData = await UserModel.findById(postdata[0].OnwerId);
//         //   await user.populate('posts').execPopulate();
//         let postdataObjectArray = [];
//         let GroupMembers=''
//         for (var data in postData) {
//             let postdataObject = postData[data].toObject();
//             postdataObject.countLikes = postData[data].likedBy.length;
//             postdataObject.countcomments = postData[data].Comments.length;
//             postdataObject.GroupName = group.GroupName;
//             postdataObject.GroupAdmin = group.admin_id;
//             postdataObject.isLiked = postData[data].likedBy.find(a => a.toString() === req.user._id.toString()) ? true : false;
//             postdataObject.currentUser = req.user._id;
//             postdataObject.currentUserPic = req.user.profile.profile_pic;
//             // postdataObject.currentUser = req.user._id;
//             let toBeInserted = [];
//             if (postData[data].likedBy.length !== 0) {

//                 for (var i = 0; i < postData[data].likedBy.length; i++) {
//                     if (i <= 5) {
//                         const userData = await UserModel.findById(postData[data].likedBy[i]);
//                         toBeInserted.push(userData.profile.profile_pic);
//                     }
//                 }

//             }
//             postdataObject.LikePictures = toBeInserted

//             postdataObjectArray.push(postdataObject)
//         }

//          GroupMembers = await UserModel.find({ "joined_groups.groupid": group._id, });

//          postdataObjectArray.push({"GroupMembers":GroupMembers})


//         res.status(200).json({ message: "User as Admin: ", result: postdataObjectArray });
//     } catch (err) {
//         console.log(err)
//         res.status(400).json({ message: err });
//     }

// }


// exports.uploadMultipleImages = async (req, res, next) => {
//     try {

//         // console.log(categoryData,"sssssssssssssssssssssssssss")
//         // console.log("req.body",file);
//       // console.log(req)
//     } catch (err) {
//         console.log(err)
//         res.status(500).send({ error: "Category is not present in DB" });
//     }
// }
