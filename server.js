var express = require('express') ;
var http = require('http'); 
var util = require("util");
var invitation = require('./invitation.js');
var pic = require('./pic.js');
var msg = require('./msg.js');
var crawler = require('./crawler.js');
var notification = require('./notification.js');

var app=express();
app.configure(function () {
	app.use(express.bodyParser());
	app.use('/public', express.static(__dirname + '/public'));
	app.use(app.router);	
	app.use(function(err, req, res, next){
		res.send(500, { error: err.message});
	});
});

var server=http.createServer(app);
server.listen(3000); 
console.log("server listening on port 3000");

app.post('/resource/invitation', invitation.create); 
app.post('/resource/invitation/welcome', invitation.welcome); 
app.get('/resource/invitation/:id', invitation.find); 
app.get('/resource/invitation/open/weiboId/:weiboId/page/:page', invitation.findOpen); 
app.get('/resource/invitation/closed/weiboId/:weiboId/page/:page', invitation.findClosed); 
app.post('/resource/invitation/:id/status', invitation.replyStatus); 
app.post('/resource/invitation/:id/reply', invitation.replyComment); 
app.post('/resource/invitation/:id/picWall', invitation.addPic); 


app.get('/resource/cities', crawler.findCities);
app.get('/resource/shop', crawler.searchShop);

app.post('/resource/apns/registration', notification.register);

app.post('/resource/pic',pic.uploadPic);

// var io= require('socket.io').listen(server);
// io.sockets.on('connection', function (socket) {
// 	var weiboId;
// 	socket.on('register', function (data) {
// 		weiboId=data;
// 		msg.addListener(weiboId,function(msg){
// 			socket.emit('news',msg);
// 		});
// 		//msg.addMessage(weiboId,'hahaha');
// 	});

// 	socket.on('disconnect', function () {
// 		msg.removeListener(weiboId)
// 	});
// });




