
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
}

function Intent(event){
  const msg = require('./messageText');
  const day = require('./holiday');
  var doc = nlp(event.message.text)
  var a =doc.terms().out('array')
  var userSay = a[0];
   if(userSay.includes("help")){
      client.replyMessage(event.replyToken, msg.help);
  }else if(userSay.includes("command")){
    client.replyMessage(event.replyToken, msg.command);
  }else if(userSay.includes("register")){
    client.replyMessage(event.replyToken, msg.register);
  }else if(userSay.includes("shortcut")){
    client.pushMessage(event.source.userId, msg.shortcut);
  }else if(userSay.includes("today")){
    for (let i = 0; i <day.holidayRespond.result.data.length; i++) {
      if(day.date === day.holidayRespond.result.data[i].Date){
          var message={
            type: 'text',
            text: "วันหยุด "+ day.holidayRespond.result.data[i].HolidayDescriptionThai+"("+ day.holidayRespond.result.data[i].HolidayDescription+")"
          };
          client.pushMessage(event.source.userId, message);
      }
      else{
        client.pushMessage(event.source.userId, day.today);
      }
    }
  }
  
  
}
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});