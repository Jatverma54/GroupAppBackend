var nodemailer = require('nodemailer');
const CONSTANT = require('./../common/constant');

var transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port:'587',
    auth: {
      user: CONSTANT.MailId,
      pass: CONSTANT.Mailpass
    }
  });

function sendEmail(params, callback){
  
  var mailOptions = {
      from: CONSTANT.ADMIN_EMAIL,
      to: params.email,
      subject: 'GroupHelpMe App: verification email',
      html: `<h1>GroupHelpMe App</h1><p>Hi ${params.name}, Thank you for registering with GroupHelpMe.</p><p>Your Username is ${params.username}</p><p>Please verify your account by clicking on below link.</p><a href="${CONSTANT.EndpointUrl}/users/verify/${params.userID}">Click here.</a><p></P><p>Best Regards,</p><p>GroupHelpMe Team</p><p>www.grouphelpme.com</p>`
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