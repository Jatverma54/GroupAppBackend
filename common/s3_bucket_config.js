const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');
const fileType = require('file-type')
const CONSTANT = require('./../common/constant');
const ID = CONSTANT.S3ID;
const SECRET = CONSTANT.S3SECRET;
//const Buffer=require('buffer');
// The name of the bucket that you have created
//const BUCKET_NAME = 'groupappproject/ProfilePictures';

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET
});

function generator() {

  const ran1 = () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].sort((x, z) => {
    ren = Math.random();
    if (ren == 0.5) return 0;
    return ren > 0.5 ? 1 : -1
  })
  const ran2 = () => ran1().sort((x, z) => {
    ren = Math.random();
    if (ren == 0.5) return 0;
    return ren > 0.5 ? 1 : -1
  })

  return Array(6).fill(null).map(x => ran2()[(Math.random() * 9).toFixed()]).join('')
}

exports.uploadFile = (fileName, userName, BUCKET_NAME) => {
  return new Promise(async function (resolve, reject) {


    const buffer = Buffer.from(fileName.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    const mimeInfo = await fileType.fromBuffer(buffer)


    const { ext, mime } = mimeInfo;
    var randomNumber = generator();

    let filePath=userName + "_" + Date.now() + "_" + randomNumber + "." + ext;
    const params = {
      Bucket: BUCKET_NAME,
      Key: filePath,//+imageExtension, // File name you want to save as in S3
      Body: buffer,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: mime

    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(CONSTANT.CloudFrontURL+BUCKET_NAME.split('/')[1]+'/'+filePath);
        //resolve(data.Location);
      }

    });
  });
};
exports.removeFileFromS3 = function (filename, BUCKET_NAME, callback) {

  const filenamePlaceHolder = CONSTANT.PlaceholderImageUrl.split('/').slice(-1)[0];
  if (filename.toString().trim() !== filenamePlaceHolder.toString().trim()) {

    var params = {
      Bucket: BUCKET_NAME,
      Key: filename
    };
    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.log(err);
        callback(err, null);
      } else {
        callback(null, true);
      }
    });

  }
}

exports.removeMultipleFilesFromS3 = function (fileArr, BUCKET_NAME, callback) {
  //Input format
  var filenameObjects = [];
  var fileName = "";
  for (var i = 0; i < fileArr.length; i++) {
    fileName = fileArr[i].split("/")[3] + "/" + fileArr[i].split("/")[4];
    if (fileName) {
      filenameObjects.push({ Key: fileName });
    }
  }
  var params = {
    Bucket: "groupappproject",
    Delete: {
      Objects: filenameObjects
    }
  };
  s3.deleteObjects(params, function (err, data) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      console.log(data)
      callback(null, true);
    }
  });
}