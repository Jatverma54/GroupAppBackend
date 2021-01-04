var nodemailer = require('nodemailer');
const CONSTANT = require('./../common/constant');

var transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port:'587',
    auth: {
      user: 'support@grouphelpme.com',
      pass: 'Awesome@2394'
    }
  });

function sendEmail(params, callback){
  //console.log("****params", params);
  var mailOptions = {
      from: CONSTANT.ADMIN_EMAIL,
      to: params.email,
      subject: 'GroupHelpMe App: verification email',
      html: `<h1>GroupHelpMe App</h1><p>Thank you for registering with GroupHelpMe.</p><p>Please verify your account by clicking on below link.</p><a href="http://localhost:3000/users/verify/${params.userID}">Click here.</a><p>Best Regards,</p><p>GroupHelpMe Team</p>`
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