
var listener={};

var msgToRead={};

exports.addListener=function (weiboId,callback) {
	listener.weiboId=callback;
	if(msgToRead.weiboId){
		callback(msgToRead.weiboId);
		delete msgToRead.weiboId;
	}
};

exports.addMessage=function(weiboId,msg) {
	if(listener.weiboId){
		//console.log('send to'+weiboId);
		listener.weiboId([msg]);
	}else{
		if(!msgToRead.weiboId){
			msgToRead.weiboId=[];
		}
		msgToRead.weiboId.push(msg);
	}
};

exports.removeListener=function(weiboId){
	if(listener.weiboId){
		delete listener.weiboId;
	}
};


