var express = require('express') ;
var http = require('http'); 
var Step = require('step');

var app=express();
app.configure(function () {
	app.use(express.bodyParser());
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


// app.get('/invitation/weiboId/:weiboId/page/:page', function(req, res){ 
// 	console.log(req.query.weiboId);
// 	db.collection('invitation', function(err, collection) {
// 		collection.find({'inviter.user.weiboId':req.params.weiboId}).skip(req.params.page*5).limit(5).toArray(function(err, items) {
// 			res.send(items);
// 		});
// 	});
// }); 

app.get('/invitation/weiboId/:weiboId/page/:page', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			collection.find({'inviter.user.weiboId':req.params.weiboId}).skip(req.params.page*3).limit(3).toArray(this);
		},
		function generateResponse(err, items){
			res.send(items);
		});
}); 

// app.post('/invitation/:id/reply', function(req, res){ 
// 	console.log(req.params.id);
// 	console.log(req.body);
// 	db.collection('invitation', function(err, collection) {
// 		collection.update({'_id':new BSON.ObjectID(req.params.id)},{$push:{replyList:req.body}}, {safe:true}, function(err, result) {
// 			if(err){
// 				res.send(500);
// 			}else{
// 				res.send(200);
// 			}

// 		});
// 	});
// }); 

app.post('/invitation/:id/reply', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			collection.findAndModify({'_id':new BSON.ObjectID(req.params.id)},[],
				{$push:{replyList:req.body}}, {safe:true,new:true}, this);
		},
		function generateResponse(err, item){
			if(err){
				res.send(500);
			}else{
				res.send(item);
			}
		});	
}); 


app.post('/invitation', function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function insertData(err,collection){
			collection.insert(req.body, {safe:true}, this)
		},
		function generateResponse(err, result){
			if(err){
				res.send(500);
			}else{
				res.send(result[0]);
			}
		});	
}); 


http.createServer(app).listen(3000); 
console.log("server listening on port 3000");