
var Step = require('step');
var mongo = require('mongodb');
var check = require('validator').check;
var msg=require('./msg.js');
var crawler=require('./crawler.js');
var db = require('./db.js').sharedDB;
var notification=require('./notification.js');
var BSON = mongo.BSONPure;
var Timestamp =mongo.Timestamp;


exports.welcome=function(req, res){ 
	//validateInvitation(req.body);
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function insertData(err,collection){
			if (err) throw err;
			var invitation={
				inviter:{
					user:{
						weiboId:'123',
						weiboName:'',
						weiboIcon: 'http://tp4.sinaimg.cn/2134062323/180/5644408802/1',
        				weiboIconSmall: 'http://tp4.sinaimg.cn/2134062323/50/5644408802/1'
					}
				},
				shopList:[{
					shopName:'',
					picUrlList:['']
				}],
				startDate:new Date(),
				invitees:[{
					user:req.body,
					status:'accept'
				}],
				replyList: [{
     				content: 'nice',
     				user: {
        				weiboId: '1794581765',
       					weiboName: '福禄钱恩',
        				weiboIcon: 'http://tp2.sinaimg.cn/1794581765/180/40008135152/0',
        				weiboIconSmall: 'http://tp2.sinaimg.cn/1794581765/50/40008135152/0'
      				},
      				date: new Date()
    			}],
			};
			collection.insert(invitation, {safe:true}, this)
		},
		function generateResponse(err, invitation){
			if (err) throw err;
			res.send(invitation);		
		});	
} 
exports.create=function(req, res){ 
	//validateInvitation(req.body);
	Step(
		function fetchPoi(){
			crawler.fetchShop(req.body.shopList[0].shopId,this);
		},
		function mergeResult(shopInfo){
			if(shopInfo){
				req.body.shopList[0].latitude=shopInfo.latitude;
				req.body.shopList[0].longtitude=shopInfo.longtitude;
				req.body.shopList[0].picUrlList=shopInfo.picUrlList;
			}
			return 'ok';
		},
		function getCollection(err,status){
			db.collection('invitation', this); 
		},
		function insertData(err,collection){
			if (err) throw err;
			req.body.startDate=new Date(req.body.startDate);
			req.body.createDate=new Date();
			collection.insert(req.body, {safe:true}, this)
		},
		function sendMessage(err,result){
			if (err) throw err;
			// result[0].invitees.forEach(function(invitee){
			// 	msg.addMessage(invitee.user.weiboId,{type:'new',body:result[0]});	
			// });
			// msg.addMessage(result[0].inviter.user.weiboId,{type:'new',body:result[0]});
			return result[0];
		},
		function sendNotification(err,invitation){
			if (err) throw err;
			invitation.invitees.forEach(function(invitee){
				var msg=invitation.inviter.user.weiboName+'发起了一个活动('+invitation.shopList[0].shopName+')';
				notification.send(invitee.user.weiboId,msg,{});	
			 });
			return invitation;
		},
		function generateResponse(err, invitation){
			if (err) throw err;
			res.send(invitation);		
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
			var date=new Date();
			date.setHours(date.getHours()-2);
			collection.find({
				'startDate':{$gte: date}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees':{$elemMatch:{"user.weiboId":req.params.weiboId}}}]
			}).sort({_id:-1}).skip(req.params.page*8).limit(8).toArray(this);
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
			var date=new Date();
			date.setHours(date.getHours()-2);
			collection.find({
				'startDate':{$lt: date}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees':{$elemMatch:{"user.weiboId":req.params.weiboId}}}]
			}).sort({_id:-1}).skip(req.params.page*8).limit(8).toArray(this);
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
			// invitation.invitees.forEach(function(invitee){
			// 	msg.addMessage(invitee.user.weiboId,{type:'status',body:req.body});	
			// });
			// msg.addMessage(invitation.inviter.user.weiboId,{type:'status',body:req.body});
			return invitation;
		},
		function sendNotification(err,invitation){
			if (err) throw err;
			var msg=req.body.user.weiboName+'发表了回复';
			if(invitation.inviter.user.weiboId!=req.body.user.weiboId){
				notification.send(invitation.inviter.user.weiboId,msg,{});	
			}
			invitation.invitees.forEach(function(invitee){
				if(invitee.user.weiboId!=req.body.user.weiboId){
					notification.send(invitee.user.weiboId,msg,{});	
				}
			 });
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
			// invitation.invitees.forEach(function(invitee){
			// 	msg.addMessage(invitee.user.weiboId,{type:'reply',body:req.body});	
			// });
			// msg.addMessage(invitation.inviter.user.weiboId,{type:'reply',body:req.body});
			return invitation;
		},
		function sendNotification(err,invitation){
			if (err) throw err;
			var msg=req.body.user.weiboName+'发表了回复:'+req.body.content;
			if(invitation.inviter.user.weiboId!=req.body.user.weiboId){
				notification.send(invitation.inviter.user.weiboId,msg,{});	
			}
			invitation.invitees.forEach(function(invitee){
				if(invitee.user.weiboId!=req.body.user.weiboId){
					notification.send(invitee.user.weiboId,msg,{});	
				}
			 });
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



