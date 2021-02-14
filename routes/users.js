var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth')
var userObj = require('./../services/users');
const CONSTANT = require('./../common/constant');

/* GET users listing. */
router.post('/', function(req, res){
  
    bcrypt.hash(req.body.password, CONSTANT.BCRYPT_SALT, (err, encrypted) => {
        req.body.password = encrypted
        userObj.addUser(req, res);
    });
});

router.get('/',auth, function(req, res){

    userObj.getData(req,res);
});

router.delete('/:id', function(req, res){
    
});

router.delete('/me', auth, async (req, res) => {
   userObj.deleteData(req,res);
})


router.post('/login', async (req, res) => {
  
      
        userObj.loginUser(req, res)
       
  
})

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
     
      req.user.ExpopushToken=""
        await req.user.save()

        res.status(200).send("Logout successfull")
    } catch (e) {
        res.status(500).send("Logout unsuccessfull")
    }
})


router.get('/verify/:id', function(req, res){
    userObj.updateUser(req, res);
});


router.get('/userInformation',auth, function(req, res){
    
    userObj.userInformation(req,res);
});


router.post('/updateUserImage',auth, function(req, res){
   
    userObj.updateUserImage(req,res);
});


router.post('/updateUserinformation',auth, function(req, res){
    
    userObj.updateUserinformation(req,res);
});


router.post('/updateUserPassword',auth, function(req, res){
  

    bcrypt.hash(req.body.password, CONSTANT.BCRYPT_SALT, (err, encrypted) => {
        req.body.password = encrypted
        userObj.updateUserPassword(req, res);
    });
});



router.post('/userSearchQuery',auth, function(req, res){
    
    userObj.userSearchQuery(req,res);
});


router.post('/adduserTogroup',auth, function(req, res){
    
    userObj.adduserTogroup(req,res);
});


router.post('/ForgetPassword/AuthenticateEmail', function(req, res){
    
    userObj.AuthenticateEmail(req,res);
});

router.post('/ForgetPassword/AuthenticateConfirmationCode', function(req, res){
    
    userObj.AuthenticateConfirmationCode(req,res);
});



router.post('/updateUserPasswordFromForget', function(req, res){
  

    bcrypt.hash(req.body.password, CONSTANT.BCRYPT_SALT, (err, encrypted) => {
      
        req.body.password = encrypted
        userObj.updateUserPasswordFromForget(req, res);
    });
});


router.post('/turnOnOffNotification',auth, function(req, res){
    
    userObj.turnOnOffNotification(req,res);
});

module.exports = router;
