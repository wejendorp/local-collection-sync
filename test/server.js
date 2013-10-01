var express = require('express');

var app = express();
var data = require('./testdata');

app.use(express.static(__dirname + '/../build'));
app.use(express.static(__dirname));

app.get('/', function(req, res) {
  res.json(200, []);
});
app.get('/test', function(req, res) {
  res.json(200, data.models);
});
app.get('/test/:id', function(req, res) {
  var ret = data.getId(req.params.id);
  if(ret)
    res.json(ret);
  else
    res.send(404);
});

app.listen(3003);