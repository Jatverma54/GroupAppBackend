var UserModel = require('./../model/users');
const auth = require('../middleware/auth');
const sendEmail = require('./../common/mailer_config');
const sendConfirmationEmail = require('./../common/mailer_config_email');
const uploadFile = require('./../common/s3_bucket_config');
const CONSTANT = require('./../common/constant');
const s3Config = require('./../common/s3_bucket_config');
const bcrypt = require('bcrypt');
const expoNotification = require('./../common/expoSendNotifications');

exports.addUser = function (req, res, next) {
    try {

        if (req.body.profile && req.body.profile.profilePic) {
            s3Config.uploadFile(req.body.profile.profilePic, req.body.username, CONSTANT.ProfilePictureBucketName)
                .then(picLocation => saveUserInDB(req, res, picLocation))
                .catch(function (e) {

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

    var UserData = new UserModel(req.body);
    UserData.save((err, result) => {
        if (err) {

            if (err.errors && err.errors.email !== undefined) {
                res.status(400).send({ error: "Email Id already exist" })


                const filename = picLocation.split('/').slice(-1)[0];

                s3Config.removeFileFromS3(filename, CONSTANT.ProfilePictureBucketName, function (err, res) {
                    if (err) {
                     
                    } else {
                     
                    }
                });

            }
            else if (err.errors && err.errors.username !== undefined) {
                res.status(400).send({ error: "Username already exist" });

                const filename = picLocation.split('/').slice(-1)[0];

                s3Config.removeFileFromS3(filename, CONSTANT.ProfilePictureBucketName, function (err, res) {
                    if (err) {
                     
                    } else {
                      
                    }
                });
            }
        } else {


            var params = {
                userID: result._id,
                email: result.email,
                username: result.username,
                name:result.profile.full_name
            }
            sendEmail(params, async function (err, resp) {
                if (err) {

                    const deleteUser = await UserModel.remove({ _id: result._id });

                    const filename = picLocation.split('/').slice(-1)[0];

                    s3Config.removeFileFromS3(filename, CONSTANT.ProfilePictureBucketName, function (err, res) {
                        if (err) {
                        
                        } else {
                           
                        }
                    });


                    res.status(400).send({ error: "Unable to register. Internal error occured." });
                } else {

                    res.status(201).send({ message: "Data saved successfully.", result: "" })
                }
            });


        }

    })
}

exports.getData = async (req, res) => {
    try {
        if (req.user.profile.role === "Admin") {
        const UserData = await UserModel.find();
        res.status(200).json({ message: "Data: ", result: UserData });
        }else{
            res.status(500).send("User is not an Admin");
        }
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

        const users = await UserModel.findByCredentials(req.body.username, req.body.password)
        const token = await users.generateAuthToken(req.body.ownerPushToken)
       
        var user= users.toObject();
         delete user.admin_id;
         delete user.isActive;
         delete user.password;
         delete user.created_groups;
         delete user.joined_groups;
         delete user.Requested_groups;
         delete user.tokens;
         delete user.createdAt;
         delete user.updatedAt;
         delete user.resetCode;
         delete user.EnableNotification;
         delete user.profile.role;
         delete user.ExpopushToken;
        res.status(200).send({ user, token })

    } catch (err) {
        console.log(err)
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
        //
        res.status(400).send({ message: err });

    }
}



exports.userInformation = async (req, res) => {
    try {
          var userData= req.user.toObject();
           delete userData.admin_id;
           delete userData.isActive;
           delete userData.password;
           delete userData.created_groups;
           delete userData.joined_groups;
           delete userData.Requested_groups;
           delete userData.tokens;
           delete userData.createdAt;
           delete userData.updatedAt;
           delete userData.resetCode;
           delete userData.EnableNotification;
           delete userData.profile.role;
           delete userData.ExpopushToken;
       
        res.status(200).json({ message: "Data: ", result: userData });
    } catch (err) {
        res.status(400).json({ message: err });
    }
}



exports.updateUserImage = async (req, res) => {
    try {

        s3Config.uploadFile(req.body.image, req.user._id + "_" + req.user.username, CONSTANT.ProfilePictureBucketName)
            .then(async picLocation => {

                var UserId = req.user._id;
                var userVerified = await UserModel.findOneAndUpdate({
                    _id: UserId,
                }, { $set: { "profile.profile_pic": picLocation } });

                const filename = userVerified.profile.profile_pic.split('/').slice(-1)[0];

                s3Config.removeFileFromS3(filename, CONSTANT.ProfilePictureBucketName, function (err, res) {
                    if (err) {
                     
                    } else {
                     
                    }
                });

                var userData = await UserModel.findById(UserId, { username: 1, 'profile.full_name': 1, 'profile.profile_pic': 1 });

                res.status(200).send({ result: userData });


            })
            .catch(function (e) {
            
                res.status(400).send({ error: "Failed to upload profile pic" });
            });

    } catch (err) {

        res.status(500).send({ error: "Internal Server error" });

    }


}



exports.updateUserinformation = async (req, res) => {
    try {
        var username = req.body.username;
        var full_name = req.body.full_name;

        var userVerified = await UserModel.update({
            _id: req.user._id,
        }, { $set: { username, "profile.full_name": full_name } });

        var userData = await UserModel.findById(req.user._id, { username: 1, 'profile.full_name': 1, 'profile.profile_pic': 1 });

        res.status(200).send({ result: userData });

    } catch (err) {

        if (err.errmsg && err.errmsg.includes(username)) {
            res.status(400).send({ error: "Username already exist" });
        }
        res.status(400).send({ error: "Something went wrong!! Please try again" });
    }
}



exports.updateUserPassword = (req, response) => {
    try {

        bcrypt.compare(req.body.currentPassword, req.user.password, async function (err, res) {
            if (err) {
            
                return response.status(400).send({ error: "Something went wrong!! Please try again" });
            }
            if (res) {

                var password = req.body.password;

                var userVerified = await UserModel.update({
                    _id: req.user._id,
                }, { $set: { password } });
                response.status(200).send("Password updated successfully");

            } else {

                // response is OutgoingMessage object that server response http request
                return response.status(400).send({ success: false, message: 'Current Password do not match' });
            }
        });

    } catch (err) {
     
        response.status(400).send({ error: "Something went wrong!! Please try again" });

    }
}



exports.userSearchQuery = async (req, res) => {

    try {

        UserModel.aggregate(
            [

                {
                    "$match": {
                        "username": { "$regex": req.body.userSearchQuery, "$options": "i" }
                    }
                },


                //   Group back as an array with only the matching elements
                {
                    "$group": {
                        "_id": "$_id",
                        "username": { "$first": "$username" },
                        "name": { "$first": "$profile.full_name" },
                        "image": { "$first": "$profile.profile_pic" },
                    }
                }
            ],
            function (err, results) {
                if (err) {
                    
                    res.status(400).json({ message: err });
                } else {
                   
                    res.status(200).json({ message: "Searched Users : ", result: results });
                }
            }
        )

    } catch (err) {
        
        res.status(400).json({ message: err });
    }
}




exports.adduserTogroup = async (req, res) => {

    try {

        var ExpoTokens = [];
        for (var data in req.body.SelectedUsers) {
            const UserData = await UserModel.findById(req.body.SelectedUsers[data]._id);
            
            if (!(UserData.joined_groups.find(a => a.groupid.toString() === req.body.groupid))) {

                UserData.joined_groups = UserData.joined_groups.concat({ groupid: req.body.groupid })//name: result.GroupName,GroupCategoryid: req.body.GroupCategory_id 
                await UserData.save()
                ExpoTokens.push(UserData.ExpopushToken)
            }

        }
        res.status(200).json({ message: "Users added to group" });

        if (ExpoTokens.length !== 0) {

            var notify = {

                group_id: req.body.groupid,
                activity_byName: req.user.profile.full_name,
                notificationType: "Added to Group",
                SelectedUsersExpoTokens: ExpoTokens

            }
            expoNotification.sendNotification(notify)
        }

    } catch (err) {
        
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
        const UserData = await UserModel.findOne({ email: req.body.Email });

        if (UserData) {

            var resetCode = generator();

            UserData.resetCode = resetCode

            await UserData.save()

            var params = {
                userID: UserData._id,
                email: UserData.email,
                FullName: UserData.profile.full_name,
                Username: UserData.username,
                resetCode: resetCode
            }
            sendConfirmationEmail(params, async function (err, resp) {
                if (err) {

                    res.status(400).send({ error: "Unable to send confirmation code. Internal error occured." });
                } else {
                  
                    res.status(200).json({ message: "Confirmation code sent", result: UserData._id });
                }
            });

        }
        else {
            res.status(422).json({ message: "Email id does not exist" });
        }

    } catch (err) {
        
        res.status(400).json({ message: err });
    }


}



exports.AuthenticateConfirmationCode = async (req, res) => {

    try {
        const UserData = await UserModel.findById(req.body.Userid);

        if (UserData.resetCode === req.body.confrimationCode) {

            res.status(200).json({ message: "Confirmation code Verified", result: UserData._id });

            UserData.resetCode = ""

            await UserData.save()

        }
        else {
            res.status(422).json({ message: "Verification Failed" });
        }

    } catch (err) {
        
        res.status(400).json({ message: err });
    }


}



exports.updateUserPasswordFromForget = async (req, response) => {
    try {

        var password = req.body.password;

        var userVerified = await UserModel.update({
            _id: req.body.UserId,
        }, { $set: { password } });
        response.status(200).send("Password updated successfully");

    } catch (err) {
        response.status(400).send({ error: "Something went wrong!! Please try again" });

    }
}


exports.turnOnOffNotification = async (req, response) => {
    try {

       
       var userData= await UserModel.findById(req.user._id);

       if(userData.ExpopushToken&&userData.ExpopushToken!==""&&req.body.notificationoff){

        var userVerified = await UserModel.update({
            _id: req.user._id,
        }, { $set: { ExpopushToken: "",EnableNotification:false } });
        response.status(200).send({message: "Notifications suspended"});

       }else{
        var userVerified = await UserModel.update({
            _id: req.user._id,
        }, { $set: { ExpopushToken: req.body.ownerPushToken,EnableNotification:true } });

        response.status(200).send({message:"Notifications turned on"});
       } 
       

    } catch (err) {
        response.status(400).send({ error: "Something went wrong!! Please try again" });

    }
}