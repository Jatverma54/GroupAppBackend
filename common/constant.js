var constants = {
  BCRYPT_SALT: 10,
  ADMIN_EMAIL: "support@grouphelpme.com",
  PlaceholderImageUrl:
    "https://dlp3njndj5fnx.cloudfront.net/PlaceholderImage.png",
  ProfilePictureBucketName: "groupappproject/ProfilePictures",
  GroupProfilePictureBucketName: "groupappproject/GroupProfilePicture",
  PostMediaBucketName: "groupappproject/PostMedia",
  CloudFrontURL: "https://dlp3njndj5fnx.cloudfront.net/",
  BucketURL:
    "https://groupappproject.s3.ap-south-1.amazonaws.com/groupappproject/",
  S3ID: process.env.S3ID,
  S3SECRET: process.env.S3SECRET,
  region: "us-east-1",
  MailId: process.env.MAILID,
  Mailpass: process.env.MAILPASS,
  EndpointUrl: "https://d3f8dq47pv4rsx.cloudfront.net",
};

module.exports = constants;
