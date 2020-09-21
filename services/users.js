var UserModel = require('./../model/users');
const auth = require('../middleware/auth');
const sendEmail = require('./../common/mailer_config');
const uploadFile = require('./../common/s3_bucket_config');

exports.addUser = function(req, res, next){
    try{
        uploadFile(req.body.profile.profilePic, req.body.username)
        .then(function(picLocation){
            req.body.profile.profile_pic = picLocation;
            console.log("****req.body",req.body);
            var UserData = new UserModel(req.body);
            UserData.save((err, result)=> {
                if (err) {
                    console.log("*****err", err);
                    if(err.errors.email!==undefined){
                        res.status(400).send({error: "Email Id already exist" })
                }
                else if(err.errors.username!==undefined){
                        res.status(400).send({error:"Username already exist" });
                }      
                } else {
                    console.log("result", result);
                    
                        var params = {
                            userID:  result._id,
                            email: result.email
                        }
                        sendEmail(params, function(err, resp){
                            if(err){
                                console.log("mail error", err);
                                res.status(400).send({error: "Unable to register. Internal error occured." });
                            } else {
                                console.log("mail success");
                                res.status(201).send({message: "Data saved successfully.", result  })     
                            }
                        });
                
                    
                }
                // saved!
            })
        }).catch(function(e){
            console.log("Failed to upload profile pic", e);
            res.status(400).send({error:"Failed to upload profile pic" });
        });
    } catch(e){
        res.status(500).send({error: e });
    }
}




exports.getData = async (req, res)=>{
    try{
     const UserData = await UserModel.find();
     res.status(200).json({message: "Data: ", result: UserData});
    }catch(err){
        res.status(400).json({message: err});
    }
 }

 exports.deleteData =   async (req, res)=>{
   try{
    await req.user.remove();
    res.status(200).json({message: "Removed User: ", result: req.user});
   }catch(err){
    res.status(400).json({message: err});
   }
}


exports.loginUser = async (req, res)=>{
    try{

        const user = await UserModel.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })

    }catch(err){
        console.log(err)
        res.status(400).send({message: err});

    }
 }
 