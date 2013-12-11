var express = require('express');
var consolidate = require('consolidate');
var app = express();
app.engine('html', consolidate.hogan);
app.use(express.static(__dirname));
var port = process.env.PORT || 5000;
app.listen(port, function(){
  console.log('Listening on ' + port);
});
