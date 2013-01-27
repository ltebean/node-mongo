
var http = require('http');


var findpoi=function (a){
	var b=-1,
		settings={digi:16,add:10,plus:7,cha:36,center:{lat:34.957995,lng:107.050781,isDef:!0}},
		c=0,
		d="",
		e=a.length,
		f=a.charCodeAt(e-1),
		a=a.substring(0,e-1);
		e--;
		for(var j=0;j<e;j++){
			var g=parseInt(a.charAt(j),settings.cha)-settings.add;g>=settings.add&&(g-=settings.plus);
			d+=g.toString(settings.cha);g>c&&(b=j,c=g)
		}
		a=parseInt(d.substring(0,b),settings.digi);
		b=parseInt(d.substring(b+1),settings.digi);
		f=(a+b-parseInt(f))/2;b=(b-f)/1E5;return{lat:b,lng:f/1E5}
	}

var getShopInfo = function(str){
	shop = {}
	shop.shopId=new RegExp('shopID:(.+),').exec(str)[1].trim();
	var results = new RegExp('poi: \'(.+)\'').exec(str);
	var poi=findpoi(results[1]);
	shop.latitude = poi.lat;
	shop.longtitude = poi.lng;
	shop.shopName=unescape(new RegExp("shopName:(.+),").exec(str)[1].trim().replace(/\\/g, "%"));
	shop.shopPower=new RegExp('shopPower:(.+),').exec(str)[1].trim();
	shop.address = new RegExp('<span itemprop="street-address">(.+)</span>').exec(str)[1].trim();
	shop.phoneNo = new RegExp('<strong itemprop="tel">(.+)</strong>').exec(str)[1].trim();
	shop.picUrlList = new RegExp('src="(.+)_m.jpg"').exec(str)[1].trim()+"_m.jpg";
	return shop;

}

exports.findcities = function(req,res){
	var fs = require('fs');
	fs.readFile('cities.json','utf-8',function(err,data){
		if (err) throw err;
		var cities = JSON.parse(data);
		res.send(cities);
	})
}

exports.findshop = function(req,res){
	// console.log("get in "+req.params.id);
	var path = '/shop/'+req.params.id;
	options = {
		host: 'www.dianping.com',
		path: path,
		port: 80,
		headers :{
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.52 Safari/537.17 Query String Parametersview sourceview URL encoded'
		}
	}
	http.get(options,function(response){

		var str = ''
		 response.on('data', function (chunk) {
		    str += chunk;
		 });

		 response.on('end', function () {
		 	shop = getShopInfo(str);
			res.send(shop);
		 });
	})
}