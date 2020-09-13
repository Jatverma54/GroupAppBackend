var mongoose = require('mongoose');

//Define a schema
var Schema = mongoose.Schema;

var CategoryModelSchema = new Schema({ 
    title: { type: String, required: true, unique: true, trim: true, },
    color: { type: String},
    Groups:{ type: String},
    image:{type: String}
    
});

const CategoryModel = mongoose.model('CategoryModel', CategoryModelSchema );

module.exports = CategoryModel