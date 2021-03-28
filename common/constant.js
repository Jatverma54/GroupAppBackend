var constants = {
    BCRYPT_SALT: 10,
    ADMIN_EMAIL: 'support@grouphelpme.com',
    PlaceholderImageUrl:"https://d13ai2vn5o5vi1.cloudfront.net/PlaceholderImage.png",
    ProfilePictureBucketName:'groupappproject/ProfilePictures',
    GroupProfilePictureBucketName:'groupappproject/GroupProfilePicture',
   PostMediaBucketName:'groupappproject/PostMedia',
   CloudFrontURL:'https://d13ai2vn5o5vi1.cloudfront.net/',
  BucketURL: 'https://groupappproject.s3.ap-south-1.amazonaws.com/groupappproject/',
   S3ID : process.env.S3ID,
 S3SECRET : process.env.S3SECRET,
 region: 'us-east-1',
  MailId: process.env.MAILID,
  Mailpass: process.env.MAILPASS,
  EndpointUrl:'http://GroupAppbackend-dev.ap-south-1.elasticbeanstalk.com'
}

module.exports = constants;