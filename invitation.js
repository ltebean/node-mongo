
var Step = require('step');
var mongo = require('mongodb');
var check = require('validator').check;
var msg=require('./msg.js');
var db = require('./db.js').sharedDB;
var BSON = mongo.BSONPure;



exports.create=function(req, res){ 
	//validateInvitation(req.body);
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function insertData(err,collection){
			if (err) throw err;
			collection.insert(req.body, {safe:true}, this)
		},
		function generateResponse(err, result){
			if (err) throw err;
			res.send(result[0]);		
		});	
} 

exports.find=function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			if (err) throw err;
			collection.findOne({'_id':new BSON.ObjectID(req.params.id)},this);
		},
		function generateResponse(err, result){
			if (err) throw err;
			res.send(result);
		});
}

exports.findOpen=function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			if (err) throw err;
			collection.find({
				'startDate':{$gte: new Date()}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees.user.weiboId':req.params.weiboId}]
			}).skip(req.params.page*8).limit(8).toArray(this);
		},
		function generateResponse(err, item){
			if (err) throw err;
			res.send(item);
		});
}

exports.findClosed=function(req, res){
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			if (err) throw err;
			collection.find({
				'startDate':{$lt: new Date()}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees.user.weiboId':req.params.weiboId}]
			}).skip(req.params.page*8).limit(8).toArray(this);
		},
		function generateResponse(err, item){
			if (err) throw err;
			res.send(item);
		});
}

exports.replyStatus= function(req, res){
	Step(
		function getCollection(){
			db.collection('invitation', this);
		},
		function updateData(err,collection){
			if (err) throw err;
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id),'invitees.user.weiboId':req.body.weiboId},[],
				{$set:{'invitees.$.status':req.body.status,'lastUpdateDate':new Date()}},
				{safe:true,new:true},
				this);
		},
		function sendMessage(err,invitation){
			if (err) throw err;
			invitation.invitees.forEach(function(invitee){
				if(invitee.user.weiboId!=req.body.weiboId){
					msg.addMessage(invitee.user.weiboId,{type:'status',body:req.body});	
				}
			});
			if(invitation.inviter.user.weiboId!=req.body.weiboId){
				msg.addMessage(invitation.inviter.user.weiboId,{type:'status',body:req.body});
			}
			return invitation;
		},
		function generateResponse(err, invitation){
			if (err) throw err;
			res.send(invitation);
		});
} 

exports.replyComment=function(req, res){
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			if (err) throw err;
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id)},[],
				{$push:{'replyList':req.body}, $set:{'lastUpdateDate':new Date()}}, 
				{safe:true,new:true}, 
				this);
		},
		function sendMessage(err,invitation){
			if (err) throw err;
			invitation.invitees.forEach(function(invitee){
				if(invitee.user.weiboId!=req.body.user.weiboId){
					msg.addMessage(invitee.user.weiboId,{type:'reply',body:req.body});	
				}
			});
			if(invitation.inviter.user.weiboId!=req.body.user.weiboId){
				msg.addMessage(invitation.inviter.user.weiboId,{type:'reply',body:req.body});
			}
			return invitation;
		},
		function generateResponse(err, invitation){
			if (err) throw err;
			res.send(invitation);
		});	
}


function validateInvitation(invitation){
	check(invitation.inviter).isNull();
	check(invitation.invitees).isNull().isArray();
	check(invitation.replyList).isNull().isArray();
	check(invitation.description).isNull();
	check(invitation.createDate).isNull().isDate();
	check(invitation.startDate).isNull().isDate();
}

function validateReply(reply){
	check(reply.content).notEmpty();
	check(reply.user).notEmpty();
}

function validateStatus(status){
	check(status.weiboId).notEmpty();
	check(status.status).notEmpty();
}
