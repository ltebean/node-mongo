var http = require('http');

exports.send=function(options,callback){

	var timer=setTimeout(function() {
		req.emit('timeout',{message:'have been timeout...'});
	}, options.timeout||2000);

	var req=http.get(options, function(res) {
		var html='';
		res.on("data", function(chunk) {
			html+=chunk;
		});;
		res.on("end", function() {
			clearTimeout(timer);
			if(res.statusCode==200){
				callback(html);
			}else{
				callback('');
			}	
		});
		res.on('close',function(){
			clearTimeout(timer);
			console.log('response close');
		});
	});
	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	req.on('timeout',function(e){
		callback('');
		req.abort();
	});
};
