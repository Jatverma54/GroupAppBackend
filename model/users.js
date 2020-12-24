var mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
var uniqueValidator = require('mongoose-unique-validator');
var postModel = require('./posts');
//Define a schema
var Schema = mongoose.Schema;

var UserModelSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, },
    email: { type: String, required: true, unique: true, trim: true,lowercase: true, },
    password: { type: String, required: true,  trim: true, },
    created_groups: [{
        groupid: {
            type: Schema.Types.ObjectId,   
            ref: 'groupModel'        
        },
        name:{
            type: String,
        }
    }],
    joined_groups: [{
        groupid: {
            type: Schema.Types.ObjectId,  
            ref: 'groupModel',
              
        },
        name:{
            type: String,
        },
        GroupCategoryid: { type:Schema.Types.ObjectId,},
      //  group_type:{ type:Schema.Types.ObjectId,},

    }],
    Requested_groups: [{
        groupid: {
            type: Schema.Types.ObjectId,         
        },
        name:{
            type: String,
        },
      requestMessage:  {
        type: String,
        }
    }],
    admin_id: [{type:Schema.Types.ObjectId,}],
    //owner_id: {type:Schema.Types.ObjectId},
    profile: {
        profile_pic: String,
        dob:{ type: Date, required: true,trim: true },
        full_name: { type: String, required: true,  trim: true },
        role: { type: String, required: true,  trim: true, default:"User" },
        UserCreateddate: { type: Date,  default: Date.now }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    ExpopushToken:{},
    resetCode:  {
        type: Number,
        },
    EnableNotification:{ type: Boolean, default:true},
    isActive: { type: Boolean, required: true, default: false }
},{timestamps:true});

UserModelSchema.methods.generateAuthToken = async function (ownerPushToken) {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'HardWorkAlwaysPayOff')

    user.tokens = user.tokens.concat({ token })

    
    if(user.EnableNotification){
        user.ExpopushToken=ownerPushToken
    }
  
    await user.save()

    return token
}

// UserModelSchema.virtual('groupModels', {
//     ref: 'groupModel',
//     localField: '_id',
//     foreignField: 'owner_id'
// })

UserModelSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.created_groups
    delete userObject.joined_groups
    delete userObject.ExpopushToken
   // delete userObject.Requested_groups
   
    return userObject
}

UserModelSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

UserModelSchema.virtual('posts', {
    ref: 'postModel',
    localField: '_id',
    foreignField: 'OnwerId'
  })

  UserModelSchema.virtual('group', {
    ref: 'groupModel',
   
    localField: 'joined_groups.groupid',
    foreignField: '_id'
  })
  

  UserModelSchema.virtual('createdgroup', {
    ref: 'groupModel',
   
    localField: 'created_groups.groupid',
    foreignField: '_id'
  })
  

UserModelSchema.plugin(uniqueValidator);

const User = mongoose.model('UserModel', UserModelSchema)

module.exports = User