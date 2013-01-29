
var http = require('http');
var request=require('./request.js');


exports.findCities = function(req,res){
	var fs = require('fs');
	fs.readFile('cities.json','utf-8',function(err,data){
		if (err) throw err;
		var cities = JSON.parse(data);
		res.send(cities);
	})
}

exports.findShop = function(req,res){
	// console.log("get in "+req.params.id);
	fetchShop(req.params.id,function(shop){
		res.send(shop);
	})
}

exports.searchShop=function(req,res){
	searchDPShops(req.query,function(data){
		res.send(data);
	});
}

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

var fetchShop=function(shopId,callback){
	var path = '/shop/'+shopId;
	options = {
		host: 'www.dianping.com',
		path: path,
		port: 80,
		headers :{
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.52 Safari/537.17 Query String Parametersview sourceview URL encoded'
		}
	}
	request.send(options,function(body){
		var shop=getShopInfo(body);
		shop.shopId=shopId;
		callback(shop);
	})
}

var searchDPShops=function(params,callback){
	options = {
		host: 'api.dianping.com',
		path: getUrl(params),
		port: 80,
		headers :{
			'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.52 Safari/537.17 Query String Parametersview sourceview URL encoded'
		}
	}
	request.send(options,function(body){
		//console.log(body);
		callback(body);
	})

}

function getUrl(param)
{
	 var apiPath = "/v1/business/find_businesses";
	 var appkey = "99363573";
	 var secret = "ed0bd10ced81469e8ec54e27f951e5bd";

	 var array = new Array();
	 for(var key in param)
	 {
		 array.push(key);
	 }
	 array.sort();

	 var paramArray = new Array();
	 paramArray.push(appkey);
	 for(var index in array)
	 {
		 var key = array[index];
		 paramArray.push(key + param[key]);
	 }
	 paramArray.push(secret);

	 var shaSource = paramArray.join("");
	 var sign = new String(CryptoJS.SHA1(shaSource)).toUpperCase();

	 var queryArray = new Array();
	 queryArray.push("appkey=" + appkey);
	 queryArray.push("sign=" + sign);
	 for(var key in param)
	 {
		 queryArray.push(key + "=" + param[key]);
	 }
	 var queryString = queryArray.join("&");

	 var url = apiPath + "?" + queryString;
	 return url;
}

var CryptoJS=CryptoJS||function(i,m){var p={},h=p.lib={},n=h.Base=function(){function a(){}return{extend:function(b){a.prototype=this;var c=new a;b&&c.mixIn(b);c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.$super.extend(this)}}}(),o=h.WordArray=n.extend({init:function(a,b){a=
this.words=a||[];this.sigBytes=b!=m?b:4*a.length},toString:function(a){return(a||e).stringify(this)},concat:function(a){var b=this.words,c=a.words,d=this.sigBytes,a=a.sigBytes;this.clamp();if(d%4)for(var f=0;f<a;f++)b[d+f>>>2]|=(c[f>>>2]>>>24-8*(f%4)&255)<<24-8*((d+f)%4);else if(65535<c.length)for(f=0;f<a;f+=4)b[d+f>>>2]=c[f>>>2];else b.push.apply(b,c);this.sigBytes+=a;return this},clamp:function(){var a=this.words,b=this.sigBytes;a[b>>>2]&=4294967295<<32-8*(b%4);a.length=i.ceil(b/4)},clone:function(){var a=
n.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var b=[],c=0;c<a;c+=4)b.push(4294967296*i.random()|0);return o.create(b,a)}}),q=p.enc={},e=q.Hex={stringify:function(a){for(var b=a.words,a=a.sigBytes,c=[],d=0;d<a;d++){var f=b[d>>>2]>>>24-8*(d%4)&255;c.push((f>>>4).toString(16));c.push((f&15).toString(16))}return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d+=2)c[d>>>3]|=parseInt(a.substr(d,2),16)<<24-4*(d%8);return o.create(c,b/2)}},g=q.Latin1={stringify:function(a){for(var b=
a.words,a=a.sigBytes,c=[],d=0;d<a;d++)c.push(String.fromCharCode(b[d>>>2]>>>24-8*(d%4)&255));return c.join("")},parse:function(a){for(var b=a.length,c=[],d=0;d<b;d++)c[d>>>2]|=(a.charCodeAt(d)&255)<<24-8*(d%4);return o.create(c,b)}},j=q.Utf8={stringify:function(a){try{return decodeURIComponent(escape(g.stringify(a)))}catch(b){throw Error("Malformed UTF-8 data");}},parse:function(a){return g.parse(unescape(encodeURIComponent(a)))}},k=h.BufferedBlockAlgorithm=n.extend({reset:function(){this._data=o.create();
this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var b=this._data,c=b.words,d=b.sigBytes,f=this.blockSize,e=d/(4*f),e=a?i.ceil(e):i.max((e|0)-this._minBufferSize,0),a=e*f,d=i.min(4*a,d);if(a){for(var g=0;g<a;g+=f)this._doProcessBlock(c,g);g=c.splice(0,a);b.sigBytes-=d}return o.create(g,d)},clone:function(){var a=n.clone.call(this);a._data=this._data.clone();return a},_minBufferSize:0});h.Hasher=k.extend({init:function(){this.reset()},
reset:function(){k.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);this._doFinalize();return this._hash},clone:function(){var a=k.clone.call(this);a._hash=this._hash.clone();return a},blockSize:16,_createHelper:function(a){return function(b,c){return a.create(c).finalize(b)}},_createHmacHelper:function(a){return function(b,c){return l.HMAC.create(a,c).finalize(b)}}});var l=p.algo={};return p}(Math);
(function(){var i=CryptoJS,m=i.lib,p=m.WordArray,m=m.Hasher,h=[],n=i.algo.SHA1=m.extend({_doReset:function(){this._hash=p.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(o,i){for(var e=this._hash.words,g=e[0],j=e[1],k=e[2],l=e[3],a=e[4],b=0;80>b;b++){if(16>b)h[b]=o[i+b]|0;else{var c=h[b-3]^h[b-8]^h[b-14]^h[b-16];h[b]=c<<1|c>>>31}c=(g<<5|g>>>27)+a+h[b];c=20>b?c+((j&k|~j&l)+1518500249):40>b?c+((j^k^l)+1859775393):60>b?c+((j&k|j&l|k&l)-1894007588):c+((j^k^l)-
899497514);a=l;l=k;k=j<<30|j>>>2;j=g;g=c}e[0]=e[0]+g|0;e[1]=e[1]+j|0;e[2]=e[2]+k|0;e[3]=e[3]+l|0;e[4]=e[4]+a|0},_doFinalize:function(){var i=this._data,h=i.words,e=8*this._nDataBytes,g=8*i.sigBytes;h[g>>>5]|=128<<24-g%32;h[(g+64>>>9<<4)+15]=e;i.sigBytes=4*h.length;this._process()}});i.SHA1=m._createHelper(n);i.HmacSHA1=m._createHmacHelper(n)})();

