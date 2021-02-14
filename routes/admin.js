var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var adminObj = require('./../services/admin');

const auth = require('../middleware/auth')
const CONSTANT = require('../common/constant');

router.post('/AddCategoriesToDB', auth,function(req, res){

    adminObj.addCategories(req, res);
  
});

router.get('/GetCategoriesToDB', auth,function(req, res){   
 
    adminObj.getCategories(req, res);
       
});

router.delete('/deleteCategory/:id', auth,function(req, res){
   
    adminObj.deleteData(req,res);
});


module.exports = router;
