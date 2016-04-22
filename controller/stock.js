var tick1dCollection = require('../collections/Tick1dCollection.js');
var moment = require('moment');

module.exports = function(req, res){
  if (!req.headers['upgrade-insecure-requests']) {
    return res.render('temp', {
      d: JSON.stringify([]),
      h: JSON.stringify([]),
      l: JSON.stringify([]),
      o: JSON.stringify([]),
      c: JSON.stringify([]),
      v: JSON.stringify([])
    });
  }


  var params = req.query;
  var compoment = req.originalUrl.split('?')[0].split('/');
  if (compoment.length < 3) return res.send('error');

  var limit = 300;
  if (params.p) limit = Math.min(limit, Number(params.p));
  else limit = 100;

  var query = {};
  query.symbol = compoment[2].toUpperCase();
  tick1dCollection.find(query, {limit: limit, sort: { time: -1 } }).toArray(function(err, results){
    var dict = compressTicks(results);
    var renderData = {
      d: JSON.stringify(dict.date),
      h: JSON.stringify(dict.high),
      l: JSON.stringify(dict.low),
      o: JSON.stringify(dict.open),
      c: JSON.stringify(dict.close),
      v: JSON.stringify(dict.volume)
    }
    res.render('temp', renderData);
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
