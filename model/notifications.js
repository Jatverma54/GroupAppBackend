var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var NotificationModelSchema = new Schema({
    message: String,
    group_id: Schema.Types.ObjectId,
    activity_by: Schema.Types.ObjectId,
    activity: String, 
    post_id: Schema.Types.ObjectId,
    date: Date
});

exports.module = mongoose.model('NotificationModel', NotificationModelSchema );