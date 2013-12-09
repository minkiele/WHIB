var express = require('express');
var fs = require('fs');

var indexStatic = fs.readFile('index.html', {encoding: 'utf-8'}, function(err, data){
  var app = express();
  app.get('/', function(req, res){
    res.send(data);
  });
  var port = process.env.PORT || 5000;
  app.listen(port, function(){
    console.log('Listening on ' + port);
  });
});

  
