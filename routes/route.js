var fs = require("jsonfile");

exports.home = function(request, response)
{
    response.send("<html><h4>Please call /ohlc for ohlc response</h4></html>");
}

var mongoose = require('mongoose');
var ohlcModelRead = mongoose.model('ohlcModelRead');
exports.ohlc = function (request, response)
{    
    // fs.readFile('./ohlc/ohlc_dummy_3.json', function(error, jsonObject) 
    // {
    //     if (error)
    //     {
    //         response.jsonp({ message: 'error reading ohlc file' });
    //     }
    //     else
    //     {
    //         response.jsonp(jsonObject);
    //     }
    // });

    //retrieve entire latest data - THIS IS WORKING BUT UGLY WITH ANOTHER SCHEMA
    ohlcModelRead.findOne({_id:1},        
        function(error, result)
        {
            if(error)
            {
                console.log('Error reading DB for render:' + error);
                response.jsonp({ message: 'error reading ohlc DB' });
            }
            else 
            {
                //response.jsonp(JSON.parse(JSON.stringify(result.data)));
                if (result != null)
                {
                    response.jsonp(result.data);
                }                
            }
        }
    );
}