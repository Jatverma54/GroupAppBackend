var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/groupAppdb', { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connectionasdf error:'));
 
db.once('open', function() {
  //console.log("Successfully connected to MongoDB!");
});