const CONSTANT = require('./../common/constant');

aws = require('aws-sdk'), // ^2.2.41

multer = require('multer'), // "multer": "^1.1.0"
multerS3 = require('multer-s3'); //"^1.4.1"
const ID = 'AKIAJT524GEZ7PPA3GPQ';
const SECRET = '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';

aws.config.update({
    secretAccessKey: SECRET,
    accessKeyId: ID,
    region: 'us-east-1'
});

var s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: CONSTANT.PostMediaBucketName,
        acl: 'public-read',
        key: function (req, file, cb) { 
          
         cb(null, req.user._id + '-'+req.body.GroupId+'-'+ file.originalname); //use Date.now() for unique file keys
      
        }
    }),   limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
});


module.exports = upload