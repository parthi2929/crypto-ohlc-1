var  mongoose = require('mongoose');
var chalk = require("chalk");
var config = require('./db_config.js');
//mongoose.Promise = global.Promise;
var ohlcSchema = mongoose.Schema(
    {
        _id:{type: Number, unique: true},
        data: [Number]
    },
    {
        collection: config.collection
    }
);
var ohlcSchemaRead = mongoose.Schema(
    {
        _id:{type: Number, unique: true},
        data: [[Number]]
    },
    {
        collection:config.collection
    }
);

//var uri = 'mongodb://localhost:27017/test';
var uri = config.uri;

//models for write and read
mongoose.model('ohlcModelWrite', ohlcSchema);
mongoose.model('ohlcModelRead', ohlcSchemaRead);

//connection
var myDBConnected = false;
mongoose.connect(uri,{useMongoClient:true});
var myDBConnection = mongoose.connection;

//connection events
mongoose.connection.on('connected', function(){myDBConnected = true;console.log(chalk.yellow('DB Connected'));});
mongoose.connection.on('error', function(){myDBConnected = false;console.log(chalk.red('DB Error'))});
mongoose.connection.on('disconnected', function(){myDBConnected = false;console.log(chalk.red('DB Disconnected'));});

exports.openDB = function()
{
    if (!myDBConnection)    //if disconnected, connect
    {
        mongoose.connect(uri,{useMongoClient:true});
        myDBConnection = true;
    }    
}

exports.closeDB = function()
{
    if (myDBConnection) //if connected, disconnect
    {
        mongoose.disconnect();
        myDBConnection = false;    
    }
}