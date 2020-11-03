var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
const s3Config = require('./../common/s3_bucket_config');
var postModel = require('./../model/posts');
var NotificationModel = require('./../model/notifications');
const CONSTANT = require('./../common/constant');
const { response } = require('express');
const { compareSync } = require('bcrypt');
var s3BucketConfig = require('./../common/s3_bucket_config');

exports.addNewGroup = async (req, res, next) => {
    try {
        if (req.body.group_type === "public") {
            var categoryData = await CategoryModel.findOne({ _id: req.body.GroupCategory_id });
            req.body.GroupCategory = categoryData.title;
        }

        // //console.log(categoryData,"sssssssssssssssssssssssssss")
        //console.log("req.body", req.body);
        if (req.body.image) {
            s3Config.uploadFile(req.body.image, req.body.GroupName + "_" + req.user._id, CONSTANT.GroupProfilePictureBucketName)
                .then(picLocation => savegroupInDB(req, res, picLocation))
                .catch(function (e) {
                    //console.log("Failed to upload profile pic", e);
                    res.status(400).send({ error: "Failed to upload profile pic" });
                });

        }
        else {
            savegroupInDB(req, res, CONSTANT.PlaceholderImageUrl)
        }
    } catch (err) {

        res.status(500).send({ error: "Category is not present in DB" });
    }
}

function savegroupInDB(req, res, picLocation) {

    try {

        req.body.GroupAdminName = req.user.profile.full_name;
        req.body.image = picLocation;

        var groupData = new groupModel(req.body);



        groupData.save(async (err, result) => {
            //console.log("*****err", err);
            if (err) {

                //  if(err.errmsg){
                if (err.errors && err.errors.GroupName !== undefined) {

                    res.status(400).send({ error: "Group Name already exist" })
                }
                else {
                    console.log(err)
                    res.status(400).send({ error: "Something went wrong" })
                }

            } else {
                //  const user = await UserModel.findOne({_id:req.body.owner_id});
                //   const user = await UserModel.findByIdAndUpdate(req.body.owner_id, { joined_groups: { $push: {groupid: result._id,name:result.GroupName}} })
                req.user.joined_groups = req.user.joined_groups.concat({ groupid: result._id })//name: result.GroupName,GroupCategoryid: result.GroupCategory_id
                req.user.created_groups = req.user.created_groups.concat({ groupid: result._id })//name: result.GroupName 
                await req.user.save();

                res.status(201).send({ message: "Data saved successfully.", result, })


                //console.log(result, "Resultttttttttt")
            }

            // saved!
        })

    } catch (err) {

        res.status(500).send({ error: "Category is not present in DB" });
    }
}


exports.getPublicGroups = async (req, res) => {
    try {

        const groupData = await groupModel.find({ group_type: "public" });
        res.status(200).json({ message: "Data: ", result: groupData });
    } catch (err) {
        res.status(400).json({ error: err });
    }
}

function paginate(array, page_size, page_number) {
    // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }


exports.getPublicGroupsWithCategory = async (req, res) => {
    try {

        var groupData = await groupModel.find({ group_type: "public", GroupCategory_id: req.body.GroupCategory_id });
      
     

        groupData= paginate(groupData,req.query.page_size,req.query.page_number)
     
        for (var data in groupData) {
            groupData[data].isRequested = req.user.Requested_groups.find(a => a.groupid.toString() === groupData[data]._id.toString()) ? true : false;
            groupData[data].isJoined = req.user.joined_groups.find(a => a.groupid.toString() === groupData[data]._id.toString()) ? true : false;
           var count  = await groupData[data].populate('groupList').execPopulate();
             groupData[data].countMembers=count.groupList.length;
            //await UserModel.countDocuments({ "joined_groups.groupid": groupData[data]._id });
           
          await  groupData[data].populate(['admin_id']).execPopulate()
        }

        res.status(200).json({ message: "Data: ", result: groupData });
    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err });
    }
}


