var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var CategoryModelSchema = new Schema({
    name: String
});

exports.module = mongoose.model('CategoryModel', CategoryModelSchema );