var nodemailer = require('nodemailer');
const CONSTANT = require('./constant');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'snehal.nagdeote@gmail.com',
    pass: 'fcxsnkpzrfptaqrk'
  }
});




function sendEmail(params, callback){
  //console.log("****params", params);
  var mailOptions = {
      from: CONSTANT.ADMIN_EMAIL,
      to: params.email,
      subject: 'Group App: Reset your password',
      html: `<h1>Hi ${params.FullName}</h1><p>Please use this code in the app to reset your password</p><h2>${params.resetCode}</h2>`
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