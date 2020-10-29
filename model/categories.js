var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
//Define a schema
var Schema = mongoose.Schema;

var CategoryModelSchema = new Schema({ 
    title: { type: String, required: true, unique: true, trim: true, },
    color: { type: String,trim: true},
    Groups:{ type: String,trim: true},
    image:{type: String}
    
},{timestamps:true});

CategoryModelSchema.plugin(uniqueValidator);

const CategoryModel = mongoose.model('CategoryModel', CategoryModelSchema );

module.exports = CategoryModel