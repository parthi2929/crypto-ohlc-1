exports.currentDateTime = function()
{
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
}

exports.genRand =  function(min, max, decimalPlaces) {  
    var rand = Math.random()*(max-min) + min;
    var power = Math.pow(10, decimalPlaces);
    return Math.floor(rand*power) / power;
}

exports.max = function(twoDimArray,index)   
{
    var arr = [];
    //console.log("To ensure no of rows: " + twoDimArray.length);
    for(i = 0; i < twoDimArray.length; i++)
    {
        arr.push(twoDimArray[i][index]);
    }
    return Math.max.apply(null, arr);
}

exports.min = function(twoDimArray,index)   
{
    var arr = [];
    //console.log("To ensure no of rows: " + twoDimArray.length);
    for(i = 0; i < twoDimArray.length; i++)
    {
        arr.push(twoDimArray[i][index]);
    }
    return Math.min.apply(null, arr);
}

exports.round = function(number, precision) {
    var factor = Math.pow(10, precision);
    var tempNumber = number * factor;
    var roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
};