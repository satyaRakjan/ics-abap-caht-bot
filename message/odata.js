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


