
const fs = require('fs');
const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config');
const app = express();
const request = require('sync-request')
const nlp = require('compromise')
const client = new line.Client(config);
const sheetsu = require('sheetsu-node');
const clientsheet = sheetsu({ address:'https://sheetsu.com/apis/v1.0bu/7e219e429147' })
const admin = require("firebase-admin");
const serviceAccount = require("./service/matchFirebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://match-699cf.firebaseio.com"
});

app.use('/image', express.static('image/ICS-Logo.png'))
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

function handleEvent(event) {
  switch (event.type) {
    case 'message':
      switch (event.message.type) {
        case 'text':
          return    Intent(event);
        case 'image':
          return  broadcast(event);
        case 'video':
          return  broadcast(event);
        case 'audio':
          return  broadcast(event);
        case 'location':
          return  broadcast(event);
        case 'sticker':
          return  broadcast(event);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      // var doc = nlp(event.postback.data)
      // var a =doc.terms().out('array')
      // var dataName = a[0];
      // var value = a[1];
      // var lineID =event.source.userId;
      // var db = admin.database();
      // var ref = db.ref(dataName+"/result/");
      // ref.orderByKey().equalTo(lineID).on("value", function (snapshot) {
      //   if(snapshot.val()==null){
      //      var usersRef = ref.child(lineID);
      //          usersRef.set({
      //             value: value,
      //             lineID:lineID
      //          });
      //   }else{
      //     var MessageReply = {
      //       "type": "text",
      //       "text": "You have already voted."
      //     }
      //     client.pushMessage(event.source.userId, MessageReply);
      //   }
      // }, function (errorObject) {
      //   console.log("The read failed: " + errorObject.code);
      // });
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return beacon(event,dm);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}


function Intent(event){
  // var userName = request("GET", "https://api.line.me/v2/bot/profile/"+event.source.userId, {
  //   headers: {
  //       "Authorization":"Bearer B+sgdP8ZDtJblIa3cW4CwVw1uG+wafCGbijMkMzWiO8/LP/UWA3bvbm9oTC4Nm/IDumT/FXNCo4tfwtxz/0UNKgCmcfjXuh1JqUPQEbeOJ03gnO2+Y8cGXx6FiDnAWQwHwv0GSr2XdRblTa5ZejpzQdB04t89/1O/w1cDnyilFU="
  //   },
  // });
  // var userData = JSON.parse(userName.getBody());
  // var displayName = userData.displayName
  // console.log(displayName)
  const msg = require('./message/messageText');
  const day = require('./message/holiday');
  var doc = nlp(event.message.text)
  var a =doc.terms().out('array')
  var userSay = a[0]; 
  if(userSay.includes("help>")){
      client.replyMessage(event.replyToken, msg.help);
  }else if(userSay.includes("register>")){
    client.replyMessage(event.replyToken, msg.register);
  }else if(userSay.includes("shortcut>")){
    client.pushMessage(event.source.userId, msg.shortcut);
  } else if(userSay.includes("holiday>")){
    client.pushMessage(event.source.userId, day.holiday);

  }
  else if(userSay.includes("today>")){
    for (let i = 0; i <day.holidayRespond.result.data.length; i++) {
      if(day.date === day.holidayRespond.result.data[i].Date){
          var message={
            type: 'text',
            text: "วันหยุด "+ day.holidayRespond.result.data[i].HolidayDescriptionThai+"("+ day.holidayRespond.result.data[i].HolidayDescription+")"
          };
          client.pushMessage(event.source.userId, message);
      }
      else{
        client.replyMessage(event.replyToken, day.today);
      }
    }
  }else if(userSay.includes("employee>")){
      Employee(event)
  }else if(userSay.includes("fn>")){
    const name =event.message.text.substr(3);
    Info(name,event)
  }else if(userSay.includes("nn>")){
    const name =event.message.text.substr(3);
    InfoNickname(name,event)    
  }  else if(userSay.includes("br>")){
       broadcast(event)
  }else if(userSay.includes("media>")){
      client.pushMessage(event.source.userId, msg.broadcast);
  }else if(userSay.includes("train>")){
    var message = a[1];
    var reply = a[2];
  }else if(userSay.includes("hpy")){
    console.log("HPY")
      var db = admin.database();
      var ref = db.ref("HPY");
      ref.orderByKey().equalTo(event.source.userId).on("value", function (snapshot) {
        if(snapshot.val()==null){
            console.log("null")
            var message={
              type: 'text',
              text: "Please register first."
            };
            client.replyMessage(event.replyToken, message);

        }else{
          var people =[]

          ref.orderByChild("match").equalTo(0).on("value", snapshot => {
            snapshot.forEach(childSnapshot => { 
              if(childSnapshot.key !=event.source.userId && childSnapshot.val().gift == 0 ){
                people.push(childSnapshot.key) 
              }});
              console.log(people)
            var matchc = people.splice(Math.floor(Math.random()*people.length), 1);
            var gift =matchc[0];
            ref.orderByKey().equalTo(gift).on("child_added", function (snapshot) {
                console.log(snapshot.val().Fullname)
             ref.child(event.source.userId).child("match").set(snapshot.val().Fullname)
             ref.child(gift).child("match").set(event.source.userId)

            });
          });
    
 
        }
      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
  }
  // else{
  //   clientsheet.read({ search: { Message: userSay} }).then(function(data) {
  //     var obj = JSON.parse(data)
  //     console.log(obj);
  //     if(obj[0].TypeMessage=='text'){
  //       var MessageReply = {
  //         "type": "text",
  //         "text": obj[0].MessageReply

  //       }
  //       client.pushMessage(event.source.userId, MessageReply);
  //     }else if(obj[0].TypeMessage=='flex'){
  //       var MessageReply =  JSON.parse(obj[0].MessageReply)
  //        client.pushMessage(event.source.userId, MessageReply);
  //     }else if(obj[0].TypeMessage=='vote'){
  //       var MessageReply =  JSON.parse(obj[0].MessageReply)
  //       client.pushMessage(event.source.userId, MessageReply);
  //     }

   
  //   }, function(err){
  //     var MessageReply = {
  //       "type": "text",
  //       "text":"กรุณาลองใหม่อีกครั้ง"

  //     }
  //     client.pushMessage(event.source.userId, MessageReply);
  //     console.log(err);
  //   });
  // }
}



function broadcast(event){
  if(event.message.type == 'image'){
    var messageID=event.message.id;
      var myWriteStream = fs.createWriteStream(__dirname+'/'+messageID+'.jpg','binary');
      client.getMessageContent(messageID).then((stream) => {
          stream.on('data', (chunk) => {
              myWriteStream.write(chunk)
          })
          stream.on('end', () => {
              app.use('/'+messageID, express.static(messageID+'.jpg'))
              var msg={
                  'type': 'image',
                  'originalContentUrl': hosturl+messageID,
                  'previewImageUrl': hosturl+messageID 
                }
                client.broadcast(msg);
              })
      })
  }else if(event.message.type == 'sticker'){
              var msg={
                  'type': 'sticker',
                  'stickerId':  event.message.stickerId,
                  'packageId': event.message.packageId 
              }
              client.broadcast(msg);
  }else if(event.message.type == 'location'){
              var msg={
                  'type': 'location',
                  'title':  event.message.type,
                  'address': event.message.address,
                  'latitude':event.message.latitude,
                  'longitude':  event.message.longitude
              }
              client.broadcast(msg);
  }else if(event.message.type =='text'){
    const brText = event.message.text.substr(3);
    var msg = {
      type: 'text',
      text:  brText
     };
    client.broadcast(msg);
  }
}


function Employee(event){
  const odata = require('./message/odata');
  for (let i = 0; i < odata.sapRespond.d.results.length; i++) {
    const message ={
      "type": "flex",
      "altText": "Flex Message",
      "contents": {
        "type": "bubble",
        "direction": "ltr",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "Employee",
              "align": "center"
            }
          ]
        },
        "hero": {
          "type": "image",
          "url": "https://ics-chat-bot.herokuapp.com/image",
          "size": "full",
          "aspectRatio": "1.51:1",
          "aspectMode": "fit"
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "message",
                "label":  odata.sapRespond.d.results[i].Firstname+" "+odata.sapRespond.d.results[i].Lastname+" "+"("+odata.sapRespond.d.results[i].Nickname+")"                  ,
                "text": "fn>"+odata.sapRespond.d.results[i].Firstname
              }
            }
          ]
        }
      }
   }
    client.pushMessage(event.source.userId,message)
  }
}

