var fs = require("jsonfile");
var utils = require('./ohlc_utils.js');
var isInitialized = false;
var OHLCArray3 = [];
var time;
var key;
var O;
var H;
var L;
var C;
var V;
var atomicInterval;

exports.goOHLCDummy = function()
{
    goOHLCDummy();
}

async function goOHLCDummy()
{
    var initKey = 47;
    if(OHLCArray3.length == 0)
    {
        key = initKey;
    }
    else
    {
        key = OHLCArray3[OHLCArray3.length-1][4];
    }

    
    // OHLCArray1 = [  [ time, O ,H , L ,C] , [ time, O , H , L, C], ...  ]  Multiple rows filled up with sub interval data. Starts empty in each main interval.
    var OHLCArray1 = []; 
    OHLCArray1.push(await dummyOHLC(key, initKey));                   //sub interval data
    OHLCArray1.push(await dummyOHLC(OHLCArray1[0][4], initKey));      //sub interval data
    OHLCArray1.push(await dummyOHLC(OHLCArray1[1][4], initKey));      //sub interval data 
    console.log("Array 1: " + OHLCArray1);


    // OHLCArray2 = [ time, O ,H , L ,C]  ONLY ONE ROW of consolidated OHLCArray1. Starts empty in each main interval.
    var OHLCArray2 = [];
    OHLCArray2.push(OHLCArray1[2][0]);     //time is the latest in array
    OHLCArray2.push(OHLCArray1[0][1]);     //open is the first in array collections
    OHLCArray2.push(utils.max(OHLCArray1,2));     //high is the max of all 3rd element of each array(row)
    OHLCArray2.push(utils.min(OHLCArray1,3));     //low is the min of all 4th element of each array(row)
    OHLCArray2.push(OHLCArray1[2][4]);     //close is the close value of last array(row)
    OHLCArray2.push(utils.max(OHLCArray1,5));
    console.log("Array 2: " + OHLCArray2);


    // OHLCArray3 = [  [ time, O ,H , L ,C] , [ time, O , H , L, C], ...  ]  Multiple rows filled up with main interval data so DO NOT START EMPTY
    OHLCArray3.push(OHLCArray2);
    console.log("Array 3: " + OHLCArray3);
    //console.log("Array 3 length: " + OHLCArray3.length);
    //console.log("Array 3 lastC: " + OHLCArray3[OHLCArray3.length-1][4]);

    //write data
    fs.writeFile("./ohlc/ohlc_dummy_2.json", OHLCArray3, {spaces: 1}, (error) => 
    {
        if (error) 
        {
            console.error("\n " + utils.currentDateTime() + "Error writing OHLC JSON data file: " + error);
            return;
        };
        console.log("\n " + utils.currentDateTime() + " OHLC JSON data File has been updated");
    }); 


    //Max size refresh for 4 years = 60*60*24*365*4 = 126144000 lines of OHLC if called per minute
    //Note max array length allowed =  2^32-1 = 4294967295 which is higher for now.
    if (OHLCArray3.length == 126144000)
    {
        OHLCArray3.length = 0;  //start from fresh
    }
    
}

//each dummy call should last about 5 seconds.. 
function dummyOHLC(lastC ,key)
{
    var OHLCTempArray = [];
    var open = utils.round(lastC,2); //new open is last close
    var low = utils.round(utils.genRand(key*0.27, key*0.33, 2),2);
    var close = utils.round(utils.genRand(key*0.21, key*0.36, 2) + low,2);
    var high = utils.round(utils.genRand(key*0.3, key*0.42, 2) + Math.max(open, close),2);
    var vol = Math.floor(utils.genRand(63879193*0.25, 63879193*0.25, 2));
    OHLCTempArray.push((new Date).getTime());
    OHLCTempArray.push(open);  
    OHLCTempArray.push(high);
    OHLCTempArray.push(low);
    OHLCTempArray.push(close);    
    OHLCTempArray.push(vol); 
    console.log("Dummy Array: " + OHLCTempArray);  

    //wait for 5 seconds
    return new Promise(
        (resolve, reject) =>
        {
            setTimeout(
                () =>
                {
                    resolve(OHLCTempArray);
                }, 10000
            );
        }
    );
}
