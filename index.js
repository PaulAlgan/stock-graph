var express = require('express');
var async = require('async');

var IORedisAdapter = require('./adapters/IORedisAdapter.js')
var MongoAdapter = require('./adapters/MongoAdapter.js')
var dbConfig = require('./config/dbConfig.js');

var app = express();

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'hjs');




async.parallel(
  {
    mongo: async.apply(MongoAdapter.InitDB, dbConfig),
    redis: async.apply(IORedisAdapter.init, dbConfig)
  }, startServer
);

var port = (process.env.NODE_ENV=='production')?80:3000;


function startServer() {
  console.log('start server at port: '+port);
  app.get('/stock/*', function(req, res){
    require('./controller/stock.js')(req, res);
  });

  app.listen(port);
}
