var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var adminObj = require('./../services/admin');

const auth = require('../middleware/auth')
const CONSTANT = require('../common/constant');

router.post('/AddCategoriesToDB', auth,function(req, res){

   
    console.log("****req.body of AddCategoriesToDB", req.body);
    adminObj.addCategories(req, res);
    
    
    
    
   
});

module.exports = router;
