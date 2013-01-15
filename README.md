Introduction
------------

This project provides a restful api of the invitation service

API
---

### create an invitation

post - /resource/invitation

body - the fully fledged invitaion object that must contain all fields it might need later

### load an invitation

get - /resource/invitation/:id

### load open invitations

get - /resource/invitation/open/weiboId/:weiboId/page/:page

### load closed invitations

get - /resource/invitation/closed/weiboId/:weiboId/page/:page

### change status

post - /resource/invitation/:id/status

body- {weiboId:"",status:""};

### reply

post - /resource/invitation/:id/reply

body - {content:"",date:new Date(),user:{weiboId:"",weiboName:""...}}

### The structure of the invitation object is like this:

	{
      "_id": "50b3237a0cf235d0ba9143a8",
      "inviter": {
        "user": {
          "weiboId": "1794581765",
          "weiboName": "福禄钱恩",
          "weiboIcon": "http://tp2.sinaimg.cn/1794581765/180/40008135152/0",
          "weiboIconSmall": "http://tp2.sinaimg.cn/1794581765/50/40008135152/0"
        }
      },
      "invitees": [
        {
          "user": {
            "weiboId": "2134062323",
            "weiboName": "ltebean",
            "weiboIcon": "http://tp4.sinaimg.cn/2134062323/180/5644408802/1",
            "weiboIconSmall": "http://tp4.sinaimg.cn/2134062323/50/5644408802/1"
          },
          "status": "unknown"
        }
      ],
      "replyList": [
        {
          "content": "nice",
          "user": {
            "weiboId": "1794581765",
            "weiboName": "福禄钱恩",
            "weiboIcon": "http://tp2.sinaimg.cn/1794581765/180/40008135152/0",
            "weiboIconSmall": "http://tp2.sinaimg.cn/1794581765/50/40008135152/0"
          },
          "date": "2012-11-26T08:10:57.749Z"
        }
      ],
      "creatDate": "2012-11-26T08:08:26.211Z",
      "startDate": "2012-11-21T16:00:00.000Z",
      "lastUpdateDate": "2012-11-26T08:10:57.749Z",
      "description": "在阿猫一条鱼吃饭chifan",
      "shopList": [
        {
          "shopId": 2725198,
          "shopName": "阿猫一条鱼",
          "address": "杨浦区国顺路587号(近政肃路)",
          "phoneNo": "13127530310",
          "latitude": 31.29442,
          "longtitude": 121.50675,
          "picUrlList": [
            "http://i3.dpfile.com/2010-11-08/5764433_m.jpg"
          ]
        },
        {
          "shopId": 2725198,
          "shopName": "阿猫一条鱼",
          "address": "杨浦区国顺路587号(近政肃路)",
          "phoneNo": "13127530310",
          "latitude": 31.29442,
          "longtitude": 121.50675,
          "picUrlList": [
            "http://i3.dpfile.com/2010-11-08/5764433_m.jpg"
          ]
        }
      ]
    }

### receive message through websocket

    <script src="/socket.io/socket.io.js"></script>
    <script>
        var socket = io.connect('http://192.168.32.84:3000');
        // first register with weiboId
        socket.emit('register',weiboId);
        // then listent on this topic
        socket.on('news', function (data) {;
            // data is an array,the element is like this:
            // {type:'status|reply',body:{the corresponding body}};
        });
    </script>
