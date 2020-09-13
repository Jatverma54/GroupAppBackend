var UserModel = require('./../model/users');
const auth = require('../middleware/auth')

exports.addUser = function(req, res, next){
    console.log("req.body", req.body);
    var UserData = new UserModel(req.body);
    UserData.save(async (err, result)=> {
        console.log("*****err", err);
        if (err) {

           if(err.errmsg.includes("email")){
            res.status(400).send({error: "Email Id already exist" })
           }
           else if(err.errmsg.includes("username")){
            res.status(400).send({error:"Username already exist" });
           }
                     
        } else {
          //  const token = await UserData.generateAuthToken()
            res.status(201).send({message: "Data saved successfully.", result,  })//token
            //res.send({message: "Data saved successfully.", result: result});

            console.log(result,"Resultttttttttt")
        }
        
        // saved!
    })
}


exports.getData = async (req, res)=>{
   try{
    const UserData = await UserModel.find();
    res.json({message: "Data: ", result: UserData});
   }catch(err){
    res.json({message: err});
   }
}

exports.getData = async (req, res)=>{
    try{
     const UserData = await UserModel.find();
     res.json({message: "Data: ", result: UserData});
    }catch(err){
     res.json({message: err});
    }
 }

 exports.deleteData = async (req, res)=>{
   try{
    const RemovedData = await UserModel.remove({_id: req.params.id});
    res.json({message: "Removed User: ", result: RemovedData});
   }catch(err){
    res.json({message: err});
   }
}


exports.loginUser = async (req, res)=>{
    try{

        const user = await UserModel.findByCredentials(req.body.username, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })

    }catch(err){
        console.log(err)
        res.status(400).send({message: err});

    }
 }
 