function Info(name,event){
  const odata = require('./message/odata');
  var nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)
  for (let i = 0; i < odata.sapRespond.d.results.length; i++) {
  if(odata.sapRespond.d.results[i].Firstname.includes(nameCapitalized)){
    var msg = {
          "type": "flex",
              "altText": "Flex Message",
              "contents": {
                "type": "bubble",
                "direction": "ltr",
                "header": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "SAP",
                      "align": "center"
                    }
                  ]
                },
                "hero": {
                  "type": "image",
                  "url": "https://ics-chat-bot.herokuapp.com/image",
                  "size": "5xl",
                  "aspectRatio": "1.91:1",
                  "aspectMode": "fit"
                },
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": odata.sapRespond.d.results[i].Firstname+"  "+odata.sapRespond.d.results[i].Lastname+"("+odata.sapRespond.d.results[i].Nickname+")",
                      "align": "center",
                      "weight": "bold",
                      "size": "lg"
                    },
                    {
                      "type": "separator",
                      "margin": "lg"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "spacer"
                        },
                        {
                          "type": "text",
                          "text": "Tel:"+" "+odata.sapRespond.d.results[i].Tel
                        },
                        {
                          "type": "text",
                          "text": "Email:"+" "+odata.sapRespond.d.results[i].Email
                        },
                        {
                          "type": "text",
                          "text": "Birthdate:"+" "+odata.sapRespond.d.results[i].Birthdate
                        },
                        {
                          "type": "text",
                          "text": "Position:"+" "+odata.sapRespond.d.results[i].Position
                        },
                        {
                          "type": "text",
                          "text": "Line:"+" "+odata.sapRespond.d.results[i].Line
                        }
                      ]
                    },
                  ]
                }
              }
      };
      client.pushMessage(event.source.userId, msg);
  }
  }
}

