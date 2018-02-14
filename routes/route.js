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
//var ohlcModelWrite = mongoose.model('ohlcModelWrite');
exports.ohlc5 = function (request, response)
{ 
    console.log('Request for ohlc 5 min interval');
    //retrieve entire latest data - 
    ohlcModelRead.aggregate(
      [
        {"$project":
          {
            "data":
            {
              "$let":
              {
                "vars":
                {
                  "mints":{"$arrayElemAt":[{"$arrayElemAt":["$data",0]},0]},
                  "maxts":{"$arrayElemAt":[{"$arrayElemAt":["$data",-1]},0]}
                },
                "in":
                {
                    "$setDifference":
                    [
                        {
                          "$map":
                          {
                            "input":{"$range":["$$mints",{"$add":["$$maxts",300]},300]},
                            "as":"rge",
                            "in":
                            {
                              "$let":
                              {
                                "vars":
                                {
                                  "five":
                                  {
                                    "$filter":
                                    {
                                      "input":"$data",
                                      "as":"fres",
                                      "cond":
                                      {
                                        "$and":
                                        [
                                          {"$gte":[{"$arrayElemAt":["$$fres",0]},"$$rge"]},
                                          {"$lt":[{"$arrayElemAt":["$$fres",0]},{"$add":["$$rge",300]}]}
                                        ]
                                      }
                                    }
                                  }
                                },
                                "in":
                                {
                                    "$cond":[
                                        {"$eq":["$$five",[]]},
                                        "$$five",
                                        [
                                          {"$arrayElemAt": [{"$arrayElemAt":["$$five",-1]},0]},
                                          {"$arrayElemAt":[{"$arrayElemAt":["$$five",0]},1]},
                                          {"$max":{"$map":{"input":"$$five","as":"res","in":{"$arrayElemAt":["$$res",2]}}}},
                                          {"$min":{"$map":{"input":"$$five","as":"res","in":{"$arrayElemAt":["$$res",3]}}}},
                                          {"$arrayElemAt":[{"$arrayElemAt":["$$five",-1]},-2]},
                                          {"$arrayElemAt":[{"$arrayElemAt":["$$five",-1]},-1]}
                                        ]
                                    ]
                                 }
                              }
                            }
                          }
                      },[]
                     ]
                  }
                }
              }
            }
          }
      ]
     ,        
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
                    result = JSON.stringify(result)
                    console.log('Request for ohlc 5 min interval successful: '  + JSON.parse(result)[0].data);
                    response.jsonp(JSON.parse(result)[0].data);
                }                
            }
        }
    );
}