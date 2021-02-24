var CategoryModel = require('./../model/categories');
const auth = require('../middleware/auth');
const groupModel = require('../model/groups');

//var UserModel = require('./../model/users');

exports.addCategories = function (req, res, next) {

    try {
        if (req.user.profile.role === "Admin") {


            CategoryModel.insertMany(req.body, async (err, result) => {

                if (err) {
                    res.status(400).send({ error: err });
                } else {
                    res.status(201).send({ message: "Data saved successfully.", result, })//token

                }

            })
        } else {
            res.status(400).send("User is not an Admin");

        }
    } catch (e) {
        res.status(400).send({ error: e });
    }
}


exports.getCategories = async (req, res) => {
    try {

        const CategoryData = await CategoryModel.find();
        res.status(200).json({ message: "Data: ", result: CategoryData });
    } catch (err) {
        res.status(400).json({ error: err });
    }
}

exports.deleteData = async (req, res) => {
    try {
        const RemovedData = await CategoryModel.remove({ _id: req.params.id });
        res.status(200).json({ message: "Removed User: ", result: RemovedData });
    } catch (err) {
        res.status(400).json({ message: err });
    }
}
