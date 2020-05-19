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

module.exports = router;