function InfoNickname(name,event){
  const odata = require('./message/odata');
  var nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)
  console.log(nameCapitalized)

  for (let i = 0; i < odata.sapRespond.d.results.length; i++) {
  if(odata.sapRespond.d.results[i].Nickname.includes(nameCapitalized)){
    var msg = {
          "type": "flex",
              "altText": "Flex Message",
              "contents": {
                "type": "bubble",
                "direction": "ltr",
                "header": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": "SAP",
                      "align": "center"
                    }
                  ]
                },
                "hero": {
                  "type": "image",
                  "url": "https://ics-chat-bot.herokuapp.com/image",
                  "size": "5xl",
                  "aspectRatio": "1.91:1",
                  "aspectMode": "fit"
                },
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "contents": [
                    {
                      "type": "text",
                      "text": odata.sapRespond.d.results[i].Firstname+"  "+odata.sapRespond.d.results[i].Lastname+"("+odata.sapRespond.d.results[i].Nickname+")",
                      "align": "center",
                      "weight": "bold",
                      "size": "lg"
                    },
                    {
                      "type": "separator",
                      "margin": "lg"
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "spacer"
                        },
                        {
                          "type": "text",
                          "text": "Tel:"+" "+odata.sapRespond.d.results[i].Tel
                        },
                        {
                          "type": "text",
                          "text": "Email:"+" "+odata.sapRespond.d.results[i].Email
                        },
                        {
                          "type": "text",
                          "text": "Birthdate:"+" "+odata.sapRespond.d.results[i].Birthdate
                        },
                        {
                          "type": "text",
                          "text": "Position:"+" "+odata.sapRespond.d.results[i].Position
                        },
                        {
                          "type": "text",
                          "text": "Line:"+" "+odata.sapRespond.d.results[i].Line
                        }
                      ]
                    },
                  ]
                }
              }
      };
      client.pushMessage(event.source.userId, msg);
  }
  }
}



function beacon(event,dm){
  var msg={
    type: 'text',
    text:  event.beacon.type+"beacon hwid "+event.beacon.hwid+"with device message = "+dm
  };
  client.pushMessage(event.source.userId, msg);
  console.log(event)
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});