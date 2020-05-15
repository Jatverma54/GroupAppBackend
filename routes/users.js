var express = require('express');
var router = express.Router();
var userObj = require('./../services/users');

/* GET users listing. */
router.post('/', userObj.addUser);

module.exports = router;
