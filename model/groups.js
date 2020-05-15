var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var groupModelSchema = new Schema({
    group_name: String,
    category_id: Schema.Types.ObjectId,
    privacy: String,
    created_by: Schema.Types.ObjectId,
    date: Date,
    post:[Object]
});

exports.module = mongoose.model('groupModel', groupModelSchema );