exports.deleteData = async (req, res) => {
    try {
        const GroupData = await groupModel.findById(req.params.id);
        const RemovedData = await groupModel.remove({ _id: req.params.id });
      


        const filename = GroupData.image.split('/').slice(-1)[0];

        s3Config.removeFileFromS3(filename, CONSTANT.GroupProfilePictureBucketName, function (err, res) {
            if (err) {
                console.log("Unable to delete older image from S3.");
            } else {
                console.log("Removed older image from S3 successfully.");
            }
        });

        const RemovedUserData = await UserModel.find({ "joined_groups.groupid": req.params.id });

        for (var id in RemovedUserData) {

            RemovedUserData[id].created_groups = RemovedUserData[id].created_groups.filter((groupid) => {
                return groupid.groupid.toString() !== req.params.id

            })
            RemovedUserData[id].joined_groups = RemovedUserData[id].joined_groups.filter((groupid) => {
                return groupid.groupid.toString() !== req.params.id
            })

            RemovedUserData[id].save();
        }


        res.status(200).json({ message: "Removed Group: ", result: "" });
//changed
        await GroupData.populate({ path: 'posts', options: { sort: { createdAt: -1 } } }).execPopulate();
        var postData = GroupData.posts;

        // const userData = await UserModel.findById(postdata[0].OnwerId);
        //   await user.populate('posts').execPopulate();
   
        for (var data in postData) {

            if(postData[data].image && postData[data].image.length > 0){
                var fileArr = postData[data].image;
                s3BucketConfig.removeMultipleFilesFromS3(fileArr, CONSTANT.PostMediaBucketName, function(err, data){
                    if(err){
                        console.log(err);
                    }
                });
            } else {
                var fileName = "";
                if(postData[data].video || postData[data].document){
                    fileName = postData[data].video ? postData[data].video : postData[data].document;
                }
                fileName = fileName.split('/').slice(-1)[0];
                if(fileName){
                    s3BucketConfig.removeFileFromS3(fileName, CONSTANT.PostMediaBucketName, function(err, res){
                        if(err){
                            console.log(err);
                        }
                    });
                }
            }
            const RemoveNotification= await NotificationModel.deleteMany({post_id:postData[data]._id});
        }
        await postModel.deleteMany({ GroupId: req.params.id })//changes
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.viewGroupMembers = async (req, res) => {
    try {

        const groupData = await groupModel.findOne({ _id: req.body.groupid });

        var filteredArray = await UserModel.find({ "joined_groups.groupid": groupData._id, });

       
        filteredArray= paginate(filteredArray,req.query.page_size,req.query.page_number)

        // const filteredArray = await UserModel.aggregate([
        //     { "$match": { "joined_groups.groupid": groupData._id } },

        //     { "$match": { "joined_groups.name": groupData.GroupName } }]);

        //let filteredArray = userData.filter((element) => element.joined_groups.some((groupid) => groupid.groupid.toString() === req.body.groupid.toString()));

        for (var data in filteredArray) {

            filteredArray[data].admin_id = groupData.admin_id;//.(groupData.admin_id)
            //  filteredArray[data].owner_id = groupData.owner_id;


        }
        //  filteredArray[data].subElements = {"groupid": groupid};
        // //console.log(groupData.admin_id,"ssss")
        //console.log(filteredArray)

        res.status(200).json({ message: "Group Members: ", result: filteredArray });
    } catch (err) {
       console.log(err)
        res.status(400).json({ message: err });
    }
}




exports.SendJoinRequest = async (req, res) => {
    try {

        if(req.body.privacy!=="Open Group"){
        req.user.Requested_groups = req.user.Requested_groups.concat({
            groupid:
                req.body.groupid,
            name:
                req.body.GroupName,
            requestMessage:
                req.body.requestMessage ? req.body.requestMessage : "Do you want to add the user to the group"

        })
    }else{
      
        req.user.joined_groups = req.user.joined_groups.concat({ groupid: req.body.groupid, GroupCategoryid: req.body.GroupCategory_id })//name: result.GroupName,
   

    }
        await req.user.save()

        res.status(200).json({ message: "Request Sent: ", result: req.user });
    } catch (err) {
        //console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.DeleteSentJoinRequest = async (req, res) => {
    try {

        req.user.Requested_groups = req.user.Requested_groups.filter((data) => {

            return data.groupid.toString() !== req.body.groupid

        })
        await req.user.save()

        res.status(200).json({ message: "Request Deleted: ", result: req.user });

    } catch (err) {
        //console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.getJoinedPublicGroups = async (req, res) => {
    try {

        var Response = []


        var Gdata = await req.user.populate({ path: 'createdgroup' }).execPopulate();
        var groupData = Gdata.createdgroup;

        groupData = groupData.filter(a => a.group_type.toString() === "public")

        // UserModel.aggregate ([{ $match: { isActive: true } }, 
        //     { $unwind: "$joined_groups" }, 
        //     { $group: { _id: "$joined_groups", joined_groupsid: { $addToSet: ["5f7ca461e90194533c8ee52f"] } } }, 
        //     { $unwind:"$joined_groups" }, 
        //     { $group : {_id : "$joined_groups.groupid", countMembers : {$sum : 1} } }
        //     ],function(err, res){
        //     console.log(res)
        //     })

        if (req.user.created_groups.length !== 0 && groupData.length !== 0) {

             //changed 
             groupData= paginate(groupData,req.query.page_size,req.query.page_number)

            let ToBeInserted = {
                GroupCategory: "Your Groups",
                data: []
            }
            for (var data in groupData) {

                // const groupData = await groupModel.findOne({ _id: req.user.created_groups[data].groupid });
                // //console.log(groupData)
                var count  = await groupData[data].populate('groupList').execPopulate();
                groupData[data].countMembers=count.groupList.length;
                await  groupData[data].populate(['admin_id']).execPopulate()
               //await UserModel.countDocuments({ "joined_groups.groupid": groupData[data]._id, });

                const groupObject = groupData[data].toObject()
                //  delete groupObject.GroupCategory_id;
                //  delete groupObject.admin_id;
                //  delete groupObject.owner_id;
                //  delete groupObject.__v;
                groupObject.currentUser = req.user._id;

                ToBeInserted.data.push({ groupObject })
            }

            Response.push(ToBeInserted)
        }


        var PGdata = await req.user.populate({ path: 'group' }).execPopulate();
        var postData = PGdata.group;

        postData = postData.filter(a => a.group_type.toString() === "public")


        if (req.user.joined_groups.length !== 0 && postData.length !== 0) {

              //changed
      
        postData= paginate(postData,req.query.page_size,req.query.page_number)

            var categoryData = await CategoryModel.find();
            for (var data in categoryData) {


                //    const groups = req.user.joined_groups.filter(a => a.GroupCategoryid.toString() === categoryData[data]._id.toString())


                const groups = postData.filter(a => a.GroupCategory_id.toString() === categoryData[data]._id.toString())

                if (groups.length !== 0) {

                    let ToBeInserted = {
                        GroupCategory: categoryData[data].title,
                        data: []
                    }

                    for (var groupDataArr in groups) {

                        //  const groupData = await groupModel.findOne({ _id: groups[groupid].groupid });

                        // const isPresent = groupData.owner_id.toString()===req.user._id?true:false;//groupData.owner_id.filter((a) => a.toString() === req.user._id.toString());
                        // console.log(ToBeInserted.data,"sssssssssss")
                        //if (isPresent.length === 0) {


                        if (groups[groupDataArr].owner_id.toString() !== req.user._id.toString()) {

                            var count  = await groups[groupDataArr].populate('groupList').execPopulate();
                            groups[groupDataArr].countMembers=count.groupList.length;
                         
                            //   groups[groupDataArr].countMembers =
                            // await UserModel.countDocuments({ "joined_groups.groupid": groups[groupDataArr]._id, });

                            await   groups[groupDataArr].populate(['admin_id']).execPopulate()
                            //const groupObject = groupData
                            // delete groupObject.GroupCategory_id;
                            // delete groupObject.admin_id;
                            // delete groupObject.owner_id;
                            // delete groupObject.__v;
                            const groupObject = groups[groupDataArr].toObject()
                            groupObject.currentUser = req.user._id;
                           

                            ToBeInserted.data.push({ groupObject })


                        }

                    }

                    if (ToBeInserted.data.length !== 0) {

                        Response.push(ToBeInserted)
                    }

                }

            }
        }


        res.status(200).json({ message: "Joined Groups : ", result: Response });

    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.updateGroupImage = async (req, res) => {
    try {

        s3Config.uploadFile(req.body.image, req.body.groupid + "_" + req.user._id, CONSTANT.GroupProfilePictureBucketName)
            .then(async picLocation => {

                var GroupID = req.body.groupid;
                var userVerified = await groupModel.findOneAndUpdate({
                    _id: GroupID,
                }, { $set: { image: picLocation } });

                const filename = userVerified.image.split('/').slice(-1)[0];
                     
                s3Config.removeFileFromS3(filename, CONSTANT.GroupProfilePictureBucketName, function (err, res) {
                    if (err) {
                        console.log("Unable to delete older image from S3.");
                    } else {
                        console.log("Removed older image from S3 successfully.");
                    }
                });
                res.status(200).send("Image Uploaded successfully");
                console.log(userVerified);
            })
            .catch(function (e) {
                console.log("Failed to upload profile pic", e);
                res.status(400).send({ error: "Failed to upload profile pic" });
            });

    } catch (err) {
        //console.log(err)
        res.status(500).send({ error: "Internal Server error" });

    }


}


exports.updateGroupinformation = async (req, res) => {
    try {

         if(req.body.group_type==="public"){
         
        var categoryData = await CategoryModel.findOne({ _id: req.body.GroupCategory_id });
        var GroupID = req.body.groupid;

        var GroupName = req.body.GroupName;
        var group_Bio = req.body.group_Bio;
        var privacy = req.body.privacy;
        var GroupCategory_id = req.body.GroupCategory_id;
        var GroupCategory = categoryData.title;

        var userVerified = await groupModel.update({
            _id: GroupID,
        }, { $set: { GroupName, group_Bio, privacy, GroupCategory_id, GroupCategory } });
        res.status(200).send("Image Uploaded successfully");
    }
    else{

     
        var GroupID = req.body.groupid;

        var GroupName = req.body.GroupName;
        var group_Bio = req.body.group_Bio;
     

        var userVerified = await groupModel.update({
            _id: GroupID,
        }, { $set: { GroupName, group_Bio  } });
        res.status(200).send("Image Uploaded successfully");

    }
        // //console.log("Failed to upload profile pic", e);   

    } catch (err) {
        //console.log(err)
        res.status(400).send({ error: "Failed to update Profile information" });
    }
}


exports.AdmindeleteUserfromtheGroup = async (req, res) => {
    try {

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


        res.status(200).json({ message: "Removed User from group: ", result: userdata });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }

}




exports.DismissUserAsAdmin = async (req, res) => {
    try {

        const groupdata = await groupModel.findOne({ _id: req.body.groupid });
        groupdata.admin_id = groupdata.admin_id.filter((groupid) => {
            return groupid.toString() !== req.body.userId
        })
        await groupdata.save();

        res.status(200).json({ message: "Dismiss User As Admin: ", result: groupdata });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }

}



exports.MakeUserAsAdmin = async (req, res) => {
    try {
        console.log(req.body.groupid)
        const groupdata = await groupModel.findOne({ _id: req.body.groupid });

        groupdata.admin_id.push(req.body.userId)
        await groupdata.save();

        res.status(200).json({ message: "User as Admin: ", result: groupdata });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }

}


//

exports.getAllGroupRequest = async (req, res) => {
    try {
        // const groupData = await groupModel.findById(req.body._id);

        const UserData = await UserModel.find({ "Requested_groups.groupid": req.body.groupId });

        res.status(200).json({ message: "Users Requested: ", result: UserData });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.confirmGroupRequest = async (req, res) => {
    try {
        // const groupData = await groupModel.findById(req.body._id);

        const UserData = await UserModel.findById(req.body.userId);

        UserData.joined_groups = UserData.joined_groups.concat({ groupid: req.body.groupId, GroupCategoryid: req.body.GroupCategory_id })//name: result.GroupName,


        UserData.Requested_groups = UserData.Requested_groups.filter((data) => {

            return data.groupid.toString() !== req.body.groupId

        })

        await UserData.save()

        res.status(200).json({ message: "Users Confirmed: ", result: UserData });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.removeGroupRequest = async (req, res) => {

    // const groupData = await groupModel.findById(req.body._id);
    try {
        const UserData = await UserModel.findById(req.body.userId);
        UserData.Requested_groups = UserData.Requested_groups.filter((data) => {

            return data.groupid.toString() !== req.body.groupId

        })
        await UserData.save()

        res.status(200).json({ message: "Request Deleted: ", result: UserData });

    } catch (err) {
        //console.log(err)
        res.status(400).json({ message: err });
    }
}



exports.leaveGroup = async (req, res) => {
    try {


        req.user.joined_groups = req.user.joined_groups.filter((groupid) => {
            return groupid.groupid.toString() !== req.body.groupid
        })


        await req.user.save();

        if (req.body.isAdmin) {
            const groupdata = await groupModel.findOne({ _id: req.body.groupid });
            groupdata.admin_id = groupdata.admin_id.filter((groupid) => {
                return groupid.toString() !== req.user._id
            })
            await groupdata.save();
        }


        res.status(200).json({ message: "Removed User from group: ", result: req.user });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}

exports.getJoinedPrivateGroups = async (req, res) => {

    try {

        var data = await req.user.populate({ path: 'group' }).execPopulate();
        var groupData = data.group;

        var response = []
        for (var data in groupData) {

            if (groupData[data].group_type.trim() === 'private') {
              
               // groupData[data].countMembers = await UserModel.countDocuments({ "joined_groups.groupid": groupData[data]._id, });
               var count  = await groupData[data].populate('groupList').execPopulate();
               await   groupData[data].populate(['admin_id']).execPopulate()
               groupData[data].countMembers=count.groupList.length;
                     
                const groupObject = groupData[data].toObject()
                groupObject.currentUser = req.user._id;

                response.push(groupObject)
            }

        }

        res.status(200).json({ message: "Joined Groups : ", result: response });

    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


// exports.getJoinedPrivateGroups = async (req, res) => {
//     try {

//         var Response = []



//         if (req.user.joined_groups.length !== 0) {

//                     for (var groupid in req.user.joined_groups) {

//                         const groupData = await groupModel.findOne({ _id: req.user.joined_groups[groupid].groupid });

//                         // const isPresent = groupData.owner_id.toString()===req.user._id?true:false;//groupData.owner_id.filter((a) => a.toString() === req.user._id.toString());
//                         // console.log(ToBeInserted.data,"sssssssssss")
//                         //if (isPresent.length === 0) {
//                         if (groupData.owner_id.toString() !== req.user._id.toString()) {

//                             groupData.countMembers = await UserModel.countDocuments({ "joined_groups.groupid": groupData._id, });


//                             const groupObject = groupData.toObject()
//                             // delete groupObject.GroupCategory_id;
//                             // delete groupObject.admin_id;
//                             // delete groupObject.owner_id;
//                             // delete groupObject.__v;

//                             groupObject.currentUser = req.user._id;
//                             ToBeInserted.data.push({ groupObject })


//                         }

//                     }

//                     if (ToBeInserted.data.length !== 0) {

//                         Response.push(ToBeInserted)
//                     }




//         }


//         res.status(200).json({ message: "Joined Groups : ", result: Response });

//     }catch (err) {
//         console.log(err)
//         res.status(400).json({ message: err });
//     }

// }


exports.groupSearchQuery = async (req, res) => {

    try {
  
        groupModel.aggregate(
            [
                // Match first to reduce documents to those where the array contains the match
                { "$match": {
                    "GroupName": { "$regex": req.body.groupSearchQuery, "$options": "i" }
                }},
        
                // Unwind to "de-normalize" the document per array element
                // { "$unwind": "$authors" },
        
                // Now filter those document for the elements that match
                { "$match": {
                    "group_type": 'public'
                }},
        
                { "$limit" : 10 }
        
        
                // Group back as an array with only the matching elements
                // { "$group": {
                //     "_id": "$_id",
                //     "GroupCategory": { "$first": "$GroupCategory" },
                //     "GroupName": { "$first": "$GroupName" },
                //     "groupIcon": { "$first": "$image" },
                // }}
            ],
          async  function(err,results) {
                if(err){
                    console.log(err)
                    res.status(400).json({ message: err });
                }else{
                  //  console.log(results)

                  for (var data in results) {
                      var groupCategoryImage= await CategoryModel.findById(results[data].GroupCategory_id)
                  
                     
                      results[data].isJoined = req.user.joined_groups.find(a => a.groupid.toString() === results[data]._id.toString()) ? true : false;
                      results[data].CategoryImage=groupCategoryImage.image

                   
                }
               
                    res.status(200).json({ message: "Joined Groups : ", result:results});
                }
            }
        )
        
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}

