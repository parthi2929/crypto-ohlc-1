var fs = require("jsonfile");

exports.home = function(request, response)
{
    response.send("<html><h4>Please call /ohlc for ohlc response</h4></html>");
}


exports.ohlc = function (request, response)
{    
    fs.readFile('./ohlc/ohlc_dummy_3.json', function(error, jsonObject) 
    {
        if (error)
        {
            response.jsonp({ message: 'error reading ohlc file' });
        }
        else
        {
            response.jsonp(jsonObject);
        }
    });
}