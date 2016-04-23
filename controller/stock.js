var stockModel = require('../models/stock')

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
  var options = {limit: limit, sort: { time: -1 } }

  stockModel.getCompressTicks(query, options, function(err, dict){
    var renderData = {
      s: query.symbol,
      d: JSON.stringify(dict.date),
      h: JSON.stringify(dict.high),
      l: JSON.stringify(dict.low),
      o: JSON.stringify(dict.open),
      c: JSON.stringify(dict.close),
      v: JSON.stringify(dict.volume),
      ema1: 15,
      ema2: 30,
      ema3: 99

    }
    // res.render('temp', renderData);
    res.render('full_plot', renderData);
  })
}
