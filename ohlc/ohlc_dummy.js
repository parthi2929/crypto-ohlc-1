var fs = require("jsonfile");
var utils = require('./ohlc_utils.js');
var chalk = require('chalk');
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


exports.goOHLCDummy = function(formatID)
{
    switch(formatID)
    {
        case 2:
            goOHLCDummy2();
            break;
        case 21:
            goOHLCDummy21();    //format as 2, but store in DB
            break;            
        case 3:
            goOHLCDummy3();
            break;
        default:
            goOHLCDummy2();
            break;
    }
    
}


async function goOHLCDummy3()
{   
    var initKey = 47;
    if(OHLCArray3.length == 0)
    {
        key = initKey;
    }
    else
    {
        key = OHLCArray3[OHLCArray3.length-1].close;
    } 

    var OHLCArray1 = await getDummies(key, initKey);

    //FORMAT 3: 
    // OHLCArray3 = [  { 'x':235123, 'open':32.52, 'high':52, 'low':23, 'close':45 } , { 'x':215232, 'open':45, 'high':66, 'low':35, 'close':23 }, ...  ]  Multiple rows filled up with main interval data so DO NOT START EMPTY    
    var result = 
    {
        'x':OHLCArray1[2][0],
        'open':OHLCArray1[0][1],
        'high':utils.max(OHLCArray1,2),
        'low':utils.min(OHLCArray1,3),
        'close':OHLCArray1[2][4],
        'volume':utils.max(OHLCArray1,5)
    }
    OHLCArray3.push(result);
    console.log("Array 3: " + OHLCArray3);

    writeFile(3);
}

var mongoose = require('mongoose');
var ohlcModelRead = mongoose.model('ohlcModelRead');
async function goOHLCDummy21()
{
    var initKey = 47;
    var key;

    ohlcModelRead.findOne({_id:1}, 
        async function(error, result)
        {
            if(error) 
            {
                console.log(chalk.red('Error retrieving lastC from DB: ' + error));
                key = initKey;
            }
            else 
            {
                console.log(chalk.blue('Raw result from DB: ' + result));
                if (result != null)
                {
                    key = result.data[result.data.length-1][4];     
                }
                else
                {
                    key = initKey;
                }                
            }
            console.log(chalk.yellow('LastC: ' + key));

            var OHLCArray1 = await getDummies(key, initKey);

            // OHLCArray2 = [ time, O ,H , L ,C]  ONLY ONE ROW of consolidated OHLCArray1. Starts empty in each main interval.
            var OHLCArray2 = [];
            OHLCArray2.push(OHLCArray1[2][0]);     //time is the latest in array
            OHLCArray2.push(OHLCArray1[0][1]);     //open is the first in array collections
            OHLCArray2.push(utils.max(OHLCArray1,2));     //high is the max of all 3rd element of each array(row)
            OHLCArray2.push(utils.min(OHLCArray1,3));     //low is the min of all 4th element of each array(row)
            OHLCArray2.push(OHLCArray1[2][4]);     //close is the close value of last array(row)
            OHLCArray2.push(utils.max(OHLCArray1,5));
            console.log("Array 2: " + OHLCArray2);
        
            appendDB(OHLCArray2);              
        }
    );
  
}

async function goOHLCDummy2()
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

    var OHLCArray1 = await getDummies(key, initKey);

    // OHLCArray2 = [ time, O ,H , L ,C]  ONLY ONE ROW of consolidated OHLCArray1. Starts empty in each main interval.
    var OHLCArray2 = [];
    OHLCArray2.push(OHLCArray1[2][0]);     //time is the latest in array
    OHLCArray2.push(OHLCArray1[0][1]);     //open is the first in array collections
    OHLCArray2.push(utils.max(OHLCArray1,2));     //high is the max of all 3rd element of each array(row)
    OHLCArray2.push(utils.min(OHLCArray1,3));     //low is the min of all 4th element of each array(row)
    OHLCArray2.push(OHLCArray1[2][4]);     //close is the close value of last array(row)
    OHLCArray2.push(utils.max(OHLCArray1,5));
    console.log("Array 2: " + OHLCArray2);

    //FORMAT 2: 
    // OHLCArray3 = [  [ time, O ,H , L ,C] , [ time, O , H , L, C], ...  ]  Multiple rows filled up with main interval data so DO NOT START EMPTY
    OHLCArray3.push(OHLCArray2);
    console.log("Array 3: " + OHLCArray3);
    //console.log("Array 3 length: " + OHLCArray3.length);
    //console.log("Array 3 lastC: " + OHLCArray3[OHLCArray3.length-1][4]);

    writeFile(2);
    
}

async function getDummies(key, initKey)
{

    // OHLCArray1 = [  [ time, O ,H , L ,C] , [ time, O , H , L, C], ...  ]  Multiple rows filled up with sub interval data. Starts empty in each main interval.
    var OHLCArray1 = []; 
    OHLCArray1.push(await dummyOHLC(key, initKey));                   //sub interval data
    OHLCArray1.push(await dummyOHLC(OHLCArray1[0][4], initKey));      //sub interval data
    OHLCArray1.push(await dummyOHLC(OHLCArray1[1][4], initKey));      //sub interval data 
    console.log("Array 1: " + OHLCArray1);

    return OHLCArray1;
    
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

    //wait for 10 seconds
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

function writeFile(formatID)
{
    //write data
    fs.writeFile('./ohlc/ohlc_dummy_' + formatID + '.json', OHLCArray3, {spaces: 1}, (error) => 
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


var ohlcModelWrite = mongoose.model('ohlcModelWrite');
function appendDB(OHLCArray2)
{
    //update the record with new data
    ohlcModelWrite.findOneAndUpdate(
        { _id:1},
        { $push: { 'data': OHLCArray2 } },
        { upsert: true },
        function(error, result)
        { 
            if(error) console.log(chalk.red('Error appending: ' + error)); 
            else console.log(chalk.green('Data Successfully appended in DB')); //VERY FIRST TIME RETURNS NULL THOUGH DATA APPENDED WHICH IS WRONG

            //Max size refresh for 4 years = 60*60*24*365*4 = 126144000 lines of OHLC if called per minute
            //Note max array length allowed =  2^32-1 = 4294967295 which is higher for now.
            if (result != null)  
            {
                if (result.data != null)
                {
                    if (result.data.length == 126144000) //if those many rows
                    {
                        result.data.length = 0;   //clean up
                    }
                }
            }            
        }
    );


}