var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var userObj = require('./../services/users');
const CONSTANT = require('./../common/constant');

/* GET users listing. */
router.post('/', function(req, res){
    console.log("****req.body.password", req.body.password);
    bcrypt.hash(req.body.password, CONSTANT.BCRYPT_SALT, (err, encrypted) => {
        console.log("****req.body.password", req.body.password);
        console.log("****encrypted", encrypted);
        req.body.password = encrypted
        userObj.addUser(req, res);
    });
});

router.get('/', function(req, res){
    console.log("****User data");
    userObj.getData(req,res);
});

router.delete('/:id', function(req, res){
    console.log("****req.body.password", req.body.password);
    userObj.deleteData(req,res);
});



module.exports = router;
