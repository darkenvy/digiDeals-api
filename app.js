var express = require('express');
var http = require('http');
var app = express();

var options = {
  host: 'swapi.co',
  port: 80,
  path: '/api/starships/?format=json',
  method: 'GET'
}

app.get('/', function(req, res) {
  http.request(options, function(response) {
    var data = '';
    response.on('data', function(chunk) {
      data += chunk;
    });
    response.on('end', function() {
      console.log(data);
      res.send(JSON.parse(data))
    })
    // console.log(response);
    // res.send(response)
  }).end();
})

var server = app.listen(3000) // port 8080