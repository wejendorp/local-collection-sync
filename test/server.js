var express = require('express');

var app = express();

app.get('*', function(req, res) {
  res.json(200, {id: 1, name: 'Server!'});
})

app.listen(3003);