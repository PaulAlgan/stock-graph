var talib = require('talib');
var async = require('async');
var stockModel = require('./models/stock');



function spot(symbol){
  stockModel.getTicks({symbol: symbol}, {sort: {date:-1}, limit:100}, function(err, results){
    console.log(symbol, results.length);

    for (var i = results.length-2; i >= 0 ; i--) {
      var currTick = results[i];
      var prevTick = results[i+1];
      if (currTick.close > currTick.open) {

        if (currTick.ema15 > currTick.ema50 && prevTick.ema15 < prevTick.ema50) {
          console.log('BUY', currTick);
        }

      }
    }
  });
}

function fillData(symbol, callback){
  stockModel.getTicks({symbol: symbol}, {sort: {date:-1}}, function(err, results){
    console.log(symbol, results.length);
    if (results.length == 0) return callback();
    async.parallel(
      {
        ema15: async.apply(calculateEMA, results, 15),
        ema50: async.apply(calculateEMA, results, 50),
        ema100: async.apply(calculateEMA, results, 100)
      }, function(err, result){
        var keys = Object.keys(result);
        keys.forEach(function(k){
          var data = result[k];
          for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var tick = results[i];
            tick[k] = d;
          }
        });
        updateTicks(results, function(){
          callback();
        })
      }
    );
  });

}

function updateTicks(ticks, callback){
  var count = ticks.length, i=0;
  async.eachSeries(ticks, function insert(tick, callback){
    stockModel.updateTick(tick, function(err, result){
      console.log(++i+'/'+count);
      callback();
    });
  }, function(err){
    console.log('UPDATE DONE');
    callback();
  });
}

function calculateEMA(tickArray, period, callback){
  var marketData = convertTickToArray(tickArray.reverse());
  tickArray.reverse()
  talib.execute({
      name: "EMA",
      startIdx: 0,
      inReal: marketData.close,
      endIdx: marketData.close.length - 1,
      high: marketData.high,
      low: marketData.low,
      close: marketData.close,
      optInTimePeriod: period
  }, function (result) {
      // console.log("Results:", result.result.outReal.reverse());
      if (result.result.outReal) {
        var ema = result.result.outReal.reverse();
        callback(null, ema);
      }
      else{
        callback(null, []);
      }

  });
}


function convertTickToArray(tickArray){
  var o = [], c = [], h = [], l = [], v = [];
  for (var i = 0; i < tickArray.length; i++) {
    var tick = tickArray[i];
    o.push(tick.open);
    c.push(tick.close);
    h.push(tick.high);
    l.push(tick.low);
    v.push(tick.volume);
  }
  return { open: o, close: c, high: h, low: l, volume: v }
}


exports.spot = spot;
exports.fillData = fillData;
