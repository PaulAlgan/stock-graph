var stockModel = require('../models/stock')
var moment = require('moment');
module.exports = function(req, res){

  var query = {'symbol': req.query.symbol};
  var options = { 'limit': 100 };


  var dateTimeToday = moment().utcOffset('+0700').format("YYYY-MM-DD 09:30");
  var utcTime = moment(dateTimeToday, "YYYY-MM-DD HH:mm").utc().valueOf();;
  console.log(dateTimeToday, utcTime);


  // stockModel.getTicks(query, options, function(err, results){
  //
  //   results = results.map(function(tick){
  //   });
  //
  //   res.render('index', {'data': JSON.stringify(results) });
  // })
}
