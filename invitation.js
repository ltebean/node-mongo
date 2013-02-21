var Step = require('step');
var fs =  require('fs');
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
			var date=new Date();
			date.setHours(date.getHours()+12);
			date.setMinutes(date.getMinutes()-15);
			var invitation={
				inviter:{
					user:{
						weiboId:'3118093851',
						weiboName:"Let's Party",
						weiboIcon: 'http://tp4.sinaimg.cn/3118093851/180/40015481944/1',
						weiboIconSmall: 'http://tp4.sinaimg.cn/3118093851/180/40015481944/1'
					}
				},
				shopList:[{
					shopId:'0',
					shopName:"欢迎加入Let's Party~",
					address:"Let's Party官方微博",
					latitude:"31.23136",
					longtitude:"121.47004",
					picUrlList:['http://ww1.sinaimg.cn/mw690/b9da561bgw1e1yg1rsnxuj.jpg']
				}],
				startDate:date,
				invitees:[{
					user:req.body,
					status:'accept'
				}],
				replyList: [{
					content: "欢迎加入Let's Party~",
					user: {
						weiboId: '3118093851',
						weiboName: "Let's Party",
						weiboIcon: 'http://tp4.sinaimg.cn/3118093851/180/40015481944/1',
						weiboIconSmall: 'http://tp4.sinaimg.cn/3118093851/180/40015481944/1'
					},
					date:date
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
				//req.body.shopList[0].picUrlList=shopInfo.picUrlList;
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
			var weiboIds=getNotificationList(invitation,invitation.inviter.user.weiboId);	
			var msg=invitation.inviter.user.weiboName+'发起了一个活动('+invitation.shopList[0].shopName+')';
			notification.send(weiboIds,msg,{});	
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

exports.findAll=function(req, res){ 
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function findResult(err,collection){
			if (err) throw err;
			collection.find({
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees':{$elemMatch:{"user.weiboId":req.params.weiboId}}}]
			}).sort({startDate:1}).skip(req.params.page*8).limit(8).toArray(this);
		},
		function generateResponse(err, item){
			if (err) throw err;
			res.send(item);
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
			date.setHours(date.getHours()+10);
			collection.find({
				'startDate':{$gte: date}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees':{$elemMatch:{"user.weiboId":req.params.weiboId}}}]
			}).sort({startDate:1}).skip(req.params.page*8).limit(8).toArray(this);
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
			date.setHours(date.getHours()+10);
			collection.find({
				'startDate':{$lt: date}, 
				$or :[{'inviter.user.weiboId':req.params.weiboId},{'invitees':{$elemMatch:{"user.weiboId":req.params.weiboId}}}]
			}).sort({startDate:-1}).skip(req.params.page*8).limit(8).toArray(this);
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
				{'_id':new BSON.ObjectID(req.params.id),'invitees.user.weiboId':req.body.user.weiboId},[],
				{$set:{'invitees.$.status':req.body.status}},
				{safe:true,new:true},
				this);
		},
		function sendNotification(err,invitation){
			if (err) throw err;
			var msg='';
			if(req.body.status==='accept'){
				msg=req.body.user.weiboName+'参加了活动('+invitation.shopList[0].shopName+')';
			}else{
				msg=req.body.user.weiboName+'拒绝了活动('+invitation.shopList[0].shopName+')';
			}
			var weiboIds=getNotificationList(invitation,req.body.user.weiboId);	
			notification.send(weiboIds,msg,{});	
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
				{$push:{'replyList':req.body}}, 
				{safe:true,new:true}, 
				this);
		},function sendNotification(err,invitation){
			if (err) throw err;
			var msg=req.body.user.weiboName+'发表了回复:'+req.body.content;
			var weiboIds=getNotificationList(invitation,req.body.user.weiboId);	
			notification.send(weiboIds,msg,{});	
			return invitation;
		},
		function generateResponse(err, invitation){
			if (err) throw err;
			res.send(invitation);
		});	
}

exports.updateInfo=function(req, res){
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			if (err) throw err;
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id)},[],
				{ 
					$set:{
						'invitees':req.body.invitees,
						'startDate':new Date(req.body.startDate)
					}
				}, 
				{safe:true,new:true}, 
				this);
		},function sendNotification(err,invitation){
			if (err) throw err;
			var msg=req.body.inviter.user.weiboName+'更新了邀请('+req.body.shopList[0].shopName+')';
			var weiboIds=getNotificationList(invitation,req.body.invitation.user.weiboId);	
			notification.send(weiboIds,msg,{});	
			return invitation;
		},
		function generateResponse(err, invitation){
			if (err) throw err;
			res.send(invitation);
		});	
}

exports.addPic=function(req, res){
	Step(
		function getCollection(){
			db.collection('invitation', this); 
		},
		function updateData(err,collection){
			if (err) throw err;
			collection.findAndModify(
				{'_id':new BSON.ObjectID(req.params.id)},[],
				{$push:{'picWall':req.body}}, 
				{safe:true,new:true}, 
				this);
		},
		function sendNotification(err,invitation){
			if (err) throw err;
			// var msg=req.body.user.weiboName+'添加了一张图片';
			// var weiboIds=getNotificationList(invitation,req.body.user.weiboId);	
			// notification.send(weiboIds,msg,{});	
			return invitation;
		},
		function generateResponse(err, invitation){
			if (err) throw err;
			res.send(invitation);
		});	
}

function getNotificationList(invitation,senderId){
	var weiboIds=[];
	if(invitation.inviter.user.weiboId!=senderId){
			weiboIds.push(invitation.inviter.user.weiboId);
	}
	for (var i = 0; i < invitation.invitees.length; i++) {
		if(invitation.invitees[i].user.weiboId!=senderId){
			weiboIds.push(invitation.invitees[i].user.weiboId);
		}
	}
	return weiboIds
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
	check(status.user).notEmpty();
	check(status.status).notEmpty();
}



