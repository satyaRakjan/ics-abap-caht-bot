const request = require('sync-request')
var user = "JIRASIT.GO";
var password = "ICS@100";
const odata = request("GET", "http://vmfioriics.ics-th.com:8000/sap/opu/odata/sap/ZPROFILE_SRV/GetEmployeeListSet?$format=json", {
  headers: {
      "Authorization": "Basic " + new Buffer(user + ":" + password).toString('base64')
  },
});
var sapRespond = JSON.parse(odata.getBody());
exports.sapRespond = sapRespond;

  const i 
  var employee =[
    {
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
   }
  ]

exports.employee = employee;
