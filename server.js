// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs = require("fs");
var http = require('http');
var gzippo = require('gzippo');

require.extensions[".json"] = function (m) {
    m.exports = JSON.parse(fs.readFileSync(m.filename));
};

http.globalAgent.maxSockets = 50;

// var handlebarsHelpers = require('./app/handlebarsHelpers');

// configuration ===========================================
	
// config files
var port = process.env.PORT || 9999; // set our port
//var appConfig = require('./config/config');


// connect to our mongoDB database (commented out after you enter in your own credentials)
//connectionsubject = mongoose.createConnection(appConfig.Db.Servers.dashboard);
//connectionThresholdDb = mongoose.createConnection(appConfig.Db.Servers.thresholdDatabase);


// app.set('trust proxy', 1); // trust first proxy
app.use(cookieParser());
app.use(session({
    secret: '{GE_iProDiGE_Lab}',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !true }
    // cookie: { secure: true }
}));

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
 app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
//app.use(gzippo.staticGzip(__dirname + '/public', {clientMaxAge:  1000 * 60 * 60 * 24 * appConfig.route.cache} ));

//defaultLayout: 'main',
// app.engine('.hbs', exphbs({ extname: '.hbs',helpers:handlebarsHelpers}));
// app.set('view engine', '.hbs');
app.engine('html', require('atpl').__express);
// app.engine('html', require('atpl').__express);
app.set('devel', false);
app.set('view engine', 'html');
app.set('view cache', false);
app.set('views', __dirname + '/views');



// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
var server=  app.listen(port);
server.timeout = 120000;
// use http/https as necessary
http.globalAgent.maxSockets = 50;
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app

process.on('SIGINT', function() {
    console.log('SIGINT');
    process.exit();
});