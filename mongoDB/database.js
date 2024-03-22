const MongoClient = require("mongodb").MongoClient

const url = "mongodb+srv://XXXX:XXXXXX@cluster0.dezkpda.mongodb.net/?retryWrites=true&w=majority"
var DB;

module.exports.connectToDb = connectToDb = function() {
     MongoClient.connect(url, {useNewUrlParser: true},(err,res) => {
         if(err) { console.log(err) }
         if(res) 
        {
         console.log(`connected to database at ${new Date()}`)
         DB = res.db("All_data")
        }
     })
}

module.exports.getDatabase = getDatabase = function() {
    return DB;
}