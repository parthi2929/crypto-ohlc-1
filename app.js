//1. Import
var express = require('express');
var path = require('path');
var routes = require('./routes/route.js');

//2. Initiate
var app = express();

//3. Configure
app.get("/ohlc",routes.ohlc);
app.get("/",routes.home);



//5. Start OHLC
var OHLC = require('./ohlc/ohlc_dummy.js');
var OHLCCounter = 0;
function periodicOHLC() 
{        
    OHLC.goOHLCDummy();
    ++OHLCCounter;
    console.log("OHLC Count: " + OHLCCounter);
} 

//6. Listen
var port = process.env.PORT || 8080;
var server = app.listen(port,
    function(request,response)
    {
        console.log("Catch the action at http://localhost:" + port);
    }
);

//6. Repeat ohlc forever..
setInterval(periodicOHLC, 60000);   //1 minute
