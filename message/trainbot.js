const request = require('sync-request')
const Intent = request("GET", "https://line-liff-v2.herokuapp.com/intent", {
});
var getIntent = JSON.parse(Intent.getBody());
exports.getIntent = getIntent;

const trainmsg = {
    "type": "text",
    "text": "train bot success"
  }
  exports.trainmsg = trainmsg;