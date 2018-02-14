var  mongoose = require('mongoose');

var ohlcSchema = mongoose.Schema(
    {
        _id:{type: Number, unique: true},
        data: [Number]
    },
    {
        collection:'ohlc-min-DB'
    }
);
var ohlcSchemaRead = mongoose.Schema(
    {
        _id:{type: Number, unique: true},
        data: [[Number]]
    },
    {
        collection:'ohlc-min-DB'
    }
);

var ohlcModel = mongoose.model('ohlcModel', ohlcSchema);
var ohlcModelRead = mongoose.model('ohlcModelRead', ohlcSchemaRead);

mongoose.connect(
    'mongodb://localhost:27017/test',
    {
        useMongoClient:true
    }
);   
var myDBConnection = mongoose.connection;

//open the DB
myDBConnection.once(
    'open',
    function()
    {
        //update the record with new data   - THIS IS WORKING 
        ohlcModel.findOneAndUpdate(
            { _id:1},
            { $push: { 'data': [1234,23,2352,123,523,23523] } },
            { upsert: true },
            function(error, result)
            { 
                if(error) console.log('Error appending: ' + error); 
                else console.log('Data Successfully appended: ' + result); //VERY FIRST TIME RETURNS NULL THOUGH DATA APPENDED WHICH IS WRONG
            }
        );

        //retrieve entire latest data - THIS IS WORKING BUT UGLY WITH ANOTHER SCHEMA
        ohlcModelRead.findOne({_id:1},        
            function(error, result)
            {
                if(error) console.log('Error retrieving: ' + error);
                else 
                {
                    console.log('Existing Data: ' + JSON.stringify(result.data)); 
                    console.log('Existing Data Rows: ' + result.data.length);
                    console.log('Existing Data Columns: ' + result.data[0].length);
                }
            }
        );
    }
);

//Exit automatically after a while
setTimeout(
    function()
    {
        mongoose.disconnect();
    },
    3000
);