var CategoryModel = require('./../model/categories');
const auth = require('../middleware/auth');
const groupModel = require('../model/groups');

//var UserModel = require('./../model/users');

exports.addCategories = function(req, res, next){
 
try{
    if(req.user.profile.role==="Admin"){

   
    //var CategoryData = new CategoryModel(req.body);
 
    CategoryModel.insertMany(req.body ,async (err, result)=> {
        //console.log("*****err", err);
        if (err) {

            //console.log("req.body", err);
            res.status(400).send({error:err});
          
                     
        } else {

          //  const token = await UserData.generateAuthToken()
            res.status(201).send({message: "Data saved successfully.", result,  })//token
            //res.send({message: "Data saved successfully.", result: result});

            //console.log(result,"Resultttttttttt")
        }
       //console.log();
  })         
}else{
    res.status(400).send("User is not an Admin");
          
}
}catch(e){
    res.status(400).send({error:e});
}
}


exports.getCategories = async (req, res)=>{
    try{
    
     const CategoryData = await CategoryModel.find();

     for(var data in CategoryData){
        CategoryData[data].Groups= await groupModel.countDocuments({GroupCategory_id:CategoryData[data]._id})
     }
     res.status(200).json({message: "Data: ", result: CategoryData});
    }catch(err){
     res.status(400).json({error: err});
    }
 }

 exports.deleteData = async (req, res)=>{
    try{
     const RemovedData = await CategoryModel.remove({_id: req.params.id});
     res.status(200).json({message: "Removed User: ", result: RemovedData});
    }catch(err){
        res.status(400).json({message: err});
    }
 }
 