const Intent = request("GET", "https://line-liff-v2.herokuapp.com/intent", {
});
var getIntent = JSON.parse(Intent.getBody());
exports.getIntent = getIntent;
