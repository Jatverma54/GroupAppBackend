var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
//var UserModel = require('./../model/users');

exports.addNewGroup = async(req, res, next)=>{
    try{
    console.log("req.body", req.body);
    
    var categoryData = await CategoryModel.findOne({_id:req.body.GroupCategory_id});
    req.body.GroupCategory =categoryData.title;
    var groupData = new groupModel(req.body);
    groupData.save(async (err, result)=> {
        console.log("*****err", err);
        if (err) {

          //  if(err.errmsg){
           if(err.errors.GroupName!==undefined){
            res.status(400).send({error: "Group Name already exist" })
           }
        else{
            res.status(400).send({error: err })
        }
                     
        } else {
         
            res.status(201).send({message: "Data saved successfully.", result,  })
          

            console.log(result,"Resultttttttttt")
        }
        
        // saved!
    })
}catch(err){
  
    res.status(500).send({error:"Category is not present in DB"});
}
}


exports.getPublicGroups = async (req, res)=>{
    try{
      
     const groupData = await groupModel.find({ group_type:"public" });
     res.status(200).json({message: "Data: ", result: groupData});
    }catch(err){
     res.status(400).json({error: err});
    }
 }


 exports.getPublicGroupsWithCategory = async (req, res)=>{
    try{
      
     const groupData = await groupModel.find({ group_type:"public",GroupCategory_id: req.body.GroupCategory});
     res.status(200).json({message: "Data: ", result: groupData});
    }catch(err){
     res.status(400).json({error: err});
    }
 }

 
 exports.deleteData = async (req, res)=>{
    try{
     const RemovedData = await groupModel.remove({_id: req.params.id});
     res.status(200).json({message: "Removed User: ", result: RemovedData});
    }catch(err){
        res.status(400).json({message: err});
    }
 }
 