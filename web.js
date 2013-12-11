/*
 * Start the app
 */
var express = require('express');
var app = express();

/*
 * Static routes and serve index.html
 */
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.get('/', function(req,res){
	res.sendfile('index.html');
});

//Port selector for Heroku (Env)/ Foreman (5000)
var port = process.env.PORT || 5000;

//Silence, the audience is listening
app.listen(port, function(){
  console.log('Listening on ' + port);
});
