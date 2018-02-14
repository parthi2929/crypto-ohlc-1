//import { setTimeout } from "timers";

var fs = require("jsonfile");
var ohlc_utils = require('./ohlc_utils.js');
var ticker_utils = require('../ticker/ticker_utils.js');
var chalk = require('chalk');
var OHLCArray3 = [];
var volume = 0;

exports.go = function()
{
    go();
}


var mongoose = require('mongoose');
var ohlcModelRead = mongoose.model('ohlcModelRead');
async function go()
{
    var OHLCArray1 = await getTickerArray();   //returns after 10*5 = 50 seconds

    ohlcModelRead.findOne({_id:1}, 
        async function(error, result)
        {
            if(error) 
            {
                console.log(chalk.red('Error retrieving lastC from DB: ' + error));
                //key = OHLCArray1[0];
            }
            else 
            {
                console.log(chalk.blue('Raw result from DB: ' + result));
                if (result != null)
                {
                    OHLCArray1[0] = result.data[result.data.length-1][4];     
                }
                // else    //array is empty
                // {
                //     key = OHLCArray1[0];
                // }                
            }
            console.log(chalk.yellow('LastC: ' + OHLCArray1[0]));


    
            // OHLCArray2 = [ time, O ,H , L ,C]  ONLY ONE ROW of consolidated OHLCArray1. Starts empty in each main interval.
            var OHLCArray2 = [];

            if (OHLCArray1 && OHLCArray1.length > 0)  //if not even 1 ticker retrieval success, no use trying in this iteration
            {
                OHLCArray2.push(Math.floor((new Date).getTime() / 1000));     //time
                OHLCArray2.push(OHLCArray1[0]);       //open is the first in array collections
                OHLCArray2.push(Math.max(...OHLCArray1));     //high (and high always >= close)
                OHLCArray2.push(Math.min(...OHLCArray1));     //low (and low always <= open)
                OHLCArray2.push(OHLCArray1[OHLCArray1.length-1]);     //close is the close value of last array(row)
                OHLCArray2.push(volume); //Last Volume
                console.log("Array 2: " + OHLCArray2);
            
                appendDB(OHLCArray2);         
            }
        }
    );

         
    
}

async function getTickerArray()
{

    var OHLCArray1 = [];    //get array of data, each at 10 sec interval
    var [p,v] = [];
    try
    {
        for (i = 0; i < 4; i++) 
        {
            [p,v] = await getTicker();
            OHLCArray1.push(p);   
        }
    }
    catch(e)
    {
        console.log(chalk.red("\n " + ticker_utils.currentDateTime() + "  Error: " + e.message));            
        //return [];  // In case of any error in retriving data, send empty array
    }
    if (OHLCArray1.length != 0)
    {
        console.log("Array 1: " + OHLCArray1);
    }
    else
    {
        console.log(chalk.red("\n " + ticker_utils.currentDateTime() + "  Array 1 empty. Try next slot "));            
    }
    return OHLCArray1;          
      
}
async function getTicker()
{
    var isTickerError = false;
    var price;

    //lets assume BTCINR for now.. 
    try
    {
        const koinexResultPromise = await ticker_utils.getTicker('https://koinex.in/api/ticker');
        var koinexResult = JSON.parse(koinexResultPromise);
        price = koinexResult.prices.BTC;  
        volume = koinexResult.stats.BTC.vol_24hrs;
        console.log("\n " + ticker_utils.currentDateTime() + "  Koinex BTCINR Price: " + price + "  Volume: " + volume);    
        isTickerError = true;
    }
    catch(e)
    {
        isTickerError = false;
        console.log(chalk.red("\n " + ticker_utils.currentDateTime() + "  Koinex BTCINR ticker error: " + e.message));            
    }

    //Return exactly after 10 seconds
    return new Promise(
        (resolve, reject) =>
        {
            setTimeout(
                () =>
                {
                    if ((isTickerError == true) && (koinexResult != null))
                    {
                        resolve([price, volume]);
                    }
                    else
                    {
                        reject(new Error('Either api took too long or returned wrong response'));
                    }
                }, 10000
            );
        }
    );

    
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