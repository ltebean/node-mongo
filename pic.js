var Step = require('step');
var fs =  require('fs');
var UPYun = require('./lib/upyun').UPYun;
var picUtils= require('./lib/picUtils.js');

var upyun = new UPYun("lets-party-pic", "ltebean ", "yucong861186");

exports.uploadPic=function(req, res){
	var picPath=picUtils.generatePicPath();
	Step(
		function readPic(){
			fs.readFile(req.files.pic.path,this);
		},
		function postToUPYun(err,fileContent){
			if (err) throw err;
			var md5Str = md5(fileContent);
			upyun.setContentMD5(md5Str);
			upyun.setFileSecret('bac');
			upyun.writeFile(picUtils.generatePicPath(), fileContent, true,this);
		},
		function generateResponse(err, data){
			if (err) throw err;
			res.send({'picUrl':picUtils.getDomian()+picPath});
		});	
}

function md5(string) {
    var crypto = require('crypto');
    var md5sum = crypto.createHash('md5');
    md5sum.update(string, 'utf8');
    return md5sum.digest('hex');
}
