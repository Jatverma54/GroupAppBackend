var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
const uploadFile = require('./../common/s3_bucket_config');
const CONSTANT = require('./../common/constant');


exports.addNewGroup = async (req, res, next) => {
    try {
        var categoryData = await CategoryModel.findOne({ _id: req.body.GroupCategory_id });
       // //console.log(categoryData,"sssssssssssssssssssssssssss")
        //console.log("req.body", req.body);
        if(req.body.image){
            uploadFile(req.body.image, req.body.GroupName+"_"+req.user._id,CONSTANT.GroupProfilePictureBucketName)
            .then(picLocation => savegroupInDB(req, res, picLocation,categoryData))
            .catch(function(e){
                //console.log("Failed to upload profile pic", e);
                res.status(400).send({error:"Failed to upload profile pic" });
            });

        }
     else {
        savegroupInDB(req, res, CONSTANT.PlaceholderImageUrl,categoryData)
    }
          } catch (err) {

        res.status(500).send({ error: "Category is not present in DB" });
    }
}

 function savegroupInDB  (req, res, picLocation,categoryData){
   
     try{
    req.body.GroupCategory = categoryData.title;
    req.body.GroupAdminName = req.user.profile.full_name;
    req.body.image = picLocation;

    var groupData = new groupModel(req.body);



    groupData.save(async (err, result) => {
        //console.log("*****err", err);
        if (err) {

            //  if(err.errmsg){
            if (err.errors.GroupName !== undefined) {
                res.status(400).send({ error: "Group Name already exist" })
            }
            else {
                res.status(400).send({ error: "Something went wrong" })
            }

        } else {
            //  const user = await UserModel.findOne({_id:req.body.owner_id});
            //   const user = await UserModel.findByIdAndUpdate(req.body.owner_id, { joined_groups: { $push: {groupid: result._id,name:result.GroupName}} })
            req.user.joined_groups = req.user.joined_groups.concat({ groupid: result._id,  GroupCategoryid: result.GroupCategory_id })//name: result.GroupName,
            req.user.created_groups = req.user.created_groups.concat({ groupid: result._id})//name: result.GroupName 
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


exports.getPublicGroupsWithCategory = async (req, res) => {
    try {

        var groupData = await groupModel.find({ group_type: "public", GroupCategory_id: req.body.GroupCategory_id });

        //   const userData = await UserModel.find();

        // const userData = await UserModel.aggregate([
        //     { "$match": { "joined_groups.groupid": item._id } },

        //     { "$match": { "joined_groups.name": item.GroupName } }]);;

        for (var data in groupData) {
            groupData[data].isRequested = req.user.Requested_groups.find(a => a.groupid.toString() === groupData[data]._id.toString()) ? true : false;
            groupData[data].isJoined = req.user.joined_groups.find(a => a.groupid.toString() === groupData[data]._id.toString()) ? true : false;
            groupData[data].countMembers = await UserModel.countDocuments({ "joined_groups.groupid": groupData[data]._id });

        }

        //  groupData = groupData.map(  item => {
        //    item.isRequested =  req.user.Requested_groups.find(a=>a.groupid.toString()===item._id.toString())?true:false;
        //    item.isJoined =  req.user.joined_groups.find(a=>a.groupid.toString()===item._id.toString())?true:false;  
        //     // let filteredArray = userData.filter((element) => element.joined_groups.some((groupid) => groupid.groupid.toString() === item._id.toString()));
        //     //  item.countMembers=filteredArray.length;
        //    return item;    
        //         });



        res.status(200).json({ message: "Data: ", result: groupData });
    } catch (err) {
        //console.log(err)
        res.status(400).json({ error: err });
    }
}


exports.deleteData = async (req, res) => {
    try {
       const RemovedData = await groupModel.remove({ _id: req.params.id });
       
        const RemovedUserData = await UserModel.find({ "joined_groups.groupid": req.params.id });

 for (var id in RemovedUserData) {

        RemovedUserData[id].created_groups =  RemovedUserData[id].created_groups.filter((groupid) => {
            return groupid.groupid.toString() !== req.params.id
          
        })      
        RemovedUserData[id].joined_groups =  RemovedUserData[id].joined_groups.filter((groupid) => {
            return groupid.groupid.toString() !== req.params.id
        })

        RemovedUserData[id].save();
    }
      

        res.status(200).json({ message: "Removed Group: ", result: "" });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.viewGroupMembers = async (req, res) => {
    try {

        const groupData = await groupModel.findOne({ _id: req.body.groupid });

        const filteredArray = await UserModel.find({ "joined_groups.groupid": groupData._id,  });


        // const filteredArray = await UserModel.aggregate([
        //     { "$match": { "joined_groups.groupid": groupData._id } },

        //     { "$match": { "joined_groups.name": groupData.GroupName } }]);

        //let filteredArray = userData.filter((element) => element.joined_groups.some((groupid) => groupid.groupid.toString() === req.body.groupid.toString()));

        for (var data in filteredArray) {
            //  filteredArray[data].subElements = {"groupid": groupid};
            // //console.log(groupData.admin_id,"ssss")
            filteredArray[data].admin_id = groupData.admin_id;//.(groupData.admin_id)
        }

           //console.log(filteredArray)

        res.status(200).json({ message: "Group Members: ", result: filteredArray });
    } catch (err) {
        //console.log(err)
        res.status(400).json({ message: err });
    }
}




exports.SendJoinRequest = async (req, res) => {
    try {

        req.user.Requested_groups = req.user.Requested_groups.concat({
            groupid:
                req.body.groupid,
            name:
                req.body.GroupName,
            requestMessage:
                req.body.requestMessage

        })

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

        if (req.user.created_groups.length !== 0) {

            let ToBeInserted = {
                GroupCategory: "Your Groups",
                data: []
            }
            for (var data in req.user.created_groups) {

                const groupData = await groupModel.findOne({ _id: req.user.created_groups[data].groupid });
                // //console.log(groupData)
                groupData.countMembers = await UserModel.countDocuments({ "joined_groups.groupid": groupData._id,  });
                
                  const groupObject = groupData.toObject()
                //  delete groupObject.GroupCategory_id;
                //  delete groupObject.admin_id;
                //  delete groupObject.owner_id;
                //  delete groupObject.__v;
                groupObject.currentUser=req.user._id;
                ToBeInserted.data.push({ groupObject })
            }

            Response.push(ToBeInserted)
        }
        if (req.user.joined_groups.length !== 0) {
            var categoryData = await CategoryModel.find();
            for (var data in categoryData) {


                const groups = req.user.joined_groups.filter(a => a.GroupCategoryid.toString() === categoryData[data]._id.toString())



                if (groups.length !== 0) {

                    let ToBeInserted = {
                        GroupCategory: categoryData[data].title,
                        data: []
                    }

                    for (var groupid in groups) {

                        const groupData = await groupModel.findOne({ _id: groups[groupid].groupid });

                        const isPresent = groupData.admin_id.filter((a) => a.toString() === req.user._id.toString());

                        if (isPresent.length === 0) {

                            groupData.countMembers = await UserModel.countDocuments({ "joined_groups.groupid": groupData._id,  });


                            const groupObject = groupData.toObject()
                            // delete groupObject.GroupCategory_id;
                            // delete groupObject.admin_id;
                            // delete groupObject.owner_id;
                            // delete groupObject.__v;

                            groupObject.currentUser=req.user._id;
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
        //console.log(err)
        res.status(400).json({ message: err });
    }
}


exports.updateGroupImage = async (req, res)=>{
    try{

        uploadFile(req.body.image, req.body.groupid+"_"+req.user._id,CONSTANT.GroupProfilePictureBucketName)
        .then(async picLocation => {

            var GroupID = req.body.groupid;
            var userVerified = await groupModel.update({
                _id: GroupID,
            },{$set:{image: picLocation}});
            res.status(200).send("Image Uploaded successfully");
        })
        .catch(function(e){
           // //console.log("Failed to upload profile pic", e);
            res.status(400).send({error:"Failed to upload profile pic" });
        });

    }catch(err){
        //console.log(err)
        res.status(500).send({error:"Internal Server error"});

    }
 }


 exports.updateGroupinformation = async (req, res)=>{
    try{
        var categoryData = await CategoryModel.findOne({ _id: req.body.GroupCategory_id });
            var GroupID = req.body.groupid;

            var GroupName = req.body.GroupName;
            var group_Bio = req.body.group_Bio;
            var privacy = req.body.privacy;
            var GroupCategory_id = req.body.GroupCategory_id;
            var GroupCategory = categoryData.title;

            var userVerified = await groupModel.update({
                _id: GroupID,
            },{$set:{GroupName,group_Bio,privacy,GroupCategory_id,GroupCategory}});
            res.status(200).send("Image Uploaded successfully");
      
           // //console.log("Failed to upload profile pic", e);   

    }catch(err){
        //console.log(err)
        res.status(400).send({error:"Failed to update Profile information" });
    }
 }