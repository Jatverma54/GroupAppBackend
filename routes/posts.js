var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

var groupsObj = require('./../services/groups');
var postObj = require('./../services/posts');
const auth = require('../middleware/auth')
const upload = require('../middleware/multer')
const CONSTANT = require('../common/constant');

router.post('/createNewPost/', auth,[upload.array('file')], function (req, res) {

    postObj.addNewPost(req, res);

});


router.post('/getAllPostofGroup', auth, function (req, res) {

    postObj.getAllPostofGroup(req, res);

});

router.post('/getAllUserPostofGroup', auth, function (req, res) {



    postObj.getAllUserPostofGroup(req, res);

});

router.delete('/:id', auth, function (req, res) {
    //console.log("****req.body.password", req.body.password);
    postObj.deleteData(req, res);
});

router.post('/deleteDataAndUserfromGroup', auth, function (req, res) {
    //console.log("****req.body.password", req.body.password);
    postObj.deleteDataAndUserfromGroup(req, res);
});


router.post('/like', auth, function (req, res) {



    postObj.like(req, res);

});


router.get('/viewlikes/:id', auth, function (req, res) {



    postObj.viewlikes(req, res);

});

router.post('/createNewComment', auth, function (req, res) {



    postObj.addNewComment(req, res);

});


router.get('/getComments/:id', auth, function (req, res) {

    postObj.getComments(req, res);

});

router.post('/Commentslike', auth, function (req, res) {

    postObj.Commentslike(req, res);

});


router.post('/viewCommentlikes', auth, function (req, res) {

    postObj.viewCommentlikes(req, res);

});

router.post('/deleteComment', auth, function (req, res) {

    postObj.deleteComment(req, res);

});


router.post('/getReplyComments', auth, function (req, res) {

    postObj.getReplyComments(req, res);

});
//groupPost

router.post('/addNewReplyComment', auth, function (req, res) {



    postObj.addNewReplyComment(req, res);

});


router.post('/replyCommentslike', auth, function (req, res) {

    postObj.replyCommentslike(req, res);

});


router.post('/viewReplyCommentlikes', auth, function (req, res) {

    postObj.viewReplyCommentlikes(req, res);

});

router.post('/deleteReplyComment', auth, function (req, res) {

    postObj.deleteReplyComment(req, res);

});


router.get('/getAllPublicJoinedPostofGroup', auth, function (req, res) {

    postObj.getAllPublicJoinedPostofGroup(req, res);

});

// router.post('/uploadMultipleImages/',auth,[upload.array('files')], function (req, res,next) {


//   res.send("success")
//   //  postObj.uploadMultipleImages(req, res);

// });


// router.post('/getAllPersonalPostofGroup', auth, function (req, res) {

//     postObj.getAllPersonalPostofGroup(req, res);

// });


module.exports = router;
