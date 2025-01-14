var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var groupsObj = require('./../services/groups');

const auth = require('../middleware/auth')
const CONSTANT = require('../common/constant');

router.post('/createNewGroup', auth,function(req, res){

    groupsObj.addNewGroup(req, res);
  
});

router.get('/getPublicGroups', auth,function(req, res){   
 
    groupsObj.getPublicGroups(req, res);
       
});

router.post('/getPublicGroupsWithCategory', auth,function(req, res){   
 
    groupsObj.getPublicGroupsWithCategory(req, res);
       
});

router.delete('/:id', auth,function(req, res){

    groupsObj.deleteData(req,res);
});


router.post('/ViewGroupMembers', auth,function(req, res){
 
    groupsObj.viewGroupMembers(req,res);
});


router.post('/SendJoinRequest', auth,function(req, res){
  
    groupsObj.SendJoinRequest(req,res);
});


router.post('/DeleteSentJoinRequest', auth,function(req, res){
   
    groupsObj.DeleteSentJoinRequest(req,res);
});


router.get('/getJoinedPublicGroups', auth,function(req, res){
    
    groupsObj.getJoinedPublicGroups(req,res);
});

router.post('/updateGroupimage', auth,function(req, res){
 
    groupsObj.updateGroupImage(req,res);
});


router.post('/updateGroupinformation', auth,function(req, res){
 
    groupsObj.updateGroupinformation(req,res);
});


router.post('/AdmindeleteUserfromtheGroup', auth,function(req, res){
 
    groupsObj.AdmindeleteUserfromtheGroup(req,res);
});

router.post('/DismissUserAsAdmin', auth,function(req, res){
 
    groupsObj.DismissUserAsAdmin(req,res);
});


router.post('/MakeUserAsAdmin', auth,function(req, res){
 
    groupsObj.MakeUserAsAdmin(req,res);
});


router.post('/getAllGroupRequest', auth,function(req, res){
 
    groupsObj.getAllGroupRequest(req,res);
});


router.post('/confirmGroupRequest', auth,function(req, res){
 
    groupsObj.confirmGroupRequest(req,res);
});



router.post('/removeGroupRequest', auth,function(req, res){
 
    groupsObj.removeGroupRequest(req,res);
});


router.post('/leaveGroup', auth,function(req, res){
    
    groupsObj.leaveGroup(req,res);
});


router.get('/getJoinedPrivateGroups', auth,function(req, res){
   
    groupsObj.getJoinedPrivateGroups(req,res);
});


router.post('/groupSearchQuery', auth,function(req, res){
   
    groupsObj.groupSearchQuery(req,res);
});



router.get('/getPublicGroupListScreen/:id', auth,function(req, res){
  
    groupsObj.getPublicGroupListScreen(req,res);
});


module.exports = router;
