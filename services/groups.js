var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
const { compare } = require('bcrypt');

exports.addNewGroup = async(req, res, next)=>{
    try{
    console.log("req.body", req.body);
    
    var categoryData = await CategoryModel.findOne({_id:req.body.GroupCategory_id});
    req.body.GroupCategory =categoryData.title;
    req.body.GroupAdminName =req.user.profile.full_name;
    
   
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
          //  const user = await UserModel.findOne({_id:req.body.owner_id});
         //   const user = await UserModel.findByIdAndUpdate(req.body.owner_id, { joined_groups: { $push: {groupid: result._id,name:result.GroupName}} })
         req.user.joined_groups = req.user.joined_groups.concat({ groupid: result._id,name:result.GroupName,GroupCategoryid:result.GroupCategory_id})
         req.user.created_groups = req.user.created_groups.concat({ groupid: result._id,name:result.GroupName})
            await req.user.save();

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
      
     var groupData = await groupModel.find({ group_type:"public",GroupCategory_id: req.body.GroupCategory_id});
   
     const userData = await UserModel.find();
     groupData = groupData.map( item => {
       item.isRequested =  req.user.Requested_groups.find(a=>a.groupid.toString()===item._id.toString())?true:false;
       item.isJoined =  req.user.joined_groups.find(a=>a.groupid.toString()===item._id.toString())?true:false;  
        let filteredArray = userData.filter((element) => element.joined_groups.some((groupid) => groupid.groupid.toString() === item._id.toString()));
         item.countMembers=filteredArray.length;
       return item;    
            });

          
           
     res.status(200).json({message: "Data: ", result: groupData});
    }catch(err){
        console.log(err)
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
 

 exports.viewGroupMembers = async (req, res)=>{
    try{
 
    const groupData = await groupModel.findOne({ _id: req.body.groupid });
   
     const userData = await UserModel.find();
   
    
    let filteredArray = userData.filter((element) => element.joined_groups.some((groupid) => groupid.groupid.toString() === req.body.groupid.toString()));
  
    for(var data in filteredArray){
      //  filteredArray[data].subElements = {"groupid": groupid};
  // console.log(groupData.admin_id,"ssss")
     filteredArray[data].admin_id=groupData.admin_id;//.(groupData.admin_id)
      }
    console.log(filteredArray);
   // console.log(ResponseJson)

     res.status(200).json({message: "Group Members: ", result:filteredArray});
    }catch(err){
        console.log(err)
        res.status(400).json({message: err});
    }
 }



 
 exports.SendJoinRequest = async (req, res)=>{
    try{
    
    req.user.Requested_groups = req.user.Requested_groups.concat({  
        groupid: 
            req.body.groupid,
    name:
        req.body.GroupName,
  requestMessage:  
    req.body.requestMessage  
     
})

    await req.user.save()

     res.status(200).json({message: "Request Sent: ", result:req.user});
    }catch(err){
        console.log(err)
        res.status(400).json({message: err});
    }
 }
 

 exports.DeleteSentJoinRequest = async (req, res)=>{
    try{

req.user.Requested_groups = req.user.Requested_groups.filter((data) => {
   
 return data.groupid.toString() !== req.body.groupid
   
})
await req.user.save()

res.status(200).json({message: "Request Deleted: ", result:req.user});

}catch(err){
        console.log(err)
        res.status(400).json({message: err});
    }
 }


 exports.getJoinedPublicGroups = async (req, res)=>{
    try{
        const userData = await UserModel.find();
        var Response=[]
           
        
        if(req.user.created_groups.length!==0){
        
        let ToBeInserted=  {  GroupCategory:"Your Groups",
            data:[]
        }
            for(var data in req.user.created_groups){
            
              const groupData = await groupModel.findOne({ _id: req.user.created_groups[data].groupid });
             // console.log(groupData)

             let filteredArray = userData.filter((element) => element.joined_groups.some((groupid) => groupid.groupid.toString() === groupData._id.toString()));
             groupData.countMembers=filteredArray.length;

             ToBeInserted.data.push({groupData})
            }

            Response.push(ToBeInserted)
        }


        if(req.user.joined_groups.length!==0){
            let ToBeInserted=  {  GroupCategory:'',
            data:[]
        }
            for(var data in req.user.joined_groups){
                const groupData = await groupModel.findOne({ _id: req.user.created_groups[data].groupid });
                 
             
               

            }




        }

        //Response.concat({Jatin: 12344})
//res.status(200).json({message: "Request : ", result:Response});
res.status(200).json({ Response});
}catch(err){
        console.log(err)
        res.status(400).json({message: err});
    }
 }
