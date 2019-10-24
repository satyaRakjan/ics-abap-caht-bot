
const fs = require('fs');
const line = require('@line/bot-sdk');
const express = require('express');
const config = require('./config');
const app = express();
const request = require('sync-request')
const nlp = require('compromise')
const client = new line.Client(config);

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
          return  brcontent(event);
        case 'video':
          return  brcontent(event);
        case 'audio':
          return  brcontent(event);
        case 'location':
          return  brcontent(event);
        case 'sticker':
          return  brcontent(event);
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
      let data = event.postback.data;
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return beacon(event,dm);
    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
  //   var messageID=event.message.id; 
  //   console.log(event.message.type)
  // if (event.type !== 'message' || event.message.type !== 'text') {
  //       if(event.message.type == 'image'){
  //           var myWriteStream = fs.createWriteStream(__dirname+'/'+messageID+'.jpg','binary');
  //           client.getMessageContent(messageID).then((stream) => {
  //               stream.on('data', (chunk) => {
  //                   myWriteStream.write(chunk)
  //               })
  //               stream.on('end', () => {
  //                   app.use('/'+messageID, express.static(messageID+'.jpg'))
  //                   var hosturl="https://ics-chat-bot.herokuapp.com/";
  //                   msg={
  //                       'type': 'image',
  //                       'originalContentUrl': hosturl+messageID,
  //                       'previewImageUrl': hosturl+messageID 
  //                     }
  //                     broadCast(msg)
  //                   })
  //           })
  //       }else if(event.message.type == 'sticker'){
  //                   msg={
  //                       'type': 'sticker',
  //                       'stickerId':  event.message.stickerId,
  //                       'packageId': event.message.packageId 
  //                   }
  //                   broadCast(msg)
  //       }

  // }else{
  //     Intent(event)
  //     client.getProfile(event.source.userId).then((profile) => {
  //       console.log(profile);
  //     });
  // }
}

function Intent(event){
  const msg = require('./messageText');
  var doc = nlp(event.message.text)
  var a =doc.terms().out('array')
  var userSay = a[0];
   if(userSay.includes("help")){
      client.replyMessage(event.replyToken, msg.help);
  }else if(userSay.includes("command")){
    client.replyMessage(event.replyToken, msg.command);
  }else if(userSay.includes("register")){
    client.replyMessage(event.replyToken, msg.register);
  }
  
  
    // var userSay = event.message.text.toLowerCase();
    // var user = "JIRASIT.GO";
    // var password = "ICS@100";
    // const odata = request("GET", "http://vmfioriics.ics-th.com:8000/sap/opu/odata/sap/ZPROFILE_SRV/GetEmployeeListSet?$format=json", {
    //   headers: {
    //       "Authorization": "Basic " + new Buffer(user + ":" + password).toString('base64')
    //   },
    // });
    // var sapRespond = JSON.parse(odata.getBody());
    // if(userSay.includes("help")){
    //     console.log("Help") 
    // }else if(userSay.includes("fn>")){
    //     const name =event.message.text.substr(3);
    //     Info(sapRespond,name,event)
    // }else if(userSay.includes("nn>")){
    //     const name =event.message.text.substr(3);
    //     Info(sapRespond,name,event)    
    // }else if(userSay.includes("l>employee")){
    //   Employee(sapRespond,event)    
    // }else if(userSay.includes("br>")){
    //     const brText = event.message.text.substr(3);
    //     var msg = {
    //         type: 'text',
    //         text:  brText
    //     };
    //        client.broadcast(msg);
    // }
}

function Employee(sapRespond,event){
  for (let i = 0; i < sapRespond.d.results.length; i++) {
    client.pushMessage(event.source.userId, {
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
                  "label":  sapRespond.d.results[i].Firstname+" "+sapRespond.d.results[i].Lastname+" "+"("+sapRespond.d.results[i].Nickname+")"                  ,
                  "text": "fn>"+sapRespond.d.results[i].Firstname
                }
              }
            ]
          }
        }
     })
   }
}

function Info(sapRespond,name,event){
    var nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)
    for (let i = 0; i < sapRespond.d.results.length; i++) {
    if(sapRespond.d.results[i].Firstname == nameCapitalized || sapRespond.d.results[i].Nickname == nameCapitalized){
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
                        "text": sapRespond.d.results[i].Firstname+"  "+sapRespond.d.results[i].Lastname+"("+sapRespond.d.results[i].Nickname+")",
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
                            "text": "Tel:"+" "+sapRespond.d.results[i].Tel
                          },
                          {
                            "type": "text",
                            "text": "Email:"+" "+sapRespond.d.results[i].Email
                          },
                          {
                            "type": "text",
                            "text": "Birthdate:"+" "+sapRespond.d.results[i].Birthdate
                          },
                          {
                            "type": "text",
                            "text": "Position:"+" "+sapRespond.d.results[i].Position
                          },
                          {
                            "type": "text",
                            "text": "Line:"+" "+sapRespond.d.results[i].Line
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
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});