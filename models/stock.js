var moment = require('moment');

var tick1dCollection = require('../collections/Tick1dCollection.js');

function getCompressTicks(query, options, callback){
  tick1dCollection.find(query, options).toArray(function(err, results){
    if (err) return callback(err);

    var dict = compressTicks(results);
    callback(null, dict);
  });
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

exports.getCompressTicks = getCompressTicks;
