var mongoose = require('mongoose');

var uniqueValidator = require('mongoose-unique-validator');
//Define a schema
var Schema = mongoose.Schema;

var groupModelSchema = new Schema({
    GroupName: { type: String, required: true, unique: true, trim: true, },
    group_Bio:{ type: String, trim: true,},
    group_type: { type: String, required: true,  trim: true, },
    GroupCategory:{ type: String,   trim: true,},
    groupMembers:[{type:Schema.Types.ObjectId,required:true}],
    GroupCategory_id: { type:Schema.Types.ObjectId,required:true},
    privacy: { type: String,   trim: true, default:"open"},
    created_by: {type:Schema.Types.ObjectId,required:true,},
    admin: [{type:Schema.Types.ObjectId,required:true}],
    image: { type: String,default:null},
    groupCreateddate: { type: Date,  default: Date.now() },
    post:[Object],
   // isJoined:{ type: Boolean,required:true},
    RequestedBy: [{type:Schema.Types.ObjectId}],
   // isRequested:{ type: String}
   countMembers:{type:Schema.Types.Number,},
});


groupModelSchema.plugin(uniqueValidator);

const groupModel = mongoose.model('groupModel', groupModelSchema );
module.exports = groupModel

