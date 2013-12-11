/*
 * Start the app
 */
var express = require('express');
var consolidate = require('consolidate');
var app = express();

app.engine('html', consolidate.hogan);
app.set('view engine', 'html');
app.set('views', '.');

/*
 * Static routes and serve index.html
 */
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));
app.get('/', function(req,res){
	res.render('index.html', {
		GMAPS_KEY: process.env.GMAPS_KEY
	});
});

//Port selector for Heroku (Env)/ Foreman (5000)
var port = process.env.PORT || 5000;

console.log(process.env.GMAPS_KEY);

//Silence, the audience is listening
app.listen(port, function(){
  console.log('Listening on ' + port);
});
