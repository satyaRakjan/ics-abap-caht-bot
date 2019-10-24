var ts = new Date();
var year = ts.getFullYear();
const request = require('sync-request')
const holiday = request("GET", "https://apigw1.bot.or.th/bot/public/financial-institutions-holidays/?year="+year, {
  headers: {
    accept: 'application/json',
    'x-ibm-client-id': '94b9f30c-e28b-48d4-b798-de3ef4528c43'
  },
});
var holidayRespond = JSON.parse(holiday.getBody());
exports.holidayRespond = holidayRespond;

var date = ts.toISOString().substring(0,10);
exports.date = date;

const today = {
    "type": "text",
    "text": ts.toDateString()
  };
  exports.today = today;
