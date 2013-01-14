
var listener={};

exports.addListener=function (weiboId,callback) {
	listener.weiboId=callback;
};

exports.addMessage=function(weiboId,msg) {
	if(listener.weiboId){
		listener.weiboId(msg);
	}
};

exports.removeListener=function(weiboId){
	if(listener.weiboId){
		delete listener.weiboId;
	}
};


