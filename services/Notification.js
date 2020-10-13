var groupModel = require('./../model/groups');
const auth = require('../middleware/auth');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
var postModel = require('./../model/posts');
var NotificationModel = require('./../model/notifications');

exports.getNotification = async (req, res, next) => {
    try {

        var notificationData=await NotificationModel.find({group_id:req.params.id})
      
        let ToBeInserted=[]

        for(var data in notificationData){

        
        if(notificationData[data].notificationType==="all"){
            
            var userData= await notificationData[data].populate('activity_by').execPopulate();
            var PostData=await notificationData[data].populate('post_id').execPopulate();
            var notify=  notificationData[data].toObject();
         ToBeInserted.push(notify)

     

        }else{

        }
    }
    console.log(ToBeInserted)
         res.status(200).send({ message: "Notifications", result: ToBeInserted})
       
    //   if(PostData.image.length!==0){
    //     notify.attachment=PostData.image[0];
    //   }
    //  else if(PostData.document){
    //     notify.attachment=PostData.document;
    // }
    // else if(PostData.video){
    //     notify.attachment=PostData.video;  
    // }else{
    //     notify.attachment=null;  
    // }


    } catch (err) {
        console.log(err)
        res.status(500).send({ error: "Category is not present in DB" });
    }
}

