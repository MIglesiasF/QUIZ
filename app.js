var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require("method-override");
var session = require('express-session');
//var connect        = require('connect');


var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('Quiz Martin 2015'));
app.use(session());
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, 'public')));

// Helpers dinamicos:
app.use(function(req, res, next){
	// guardar path en session.redir para despues de login
	if (!req.path.match(/\/login|\/logout/))
	{
		req.session.redir = req.path;
		//console.log('req.session.redir = ' + req.session.redir);
	}

	// Hacer visible req.session en las vistas
	res.locals.session = req.session;
	next();
});

// Control de tiempo de conexion sin operaciones y logout automático:
app.use(function(req, res, next){
	// Comprobamos si el usuario esta logueado
	//console.log('Control de tiempo de conexion sin operaciones y logout automático:');
	if (req.session.user)
	{		
		if (!req.session.timeLogin)
		{
			req.session.timeLogin = Date.now();
			//console.log('Inicializamos el contador de tiempo de session: ' + req.session.timeLogin);
		}
		else{
			//console.log('Tiempo sin operaciones: ' + ((Date.now()- req.session.timeLogin)/1000));
			if((Date.now() - req.session.timeLogin) > 120000 ){
				delete req.session.user;
				delete req.session.timeLogin;
				//console.log('Ha expirado el tiempo de login sin realizar operaiones borramos el objeto session: ');
			}else{
				//console.log('Realizamos una operacion logueados y inicializamos el contador: ' + req.session.timeLogin);
				req.session.timeLogin = Date.now();
			}
		}
		
	}

	// Hacer visible req.session en las vistas
	res.locals.session = req.session;
	next();
});

app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
			errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
		errors: []
    });
});


module.exports = app;
