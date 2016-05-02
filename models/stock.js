var moment = require('moment');

var tick1dCollection = require('../collections/Tick1dCollection.js');
var IORedisAdapter = require('../adapters/IORedisAdapter.js');

function getCompressTicks(query, options, callback){
  getTicksFromCache(query, options, function(cacheResult){
    if (cacheResult) {
      return callback(null, cacheResult);
    }

    tick1dCollection.find(query, options).toArray(function(err, results){
      if (err) return callback(err);

      var dict = compressTicks(results);
      cacheTicks(query, options, dict);
      callback(null, dict);
    });
  });
}

function getTicks(query, options, callback){
  tick1dCollection.find(query, options).toArray(function(err, results){
    if (err) return callback(err);
    callback(null, results);
  });
}

function updateTick(tick, callback){
  var id = objectId(tick._id);
  tick1dCollection.updateOne(
    { "_id" : tick._id },
    {
      $set: tick
    }, function(err, result) {
    if (callback) callback(err, result);
 });

}


function cacheTicks(query, options, data){
  var hKey = hKeyFromQuery(query, options);
  var opt = 'l:'+options.limit;
  var param = [hKey, opt, JSON.stringify(data)];
  IORedisAdapter.hset(param);
  IORedisAdapter.expire(hKey, 3600);
}


function getTicksFromCache(query, options, callback){
  var hKey = hKeyFromQuery(query, options);
  var opt = 'l:'+options.limit;
  IORedisAdapter.hget(hKey, opt, function(err, result){
    if (!result) return callback(null);
    callback(JSON.parse(result));
  });
}

function hKeyFromQuery(query, options){
  var key = 's:'+query.symbol;
  return key
}

function compressTicks(ticks){
  var close=[], high=[], low=[], open=[], volume=[], date=[];

  ticks.forEach(function(tick){
    var utc = moment(tick.date, 'YYYY-MM-DD');
    var dateString = utc.format('DD-MMM-YY');
    high.push(tick.high);
    low.push(tick.low);
    open.push(tick.open);
    close.push(tick.close);
    volume.push(tick.volume);
    date.push(dateString);
  });

  return {
    high: high,
    low: low,
    open: open,
    close: close,
    volume: volume,
    date: date,
  }
}

function objectId(id) {
  if (id.length !== 24) return '';
  var ObjectID = require('mongodb').ObjectID;
  var newID = new ObjectID(id);
  return newID;
};

exports.getCompressTicks = getCompressTicks;
exports.getTicks = getTicks;
exports.updateTick = updateTick;
