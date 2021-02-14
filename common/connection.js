var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB||'mongodb://localhost:27017/groupAppdb', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connectionasdf error:'));
 
db.once('open', function() {
  
});