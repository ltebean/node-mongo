var express = require('express') ;
var http = require('http'); 
var invitation=require('./invitation.js');

var app=express();
app.configure(function () {
	app.use(express.bodyParser());
	app.use(function errorHandler(err, req, res, next) {
		console.error(err.stack);
		if (req.xhr) {
			res.send(500, { error: 'Something blew up!' });
		} else {
			res.status(500);
			res.render('error', { error: err });
		}
	});
});

app.post('/resource/invitation', invitation.create); 
app.get('/resource/invitation/:id', invitation.find); 
app.get('/resource/invitation/open/weiboId/:weiboId/page/:page', invitation.findOpen); 
app.get('/resource/invitation/closed/weiboId/:weiboId/page/:page', invitation.findClosed); 
app.post('/resource/invitation/:id/status', invitation.replyStatus); 
app.post('/resource/invitation/:id/reply', invitation.replyComment); 

http.createServer(app).listen(3000); 
console.log("server listening on port 3000");