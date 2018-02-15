//1. Import
var express = require('express');
var path = require('path');

var db = require('./db/db.js');  //caz route uses mongodb, this goes first
var routes = require('./routes/route.js');


//2. Initiate
var app = express();

//3. Configure
app.get("/ohlc",routes.ohlc);
app.get("/ohlc5",routes.ohlc5); //5 min interval 
app.get("/",routes.home);



//5. Start OHLC
// var OHLC = require('./ohlc/ohlc_dummy.js');
// var OHLCCounter = 1;
// console.log("\nOHLC Count: " + OHLCCounter);
// var formatID = 21;
// //db.openDB();
// OHLC.goOHLCDummy(formatID);
// function periodicOHLC() 
// {        
//     //db.openDB();
//     OHLC.goOHLCDummy(formatID);
//     ++OHLCCounter;
//     //db.closeDB();   //if too frequent update, you may want to avoid this
//     console.log("\nOHLC Count: " + OHLCCounter);
// } 

//5. Start OHLC Main
var OHLCKoinex = require('./ohlc/ohlc_koinex.js');
var OHLCCounter = 1;
OHLCKoinex.go();
console.log("\nOHLC Count: " + OHLCCounter);
function periodicOHLC()
{
    OHLCKoinex.go();
    ++OHLCCounter;
    console.log("\nOHLC Count: " + OHLCCounter);
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
