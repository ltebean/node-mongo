var express = require('express') ;
var http = require('http'); 
var Step = require('step');

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

var mongo = require('mongodb');
var BSON = mongo.BSONPure;

var db = new mongo.Db('test', new mongo.Server('localhost', 27017, {auto_reconnect: true}));

db.open(function(err, db) {
	if(!err) {
		console.log("Connected to 'test' database");
		db.collection('invitation', {safe:true}, function(err, collection) {
			if (err) {
				console.log("The 'invitation' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
        });
	}
});


app.post('/resource/invitation', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function insertData(err,collection){
			collection.insert(req.body, {safe:true}, this)
		},
		function generateResponse(err, result){
			res.send(result[0]);		
		});	
}); 

app.get('/resource/invitation/:id', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			collection.findOne({'_id':new BSON.ObjectID(req.params.id)},this);
		},
		function generateResponse(err, result){
			res.send(result);
		});
}); 

app.get('/resource/invitation/open/weiboId/:weiboId/page/:page', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			collection.find(
			{
				'startDate':{$gte: new Date()}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees.user.weiboId':req.params.weiboId}]
			}).skip(req.params.page*8).limit(8).toArray(this);
		},
		function generateResponse(err, items){
			res.send(items);
		});
}); 

app.get('/resource/invitation/closed/weiboId/:weiboId/page/:page', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			collection.find(
			{
				'startDate':{$lt: new Date()}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees.user.weiboId':req.params.weiboId}]
			}).skip(req.params.page*8).limit(8).toArray(this);
		},
		function generateResponse(err, items){
			res.send(items);
		});
}); 

app.post('/resource/invitation/:id/status', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id),'invitees.user.weiboId':req.body.weiboId},[],
				{$set:{'invitees.$.status':req.body.status,'lastUpdateDate':new Date()}}, 
				{safe:true,new:true}, 
				this);
		},
		function generateResponse(err, item){
			res.send(item);			
		});	
}); 

app.post('/resource/invitation/:id/reply', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id)},[],
				{$push:{'replyList':req.body}, $set:{'lastUpdateDate':new Date()}}, 
				{safe:true,new:true}, 
				this);
		},
		function generateResponse(err, item){
			res.send(item);
		});	
}); 





http.createServer(app).listen(3000); 
console.log("server listening on port 3000");