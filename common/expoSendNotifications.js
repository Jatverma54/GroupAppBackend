const { Expo } = require('expo-server-sdk');
var groupModel = require('./../model/groups');
var CategoryModel = require('./../model/categories');
var UserModel = require('./../model/users');
var postModel = require('./../model/posts');
var NotificationModel = require('./../model/notifications');
const { parseTwoDigitYear } = require('moment');

exports.sendNotification= async(notify) =>{

//&& req.user._id.toString() !== notificationData[data].activity_by._id.toString()
    if (notify.notificationType === "all"&& notify.activity === "NewPostAdded") {

    
    } 
    else if (notify.notificationType === "Added to Group"){
    
    var groupData= await groupModel.findById(notify.group_id)
    
    sendNotificationtoUser(notify.SelectedUsersExpoTokens,"You have been added to "+groupData.GroupName.toString()+" group by "+notify.activity_byName.toString())

    }    
    else if (notify.notificationType === "Deleted from Group"){
    
      var groupData=await groupModel.findById(notify.group_id)
      console.log(groupData,"groupDara")
      console.log(notify.group_id,"notify groupDara")

      sendNotificationtoUser([notify.SelectedUsersExpoTokens],"You have been removed from "+groupData.GroupName.toString()+" group by "+notify.activity_byName.toString())
  
      } 

      else if (notify.notificationType === "Make admin"){

        var userdata=await UserModel.findById(notify.New_admin)
        
        sendNotificationtoUser([userdata.ExpopushToken],"You are now an admin of "+notify.groupdata.GroupName.toString()+" group")
    
        } 
    else if (notify.notificationType === "UserSpecific") {

        // group_id: PostData.GroupId,
        // activity_by: req.user._id,
        // activity: "PostLikedBy",
        // post_id: PostId,
        // notificationType: "UserSpecific"

        // group_id: PostData.GroupId,
        // activity_by: req.user._id,
        // activity: "CommentBy",
        // post_id: req.body.postId,
        // notificationType: "UserSpecific",
        // comment_id:req.body.commentId
       
        var PostData = await postModel.findById(notify.post_id);
        await PostData.populate('OnwerId').execPopulate();
        await PostData.populate('GroupId').execPopulate();

        if (PostData.OnwerId._id.toString() !== notify.activity_by.toString() ) {
            
        
        
        var activity_by = await UserModel.findById(notify.activity_by)

        console.log(activity_by.profile.full_name)
          let Message=""
          if(notify.activity==='PostLikedBy'){
            Message= activity_by.profile.full_name.toString()+" liked your post: "+(!(PostData.postMetaData.length > 50) ?PostData.postMetaData:PostData.postMetaData.toString().substring(0,50)+"..")+ " from group "+ PostData.GroupId.GroupName.toString();
          }
          else if (notify.activity==='CommentBy'){
         Message= activity_by.profile.full_name.toString()+" commented on your post: "+(!(PostData.postMetaData.length > 50) ?PostData.postMetaData:PostData.postMetaData.toString().substring(0,50)+"..")+ " from group "+ PostData.GroupId.GroupName.toString();
          }

        sendNotificationtoUser([PostData.OnwerId.ExpopushToken],Message)
        }
    }
    else if (notify.notificationType === "UserSpecificComments") {
      // group_id: PostData.GroupId,
      // activity_by: req.user._id,
      // activity: "CommentLike",
      // post_id: req.body.postId,
      // notificationType: "UserSpecificComments",
      // comment_id:req.body.commentId
      var PostData = await postModel.findById(notify.post_id);
      await PostData.populate('OnwerId').execPopulate();
      await PostData.populate('GroupId').execPopulate();

        let comments = PostData.Comments.find(a => a._id.toString() === notify.comment_id.toString());

        if(notify.activity==='CommentLike'||notify.activity==='RepliedOnComment'){
        if (comments.OnwerId.toString() !== notify.activity_by.toString() ) {
          
          var activity_by = await UserModel.findById(notify.activity_by)

          console.log(activity_by.profile.full_name)
            let Message=""
            if(notify.activity==='CommentLike'){
              Message= activity_by.profile.full_name.toString()+" liked your comment "+(!(comments.comment.length > 50) ?comments.comment:comments.comment.toString().substring(0,50)+"..")+" on Post: "+(!(PostData.postMetaData.length > 50) ?PostData.postMetaData:PostData.postMetaData.toString().substring(0,50)+"..")+ " from group "+ PostData.GroupId.GroupName.toString();
            }
            else if(notify.activity==='RepliedOnComment'){
              Message= activity_by.profile.full_name.toString()+" replied to your comment "+(!(comments.comment.length > 50) ?comments.comment:comments.comment.toString().substring(0,50)+"..")+" on Post: "+(!(PostData.postMetaData.length > 50) ?PostData.postMetaData:PostData.postMetaData.toString().substring(0,50)+"..")+ " from group "+ PostData.GroupId.GroupName.toString();
            }
            
            var ExpoToken = await UserModel.findById(comments.OnwerId)
          sendNotificationtoUser([ExpoToken.ExpopushToken],Message)


         
        }
      }
        else if (notify.activity === "RepliedOnCommentLike") {
            let ReplycommentsData = comments.ReplyComment.find(id => id._id.toString() === notify.Replycomment_id.toString())
       
            if (ReplycommentsData&&ReplycommentsData.OnwerId.toString() !== notify.activity_by.toString() ) {
            
              var activity_by = await UserModel.findById(notify.activity_by)

              console.log(activity_by.profile.full_name)
                let Message=""
                if(notify.activity==='RepliedOnCommentLike'){
                  Message= activity_by.profile.full_name.toString()+" liked your reply comment "+(!(ReplycommentsData.comment.length > 50) ?ReplycommentsData.comment:ReplycommentsData.comment.toString().substring(0,50)+"..");
                }
                var ExpoToken = await UserModel.findById(ReplycommentsData.OnwerId)
                sendNotificationtoUser([ExpoToken.ExpopushToken],Message)
             
            }
        }

    }



    

  }



  function sendNotificationtoUser(somePushTokens,MessageData){

if(somePushTokens.length!==0){
let expo = new Expo({ accessToken: 'DtZTNN28E64ogPXSFU5O_xbqxv_Pj4C1gcyMhkKm' });
let messages = [];
for (let pushToken in somePushTokens) {
  // Each push token looks like ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
 
  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(somePushTokens[pushToken])) {
    console.error(`Push token ${somePushTokens[pushToken]} is not a valid Expo push token`);
    continue;
  }
 
  // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
  messages.push({
    to: somePushTokens[pushToken],
    sound: 'default',
    title:"GroupApp",
    body: MessageData,
    data: {MessageData },
  })
}


let chunks = expo.chunkPushNotifications(messages);
let tickets = [];
(async () => {
// Send the chunks to the Expo push notification service. There are
// different strategies you could use. A simple one is to send one chunk at a
// time, which nicely spreads the load out over time:
for (let chunk of chunks) {
try {
  let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
  console.log(ticketChunk);
  tickets.push(...ticketChunk);
  // NOTE: If a ticket contains an error code in ticket.details.error, you
  // must handle it appropriately. The error codes are listed in the Expo
  // documentation:
  // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
} catch (error) {
  console.error(error);
}
}
})();




let receiptIds = [];
for (let ticket of tickets) {
// NOTE: Not all tickets have IDs; for example, tickets for notifications
// that could not be enqueued will have error information and no receipt ID.
if (ticket.id) {
receiptIds.push(ticket.id);
}
}

let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
(async () => {
// Like sending notifications, there are different strategies you could use
// to retrieve batches of receipts from the Expo service.
for (let chunk of receiptIdChunks) {
try {
  let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
  console.log(receipts);

  // The receipts specify whether Apple or Google successfully received the
  // notification and information about an error, if one occurred.
  for (let receiptId in receipts) {
    let { status, message, details } = receipts[receiptId];
    if (status === 'ok') {
      continue;
    } else if (status === 'error') {
      console.error(
        `There was an error sending a notification: ${message}`
      );
      if (details && details.error) {
        // The error codes are listed in the Expo documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
        // You must handle the errors appropriately.
        console.error(`The error code is ${details.error}`);
      }
    }
  }
} catch (error) {
  console.error(error);
}
}
})();




}

  }