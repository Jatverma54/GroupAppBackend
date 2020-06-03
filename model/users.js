var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var UserModelSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    created_groups: [Schema.Types.ObjectId],
    joined_groups: [Schema.Types.ObjectId],
    stories: [Object],
    profile: {
        profile_pic: String,
        dob:{ type: Date, required: true },
        full_name: { type: String, required: true },
       
    }
});

module.exports = mongoose.model('UserModel', UserModelSchema );