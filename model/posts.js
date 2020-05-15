var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var PostModelSchema = new Schema({
    image: Buffer,
    text: String,
    like_count: Number,
    liked_by: [Schema.Types.ObjectId],
    comment_count: Number,
    comments: [Object], //text, commented_by, date
    date: Date
});

exports.module = mongoose.model('PostModel', PostModelSchema );