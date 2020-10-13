var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var NotificationModelSchema = new Schema({
    message: String,
    group_id: {type:Schema.Types.ObjectId,ref:'groupModel'},
    activity_by: {type:Schema.Types.ObjectId, ref:'UserModel'},
    activity: String, 
    post_id: {type:Schema.Types.ObjectId, ref:'postModel'},
    Createddate:{type: Date, default: new Date()},
    notificationType:String,
    read:{type:Boolean,default:false}
});

 
const NotificationModel = mongoose.model('NotificationModel', NotificationModelSchema );
module.exports = NotificationModel