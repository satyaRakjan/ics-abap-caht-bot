const fs = require('fs');
const line = require('@line/bot-sdk');
const express = require('express');
const config = {
    channelAccessToken: 'B+sgdP8ZDtJblIa3cW4CwVw1uG+wafCGbijMkMzWiO8/LP/UWA3bvbm9oTC4Nm/IDumT/FXNCo4tfwtxz/0UNKgCmcfjXuh1JqUPQEbeOJ03gnO2+Y8cGXx6FiDnAWQwHwv0GSr2XdRblTa5ZejpzQdB04t89/1O/w1cDnyilFU=',
    channelSecret: 'ddf2d50e4e38a1827824c1d2bbd9afcc'
};
const client = new line.Client(config);
const app = express();
const request = require('sync-request')
app.use('/image', express.static('image/ICS-Logo.png'))
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

function handleEvent(event) {
    var messageID=event.message.id; 
  if (event.type !== 'message' || event.message.type !== 'text') {
        if(event.message.type == 'image'){
            var myWriteStream = fs.createWriteStream(__dirname+'/'+messageID+'.jpg','binary');
            client.getMessageContent(messageID).then((stream) => {
                stream.on('data', (chunk) => {
                    myWriteStream.write(chunk)
                })
                stream.on('end', () => {
                    app.use('/'+messageID, express.static(messageID+'.jpg'))
                    var hosturl="https://ics-chat-bot.herokuapp.com/";
                    msg={
                        'type': 'image',
                        'originalContentUrl': hosturl+messageID,
                        'previewImageUrl': hosturl+messageID 
                      }
                      broadCast(msg)
                    })
            })
        }else if(event.message.type == 'sticker'){
                    msg={
                        'type': 'sticker',
                        'stickerId':  event.message.stickerId,
                        'packageId': event.message.packageId 
                    }
                    broadCast(msg)
        }

  }else{
      Intent(event)
      client.getProfile(event.source.userId).then((profile) => {
        console.log(profile);
      });
  }
}

function Intent(event){
    var userSay = event.message.text.toLowerCase();
    var user = "JIRASIT.GO";
    var password = "ICS@100";
    const odata = request("GET", "http://vmfioriics.ics-th.com:8000/sap/opu/odata/sap/ZPROFILE_SRV/GetEmployeeListSet?$format=json", {
      headers: {
          "Authorization": "Basic " + new Buffer(user + ":" + password).toString('base64')
      },
    });
    var sapRespond = JSON.parse(odata.getBody());
    if(userSay.includes("help")){
        console.log("Help") 
    }else if(userSay.includes("fn>")){
        const name =event.message.text.substr(3);
        Info(sapRespond,name,event)
    }else if(userSay.includes("nn>")){
        const name =event.message.text.substr(3);
        Info(sapRespond,name,event)    
    }else if(userSay.includes("l>employee")){
      Employee(sapRespond,event)    
    }else if(userSay.includes("br>")){
        const brText = event.message.text.substr(3);
        var msg = {
            type: 'text',
            text:  brText
        };
           client.broadcast(msg);
    }
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