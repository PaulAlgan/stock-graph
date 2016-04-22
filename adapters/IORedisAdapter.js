'use strict';
var async = require('async');
var IORedis = require('ioredis');

var writeClient, readClient;

function IORedisAdapter(){}

IORedisAdapter.init = function(options, callback){
  var connectionsRole = ['master', 'slave'];

  function connect(role, callback){
    getRedisClient(options, role, function(err, redisClient){
      if (err) return callback(err);
      callback(null, redisClient);
    });
  }

  async.map(connectionsRole, connect, function(err, redisConnections){
    if (err) return callback(err);
    writeClient = redisConnections[0];
    readClient = redisConnections[1];
    callback(null, redisConnections);
  });
};

function getWriteClient(){
  return writeClient;
}

function getRedisClient(options, role, callback){
  if(options.redisServers.length === 1 && !options.useRedisSentinel){
    return createRedisConnection(options, role, callback);
  }
  return createSentinelConnection(options, role, callback);
}

function createRedisConnection(options, role, callback) {
  var host = options.redisServers[0];
  var hostName = host.split(':')[0];
  var port = host.split(':')[1] || 6379;
  var redis = new IORedis({
    port: port,          // Redis port
    host: hostName,   // Redis host
    family: 4,           // 4 (IPv4) or 6 (IPv6)
    password: options.redisPass,
    db: 1
  });

  redis.on('ready',function(){
    callback(null, redis);
  });

  redis.on('error',function(error){
    callback(error);
  });
}

function createSentinelConnection(options, role, callback){
  var sentinels = options.redisServers.map(function(address){
    return {
      host:address.split(':')[0] ,
      port: address.split(':')[1] || 26379
    };
  });

  var redis = new IORedis({
    sentinels: sentinels,
    name: options.redisMasterName || 'mymaster',
    password: options.redisPass,
    db: 1
  });

  redis.on('ready',function(){
    return callback(null, redis);
  });

  redis.on('error',function(error){
    console.error('Redis On Error:', error);
    throw error;
  });

  redis.on('end',function(error){
    console.log('REDIS CLIENT END error:', error);
  });

  redis.on('end',function(error){
    console.log('REDIS CLIENT END error:', error);
  });
}


// Helper functions

function hmset(args) {
  if(Array.isArray(args)){
    return writeClient.hmset.apply(writeClient, args);
  }
  return writeClient.hmset.apply(writeClient, arguments);
}

function hmget(args) {
  if(Array.isArray(args)){
    return readClient.hmget.apply(readClient, args);
  }
  return readClient.hmget.apply(readClient, arguments);
}

function hset(args) {
  if(Array.isArray(args)){
    return writeClient.hset.apply(writeClient, args);
  }
  return writeClient.hset.apply(writeClient, arguments);
}

function hget(args) {
  if(Array.isArray(args)){
    return readClient.hget.apply(writeClient, args);
  }
  return readClient.hget.apply(writeClient, arguments);
}

function hdel(args) {
  if(Array.isArray(args)){
    return readClient.hdel.apply(writeClient, args);
  }
  return readClient.hdel.apply(writeClient, arguments);
}

function hgetall(key, callback) {
  return readClient.hgetall(key, callback);
}

function hincrby(args) {
  if(Array.isArray(args)){
    return writeClient.hincrby.apply(writeClient, args);
  }
  return writeClient.hincrby.apply(writeClient, arguments);
}

function hlen(args) {
  if(Array.isArray(args)){
    return writeClient.hlen.apply(writeClient, args);
  }
  return writeClient.hlen.apply(writeClient, arguments);
}

function set(key, data) {
 writeClient.set(key, data);
}

function get(key, callback) {
 readClient.get(key, callback);
}

function expire(key, time) {
 writeClient.expire(key, time);
}

function keys(key, callback) {
 readClient.keys(key, callback);
}

function scan(cursor, match, limit, callback) {
  var stream = readClient.scanStream({
    match: match,
    count: limit
  });

  var keys = [];
   stream.on('data', function (resultKeys) {
    for (var i = 0; i < resultKeys.length; i++) {
      keys.push(resultKeys[i]);
    }
   });
   stream.on('end', function () {
     callback(keys)
   });
}

function del(key) {
 readClient.del(key);
}

function multi(keys, callback) {
 writeClient.multi(keys).exec(callback);
}

IORedisAdapter.hmset = hmset;
IORedisAdapter.hmget = hmget;
IORedisAdapter.hset = hset;
IORedisAdapter.hget = hget;
IORedisAdapter.hdel = hdel;
IORedisAdapter.hincrby = hincrby;
IORedisAdapter.hgetall = hgetall;
IORedisAdapter.hlen = hlen;

IORedisAdapter.get = get;
IORedisAdapter.set = set;
IORedisAdapter.expire = expire;
IORedisAdapter.keys = keys;
IORedisAdapter.scan = scan;
IORedisAdapter.del = del;
IORedisAdapter.multi = multi;

IORedisAdapter.writeClient = getWriteClient;

module.exports = IORedisAdapter;
