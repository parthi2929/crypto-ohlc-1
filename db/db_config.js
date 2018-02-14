//local dB
var db_collection = 'ohlc-koinex-1';
var db_uri = 'mongodb://localhost:27017/test';

// //dummy cloud DB
// var db_collection = 'ohlc-min-DB';
// var db_uri = 'mongodb://ohlcuser1:ohlcuser1@ds251747.mlab.com:51747/ohlc-dummy-1';

// //main cloud DB - koinex
// var db_collection = 'ohlc-koinex-1';
// var db_uri = 'mongodb://ohlcuser1:ohlcuser1@ds261527.mlab.com:61527/ohlc-main-1';


module.exports = 
{
    collection: db_collection,
    uri: db_uri
}

