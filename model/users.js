var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserModelSchema = new Schema({
    username: String,
    email: String,
    password: String,
    created_groups: [Schema.Types.ObjectId],
    joined_groups: [Schema.Types.ObjectId],
    stories: [Object],
    profile: {
        profile_pic: String,
        dob: Date,
        first_name: String,
        last_name: String
    }
});

module.exports = mongoose.model('UserModel', UserModelSchema );