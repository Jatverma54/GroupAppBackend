var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var notificationObj = require('./../services/Notification');

const auth = require('../middleware/auth')
const CONSTANT = require('../common/constant');

router.get('/:id', auth,function(req, res){
    
   
    //console.log("****req.body of createNewGroup", req.body);
    notificationObj.getNotification(req, res);
  
});



module.exports = router;
