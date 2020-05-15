var UserModel = require('./../model/users');

exports.addUser = function(req, res, next){
    console.log("req.body", req.body);
    var UserData = new UserModel(req.body);
    UserData.save(function (err, result) {
        console.log("*****err", err);
        if (err) {
            res.send({error: err, message: "Data not saved."});
        } else {
            res.send({message: "Data saved successfully.", result: result});
        }
        
        // saved!
    })
}