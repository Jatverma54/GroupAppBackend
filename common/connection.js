var mongoose = require('mongoose');
mongoose.connect(process.env.mongoDB||'mongodb://localhost:27017/groupAppdb', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connectionasdf error:'));
 
db.once('open', function() {
  //console.log("Successfully connected to MongoDB!");
});//||'mongodb://localhost:27017/groupAppdb'