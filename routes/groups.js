var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var groupsObj = require('./../services/groups');

const auth = require('../middleware/auth')
const CONSTANT = require('../common/constant');

router.post('/createNewGroup', auth,function(req, res){

   
    console.log("****req.body of createNewGroup", req.body);
    groupsObj.addNewGroup(req, res);
  
});

router.get('/getPublicGroups', auth,function(req, res){   
 
    groupsObj.getPublicGroups(req, res);
       
});

router.post('/getPublicGroupsWithCategory', auth,function(req, res){   
 
    groupsObj.getPublicGroupsWithCategory(req, res);
       
});

router.delete('/:id', auth,function(req, res){
    console.log("****req.body.password", req.body.password);
    groupsObj.deleteData(req,res);
});


router.post('/ViewGroupMembers', auth,function(req, res){
    console.log("****req.body.password", req.body);
    groupsObj.viewGroupMembers(req,res);
});


router.post('/SendJoinRequest', auth,function(req, res){
    console.log("****req.body.password", req.body);
    groupsObj.SendJoinRequest(req,res);
});


router.post('/DeleteSentJoinRequest', auth,function(req, res){
    console.log("****req.body.password", req.body);
    groupsObj.DeleteSentJoinRequest(req,res);
});


router.get('/getJoinedPublicGroups', auth,function(req, res){
    console.log("****req.body.password", req.body);
    groupsObj.getJoinedPublicGroups(req,res);
});

module.exports = router;
