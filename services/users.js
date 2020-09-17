var UserModel = require('./../model/users');
const auth = require('../middleware/auth')

exports.addUser = function(req, res, next){
    try{
    console.log("req.body", req.body);
    var UserData = new UserModel(req.body);
    UserData.save(async (err, result)=> {
        console.log("*****err", err);
      
        if (err) {

            if(err.errors.email!==undefined){
         //  if(err.errmsg.includes("email")){
            res.status(400).send({error: "Email Id already exist" })
        
            }
           else if(err.errors.username!==undefined){//(err.errmsg.includes("username")){
            res.status(400).send({error:"Username already exist" });
           }
        
        else{
            res.status(400).send({error: err })
        }          
        } else {
          //  const token = await UserData.generateAuthToken()
            res.status(201).send({message: "Data saved successfully.", result,  })//token
            //res.send({message: "Data saved successfully.", result: result});

            console.log(result,"Resultttttttttt")
        }
        
        // saved!
    })
}catch(e){
    res.status(500).send({error:e});
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
 