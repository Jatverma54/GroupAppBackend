const CONSTANT = require('./../common/constant');

aws = require('aws-sdk'), // ^2.2.41

multer = require('multer'), // "multer": "^1.1.0"
multerS3 = require('multer-s3'); //"^1.4.1"
const ID = CONSTANT.S3ID;
const SECRET = CONSTANT.S3SECRET;

aws.config.update({
    secretAccessKey: SECRET,
    accessKeyId: ID,
    region: CONSTANT.region
});

var s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: CONSTANT.PostMediaBucketName,
        acl: 'public-read',
        key: function (req, file, cb) { 
         
         cb(null, req.user._id + '-'+ file.originalname); //use Date.now() for unique file keys
      
        }
    }),   limits: { fileSize: 1024 * 1024 * 50 }, // 50MB
});


module.exports = upload