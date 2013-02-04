var apns = require('apns'), notification, options, connection;
var db = require('./db.js').sharedDB;

options = {
   keyFile : "conf/dev/key.pem",
   certFile : "conf/dev/cert.pem",
   gateway:'gateway.sandbox.push.apple.com',
   debug : true,
};

var connection = new apns.Connection(options);

exports.send=function(weiboId,msg,payload){
	Step(
		function getCollection(){
			db.collection('apns', this); 
		},
		function findResult(err,collection){
			if (err) throw err;
			collection.find({'user.weiboId':weiboId}).toArray(this);
		},
		function generateResponse(err, results){
			if(err) throw err;
			results.forEach(function(result){
				notification = new apns.Notification();
				notification.payload = payload;
				notification.badge = 1;
				notification.alert = msg;
				notification.device = new apns.Device(result.deviceToken);
				connection.sendNotification(notification);
			})
		});
}

exports.register=function(req,res){
	Step(
		function getCollection(){
			db.collection('apns', this); 
		},
		function insertData(err,collection){
			if (err) throw err;
			collection.update(
				{'user.weiboId':req.body.user.weiboId},
				req.body,
				{safe:true,new:true,upsert:true},
				this);
		},
		function generateResponse(err, result){
			if (err) throw err;
			res.send(result);		
		});	
}