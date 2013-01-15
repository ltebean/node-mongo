
var Step = require('step');
var db = require('./db.js').sharedDB;

var listener={};

exports.addListener=function (weiboId,callback) {
	listener[weiboId]=callback;
	Step(
		function getCollection(){
			db.collection('msg', this); 
		},
		function findUnReadMsg(err,collection){
			if (err) throw err;
			collection.findAndModify(
				{'weiboId':weiboId},[],
				{$set:{'msg':[]}},
				{safe:true,new:false,upsert:true},
				this);
		},
		function generateResponse(err, result){
			console.dir(result);
			if(result && result.msg && result.msg.length>0){
				callback(result.msg);
			}
		});
		console.dir(listener);

};

exports.addMessage=function(weiboId,msg) {
	if(listener[weiboId]){
		//console.log('send to'+weiboId);
		listener[weiboId]([msg]);

	}else{
		Step(
			function getCollection(){
				db.collection('msg', this); 
			},
			function saveMessage(err,collection){
				if (err) throw err;
				collection.findAndModify(
					{'weiboId':weiboId},[],
					{$push:{'msg':msg}},
					{safe:true,new:false,upsert:true},
					this);
			});
	}
};

exports.removeListener=function(weiboId){
	if(listener[weiboId]){
		delete listener[weiboId];
	}
	console.dir(listener);
};


