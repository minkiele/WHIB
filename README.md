WHIB
====

Where have I been. 

Startup
-------

Clone the repository, having installed *node* with *npm*, *grunt-cli* and *bower*.
Next run *npm install* and *bower install* to install required *grunt* tasks and javascript assets.

Some time ago I added `WHIB.sh`, a bash script that tries to simplify the common tasks used in development
eg. `grunt watch` or `foreman start`. In the latter case, before trying to start foreman the script checks
if the user is logged into Heroku.

Remember to call `heroku config:set GMAPS_KEY=GMAPS_API_KEY`

WHIB.sh has some useful commands I wrote to automatize the most common operations when deploying to Heroku
