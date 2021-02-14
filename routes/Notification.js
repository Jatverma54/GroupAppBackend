var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var notificationObj = require('./../services/Notification');

const auth = require('../middleware/auth')
const CONSTANT = require('../common/constant');

router.get('/:id', auth,function(req, res){
 
    notificationObj.getNotification(req, res);
  
});


router.get('/', auth,function(req, res){
 
    notificationObj.getAllNotification(req, res);
  
});



module.exports = router;
