var nodemailer = require('nodemailer');
const CONSTANT = require('./constant');

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
      subject: 'GroupHelpMe App: Reset your password',
      html: `<h1>Hi ${params.FullName}</h1><p>Please use this code in the app to reset your password</p><h2>${params.resetCode}</h2><p>Best Regards,</p><p>GroupHelpMe Team</p><p>www.grouphelpme.com</p>`
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