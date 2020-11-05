var UserModel = require('./../model/users');
const auth = require('../middleware/auth');
const sendEmail = require('./../common/mailer_config');
const sendConfirmationEmail = require('./../common/mailer_config_email');
const uploadFile = require('./../common/s3_bucket_config');
const CONSTANT = require('./../common/constant');
const s3Config = require('./../common/s3_bucket_config');
const bcrypt = require('bcrypt');
exports.addUser = function (req, res, next) {
    try {
        // uploadFile("C:/Users/snagdeote/Desktop/New folder/Groupapp_project/develop/images/promo-image.jpg", req.body.username)
        if (req.body.profile && req.body.profile.profilePic) {
            uploadFile(req.body.profile.profilePic, req.body.username, CONSTANT.ProfilePictureBucketName)
                .then(picLocation => saveUserInDB(req, res, picLocation))
                .catch(function (e) {
                    //console.log("Failed to upload profile pic", e);
                    res.status(400).send({ error: "Failed to upload profile pic" });
                });
        } else {
            saveUserInDB(req, res, CONSTANT.PlaceholderImageUrl)
        }
    } catch (e) {
        res.status(500).send({ error: "Something went wrong" });
    }
}


function saveUserInDB(req, res, picLocation) {
    req.body.profile.profile_pic = picLocation;
    //console.log("****req.body",req.body);
    var UserData = new UserModel(req.body);
    UserData.save((err, result) => {
        if (err) {
            //console.log("*****err", err);
            if (err.errors&&err.errors.email !== undefined) {
                res.status(400).send({ error: "Email Id already exist" })
            }
            else if (err.errors&&err.errors.username !== undefined) {
                res.status(400).send({ error: "Username already exist" });
            }
        } else {
            //console.log("result", result);

            var params = {
                userID: result._id,
                email: result.email
            }
            sendEmail(params, async function (err, resp) {
                if (err) {
               
                    const deleteUser = await UserModel.remove({ _id: result._id });
                    //console.log("mail error", err);
                    const filename = picLocation.split('/').slice(-1)[0];
      
                    s3Config.removeFileFromS3(filename, CONSTANT.ProfilePictureBucketName, function(err, res){
                        if(err){
                            console.log("Unable to delete older image from S3.");
                        } else {
                            console.log("Removed older image from S3 successfully.");
                        }
                    });
             
                  
                    res.status(400).send({ error: "Unable to register. Internal error occured." });
                } else {
                    //console.log("mail success");
                    res.status(201).send({ message: "Data saved successfully.", result })
                }
            });


        }
        // saved!
    })
}

exports.getData = async (req, res) => {
    try {
        const UserData = await UserModel.find();
        res.status(200).json({ message: "Data: ", result: UserData });
    } catch (err) {
        res.status(400).json({ message: err });
    }
}

exports.deleteData = async (req, res) => {
    try {
        await req.user.remove();
        res.status(200).json({ message: "Removed User: ", result: req.user });
    } catch (err) {
        res.status(400).json({ message: err });
    }
}


exports.loginUser = async (req, res) => {
    try {

        const user = await UserModel.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })

    } catch (err) {
        res.status(400).send({ message: "Unable to login." });

    }
}

exports.updateUser = async (req, res) => {
    try {
        var userID = req.params.id;
        var userVerified = await UserModel.update({
            _id: userID,
        }, { $set: { isActive: true } });
        res.send("User verified successfully");
    } catch (err) {
        //console.log(err)
        res.status(400).send({ message: err });

    }
}



exports.userInformation = async (req, res) => {
    try {

        res.status(200).json({ message: "Data: ", result: req.user });
    } catch (err) {
        res.status(400).json({ message: err });
    }
}



