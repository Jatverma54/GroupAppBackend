var CategoryModel = require('./../model/categories');
const auth = require('../middleware/auth')
//var UserModel = require('./../model/users');

exports.addCategories = function(req, res, next){
 

    if(req.user.profile.role==="Admin"){

   
    var CategoryData = new CategoryModel(req.body);
 
    CategoryData.save(async (err, result)=> {
        console.log("*****err", err);
        if (err) {

            console.log("req.body", err);
            res.status(400).send({error:err});
          
                     
        } else {

          //  const token = await UserData.generateAuthToken()
            res.status(201).send({message: "Data saved successfully.", result,  })//token
            //res.send({message: "Data saved successfully.", result: result});

            console.log(result,"Resultttttttttt")
        }
       
   })         
}else{
    res.status(400).send("User is not an Admin");
          
}
}
