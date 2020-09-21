const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');

const ID = 'AKIAJT524GEZ7PPA3GPQ';
const SECRET = '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';

// The name of the bucket that you have created
const BUCKET_NAME = 'groupappproject';

const s3 = new AWS.S3({
    accessKeyId: ID,
    secretAccessKey: SECRET
});

const uploadFile = (fileName, userName) => {
    return new Promise(function(resolve, reject){
        // Read content from the file
        const fileContent = fileName;//fs.readFileSync(fileName);
       // const imageExtension = path.extname(fileName);
        // Setting up S3 upload parameters
        const params = {
            Bucket: BUCKET_NAME,
            Key: userName+"_"+new Date().getTime()+".png",//+imageExtension, // File name you want to save as in S3
            Body: fileContent,
            ACL:'public-read'
        };

        // Uploading files to the bucket
        s3.upload(params, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data.Location);
            }
            console.log(`File uploaded successfully. ${data.Location}`);
        });
    });
};

module.exports = uploadFile;