var mongoose = require('mongoose');
var postModel = require('./posts');
var uniqueValidator = require('mongoose-unique-validator');
//Define a schema
var Schema = mongoose.Schema;

var groupModelSchema = new Schema({
    GroupName: { type: String, required: true, unique: true, trim: true, },
    group_Bio:{ type: String, trim: true,},
    group_type: { type: String, required: true,  trim: true, },
    GroupCategory:{ type: String,  },
    //groupMembers:[{type:Schema.Types.ObjectId,required:true}],
    GroupCategory_id: { type:Schema.Types.ObjectId},
    privacy: { type: String,   trim: true, },
    owner_id: {type:Schema.Types.ObjectId,required:true, },//ref: 'UserModel'
    admin_id: [{type:Schema.Types.ObjectId,required:true}],
    image: { type: String,default:null},
    groupCreateddate: { type: Date,  default: Date() },
    post:[Object],
    GroupAdminName:[{type: String}], 
    isJoined:{ type: Boolean},
   // RequestedBy: [{type:Schema.Types.ObjectId}],
   isRequested:{ type: Boolean},
  countMembers:{type:Number},
LastUpdated: { type: Date,  default:  Date() },
});

groupModelSchema.virtual('posts', {
  ref: 'postModel',
  localField: '_id',
  foreignField: 'GroupId'
})






groupModelSchema.plugin(uniqueValidator);

const groupModel = mongoose.model('groupModel', groupModelSchema );
module.exports = groupModel

