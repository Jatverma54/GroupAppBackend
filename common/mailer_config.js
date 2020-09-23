var nodemailer = require('nodemailer');
const CONSTANT = require('./../common/constant');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'snehal.nagdeote@gmail.com',
    pass: 'fcxsnkpzrfptaqrk'
  }
});

function sendEmail(params, callback){
  console.log("****params", params);
  var mailOptions = {
      from: CONSTANT.ADMIN_EMAIL,
      to: params.email,
      subject: 'Group App: verification email',
      html: `<h1>Group App</h1><p>Thank you for registering with Group App.</p><p>Please verify your account by clicking on below link.</p><a href="http://localhost:3000/users/verify/${params.userID}">Click here.</a>`
  };   
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
          callback(error, false);
      } else {
          callback(null, info.response);
      }
  });      
}

module.exports = sendEmail;