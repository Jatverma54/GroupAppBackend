var mongoose = require('mongoose');
var groupModel = require('./groups');
//Define a schema
var Schema = mongoose.Schema;

var PostModelSchema = new Schema({
  image: [{
    type: String,
  }],

  document: {
    type: String,
  },
  video: {
    type: String,
  },
  postMetaData: { type: String, },

  OnwerId: {
    type: String, required: true,
    ref: 'UserModel'
  },

  OnwerName: { type: String },

  OnwerProfilePic: { type: String },

  like_count: Number,
  likedBy: [Schema.Types.ObjectId],

  Comments: [{
    comment: { type: String },
    LikedBy:
      [Schema.Types.ObjectId],
    OnwerId: {
      type: Schema.Types.ObjectId,
    },
    createdAt: { type: Date, default: Date() },
    ReplyComment: [

      {
        comment: { type: String },
        LikedBy:
          [Schema.Types.ObjectId],
        OnwerId: {
          type: Schema.Types.ObjectId,
        },
        createdAt: { type: Date, default: Date() }
      }]

  }], //text, commented_by, date
  time: { type: Date, default:  Date.now() },
  GroupId: {
    type: Schema.Types.ObjectId, required: true,
    ref: 'groupModel'
  },


});



PostModelSchema.pre('save', async function preSave(next){
  var something = this;
  if (this.isNew){
    var userVerified = await groupModel.update({
      _id: something.GroupId,
  }, { $set: { LastUpdated: Date() } });
  }
 
  next();
  
});

const postModel = mongoose.model('postModel', PostModelSchema);
module.exports = postModel