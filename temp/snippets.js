//aggregating  5 min from 1 min chart..
db.col.aggregate([
    {"$project":{
      "data":{
        "$let":{
          "vars":{
            "mints":{"$arrayElemAt":[{"$arrayElemAt":["$data",0]},0]},
            "maxts":{"$arrayElemAt":[{"$arrayElemAt":["$data",-1]},0]}
          },
          "in":{
            "$map":{
              "input":{"$range":["$$mints",{"$add":["$$maxts",300]},300]},
              "as":"rge",
              "in":{
                "$let":{
                  "vars":{
                    "five":{
                      "$filter":{
                        "input":"$data",
                        "as":"fres",
                        "cond":{
                          "$and":[
                            {"$gte":[{"$arrayElemAt":["$$fres",0]},"$$rge"]},
                            {"$lt":[{"$arrayElemAt":["$$fres",0]},{"$add":["$$rge",300]}]}
                          ]
                        }
                      }
                    }
                  },
                  "in":[
                    {"$arrayElemAt":[{"$arrayElemAt":["$$five",-1]},0]},
                    {"$arrayElemAt":[{"$arrayElemAt":["$$five",0]},1]},
                    {"$max":{"$map":{"input":"$$five","as":"res","in":{"$arrayElemAt":["$$res",2]}}}},
                    {"$min":{"$map":{"input":"$$five","as":"res","in":{"$arrayElemAt":["$$res",3]}}}},
                    {"$arrayElemAt":[{"$arrayElemAt":["$$five",-1]},-2]},
                    {"$arrayElemAt":[{"$arrayElemAt":["$$five",-1]},-1]}
                  ]
                }
              }
            }
          }
        }
      }
    }}
  ]);