exports.updateUserImage = async (req, res) => {
    try {

        s3Config.uploadFile(req.body.image, req.body.UserId + "_" + req.user.username, CONSTANT.ProfilePictureBucketName)
            .then(async picLocation => {

                var UserId = req.user._id;
                var userVerified = await UserModel.findOneAndUpdate({
                    _id: UserId,
                }, { $set: { "profile.profile_pic": picLocation } });

                const filename = userVerified.profile.profile_pic.split('/').slice(-1)[0];
                     
                s3Config.removeFileFromS3(filename, CONSTANT.ProfilePictureBucketName, function (err, res) {
                    if (err) {
                        console.log("Unable to delete older image from S3.");
                    } else {
                        console.log("Removed older image from S3 successfully.");
                    }
                });

                var userData=await UserModel.findById(UserId);
        
                res.status(200).send({result:userData});
               
               // console.log(userVerified);
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



exports.updateUserinformation = async (req, res) => {
    try {
       var username= req.body.username;
       var full_name= req.body.full_name;
      
        var userVerified = await UserModel.update({
            _id: req.user._id,
        }, { $set: { username, "profile.full_name":full_name } });
      
      var userData=await UserModel.findById(req.user._id);
        
        res.status(200).send({result:userData});
 
        // //console.log("Failed to upload profile pic", e);   

    } catch (err) {
      //  console.log(err,"error")  
         if (err.errmsg&&err.errmsg.includes(username)) {
            res.status(400).send({ error: "Username already exist" });
        }
        res.status(400).send({ error: "Something went wrong!! Please try again" });
     
    }
}



exports.updateUserPassword =  (req, response) => {
    try {

        bcrypt.compare(req.body.currentPassword, req.user.password, async function(err, res) {
            if (err){
                console.log(err," res error")  
             return   response.status(400).send({ error: "Something went wrong!! Please try again" });
            }
            if (res){
              
                var password= req.body.password;
          
                var userVerified = await UserModel.update({
                    _id: req.user._id,
                }, { $set: { password} });
                response.status(200).send("Password updated successfully");
               
            } else {
                
              // response is OutgoingMessage object that server response http request
              return response.status(400).send({success: false, message: 'Current Password do not match'});
            }
          });
      
        // //console.log("Failed to upload profile pic", e);   

    } catch (err) {
       console.log(err,"error")  
      response.status(400).send({ error: "Something went wrong!! Please try again" });
     
    }
}



exports.userSearchQuery = async (req, res) => {

    try {
  
        UserModel.aggregate(
            [
                // Match first to reduce documents to those where the array contains the match
                // { "$match": {
                //     "username": { "$regex": req.body.userSearchQuery, "$options": "i" }
                // }},
                { "$match": {
                    "profile.full_name": { "$regex": req.body.userSearchQuery, "$options": "i" }
                }},

                
             //   Group back as an array with only the matching elements
                { "$group": {
                    "_id": "$_id",
                    "username": { "$first": "$username" },
                    "name": { "$first": "$profile.full_name" },
                    "image": { "$first": "$profile.profile_pic" },
                }}
            ],
            function(err,results) {
                if(err){
                    console.log(err)
                    res.status(400).json({ message: err });
                }else{
                   console.log(results)
                    res.status(200).json({ message: "Searched Users : ", result: results });
                }
            }
        )
        
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }
}




exports.adduserTogroup = async (req, res) => {

    try {
        // const groupData = await groupModel.findById(req.body._id);

        for(var data in req.body.SelectedUsers){
        const UserData = await UserModel.findById(req.body.SelectedUsers[data]._id);
       
      
        if(!(UserData.joined_groups.find(a=>a.groupid.toString()===req.body.groupid))){

            UserData.joined_groups = UserData.joined_groups.concat({ groupid: req.body.groupid})//name: result.GroupName,GroupCategoryid: req.body.GroupCategory_id 
            await UserData.save()
        }
    
        }
        res.status(200).json({ message: "Users added to group" });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }


}

function generator() {

    const ran1 = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].sort((x, z) => {
        ren = Math.random();
        if (ren == 0.5) return 0;
        return ren > 0.5 ? 1 : -1
    })
    const ran2 = () => ran1().sort((x, z) => {
        ren = Math.random();
        if (ren == 0.5) return 0;
        return ren > 0.5 ? 1 : -1
    })

    return Array(6).fill(null).map(x => ran2()[(Math.random() * 9).toFixed()]).join('')
}




exports.AuthenticateEmail = async (req, res) => {

    try {
        const UserData = await UserModel.findOne({email: req.body.Email});
        
        if(UserData){

var resetCode=generator();

UserData.resetCode=resetCode

await UserData.save()

            var params = {
                userID: UserData._id,
                email: UserData.email,
                FullName: UserData.profile.full_name,
                Username:UserData.username,
                resetCode:resetCode
            }
            sendConfirmationEmail(params, async function (err, resp) {
                if (err) {
                   
                    res.status(400).send({ error: "Unable to send confirmation code. Internal error occured." });
                } else {
                    //console.log("mail success");
                    res.status(200).json({ message: "Confirmation code sent",result: UserData});
                }
            });
            
        }
        else{
            res.status(422).json({ message: "Email id does not exist" });
        }
       
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }


}



exports.AuthenticateConfirmationCode = async (req, res) => {

    try {
        const UserData = await UserModel.findById(req.body.Userid);
        
        if(UserData.resetCode===req.body.confrimationCode){

            res.status(200).json({ message: "Confirmation code Verified",result: UserData});

UserData.resetCode=""

await UserData.save()

}
        else{
            res.status(422).json({ message: "Verification Failed" });
        }
       
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: err });
    }


}



exports.updateUserPasswordFromForget =async  (req, response) => {
    try {
       
                var password= req.body.password;
          
                var userVerified = await UserModel.update({
                    _id: req.body.UserId,
                }, { $set: { password} });
                response.status(200).send("Password updated successfully");
   
        // //console.log("Failed to upload profile pic", e);   

    } catch (err) {
       console.log(err,"error")  
      response.status(400).send({ error: "Something went wrong!! Please try again" });
     
    }
}
