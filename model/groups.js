var mongoose = require('mongoose');
var postModel = require('./posts');
var uniqueValidator = require('mongoose-unique-validator');
//Define a schema
var Schema = mongoose.Schema;

var groupModelSchema = new Schema({
    GroupName: { type: String, required: true,  trim: true, },
    group_Bio:{ type: String, trim: true,},
    group_type: { type: String, required: true,  trim: true, },
    GroupCategory:{ type: String,  },
    GroupCategory_id: { type:Schema.Types.ObjectId,ref:"CategoryModel"},
    privacy: { type: String,   trim: true, },
    owner_id: {type:Schema.Types.ObjectId,required:true, },//ref: 'UserModel'
    admin_id: [{type:Schema.Types.ObjectId,required:true,ref: 'UserModel'}],
    image: { type: String,default:null},
    groupCreateddate: { type: Date,  default:Date.now },
    post:[Object],
    GroupAdminName:[{type: String}], 
    isJoined:{ type: Boolean},
   isRequested:{ type: Boolean},
  countMembers:{type:Number},
LastUpdated: { type: Date,  default:Date.now },
currentUser:{ type:Schema.Types.ObjectId}

},{timestamps:true});

groupModelSchema.virtual('posts', {
  ref: 'postModel',
  localField: '_id',
  foreignField: 'GroupId'
})


groupModelSchema.virtual('groupList', {
  ref: 'UserModel',
 
  foreignField: 'joined_groups.groupid',
  localField: '_id'
  
})




groupModelSchema.plugin(uniqueValidator);

const groupModel = mongoose.model('groupModel', groupModelSchema );
module.exports = groupModel

