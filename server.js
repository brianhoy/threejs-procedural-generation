var express = require('express');
var app = express();

app.use(express.static(__dirname + '/client'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/client/index.html');
});

app.get('/demo', function (req, res) {
  res.sendFile(__dirname + '/client/layout/jenga.html');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});