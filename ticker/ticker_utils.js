var cloudscraper = require('cloudscraper');
var isJSON = require('is-json');
var fs = require("jsonfile");
var chalk = require('chalk');

exports.currentDateTime = function()
{
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}

exports.convertUSDToINR = function(usdNumber, currencyFactor)
{

    return (parseFloat(usdNumber)*currencyFactor).toFixed(2);
}

exports.getTicker = function(url)
{
    return getTicker(url);
}


async function getTicker(url)
{
    return new Promise ((resolve, reject) =>
    {
        
        cloudscraper.get(url, function(error, response, body) 
        {
            if (error) 
            {
                //console.log(chalk.yellow('Error occurred while calling url:\n' + JSON.stringify(error))); //ignore and try again next time
                //console.log('Problamatic URL: ' + url);
                reject(new Error(JSON.stringify(error)));
            } else 
            {
                if (isJSON(body))
                {
                    //console.log("Coinsecure retrieval success");
                    resolve(body);
                }
                else
                {
                    reject(new Error("Returned response is not a valid JSON"));
                }        

            }
        });         
    });
}