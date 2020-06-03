var UserModel = require('./../model/users');

exports.addUser = function(req, res, next){
    console.log("req.body", req.body);
    var UserData = new UserModel(req.body);
    UserData.save(function (err, result) {
        console.log("*****err", err);
        if (err) {
            res.send({error: err, message: "Data not saved."});
        } else {
            res.send({message: "Data saved successfully.", result: result});
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