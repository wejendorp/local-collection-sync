var express = require('express');

var app = express();

app.get('/', function(req, res) {
  res.json(200, []);
});
app.get('/test', function(req, res) {
  res.json(200, [{id: 1}, {id: 2}]);
});
app.get('/test/:id', function(req, res) {
  res.json(200, {id: req.params.id, name:'test'+req.params.id});
});

app.listen(3003);