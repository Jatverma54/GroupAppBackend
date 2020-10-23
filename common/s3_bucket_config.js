const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const fileType = require('file-type')
const ID = 'AKIAJT524GEZ7PPA3GPQ';
const SECRET = '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';
const CONSTANT = require('./../common/constant');
//const Buffer=require('buffer');
// The name of the bucket that you have created
//const BUCKET_NAME = 'groupappproject/ProfilePictures';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

exports.uploadFile = (fileName, userName,BUCKET_NAME) => {
    return new Promise (async function(resolve, reject){
        // Read content from the file
     //   const fileContent = fileName;//fs.readFileSync(fileName);
  
    //  const mimeInfo = fileType(Buffer.from(fileName, 'base64'))

    //  //console.log(mimeInfo)

    //  const contents = fs.readFileSync(fileName);
    //  //console.log("Entered")

   
      //  //console.log(FileType.fromFile('Unicorn.png'));
        //=> {ext: 'png', mime: 'image/png'}
   
    

       const buffer = Buffer.from(fileName.replace(/^data:image\/\w+;base64,/, ''), 'base64');

        const mimeInfo = await fileType.fromBuffer(buffer)

 
     const {ext,mime}=mimeInfo;

      //  const imageExtension = path.extname(fileName);
        // Setting up S3 upload parameters
        const params = {
            Bucket: BUCKET_NAME,
            Key: userName+"_"+Date.now.getTime()+"."+ext,//+imageExtension, // File name you want to save as in S3
            Body: buffer,
            ACL:'public-read',
            ContentEncoding: 'base64',
            ContentType: mime
              
        };

        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Location);
            }
            //console.log(`File uploaded successfully. ${data.Location}`);
        });
    });
};
exports.removeFileFromS3 = function(filename, BUCKET_NAME, callback) {

  const filenamePlaceHolder = CONSTANT.PlaceholderImageUrl.split('/').slice(-1)[0];
  if(filename.toString().trim()!==filenamePlaceHolder.toString().trim()){
   
    var params = {
      Bucket: BUCKET_NAME,
      Key: filename
    };
    s3.deleteObject(params, function(err, data) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, true);
      }
    });

  }
  }

  exports.removeMultipleFilesFromS3 = function(fileArr, BUCKET_NAME, callback) {
    //Input format
    var filenameObjects = [];
    var fileName = "";
    for(var i = 0; i < fileArr.length; i++){
      fileName = fileArr[i].split("/")[3]+"/"+fileArr[i].split("/")[4];
      if(fileName){
        filenameObjects.push({Key : fileName});
      }
    }
    var params = {
      Bucket: "groupappproject",
      Delete: {
        Objects: filenameObjects
      }
    };
    s3.deleteObjects(params, function(err, data) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        console.log(data)
        callback(null, true);
      }
    });
  }