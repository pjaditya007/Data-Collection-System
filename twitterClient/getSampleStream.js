// Open a live stream of roughly 1% random sample of publicly available Tweets
// https://developer.twitter.com/en/docs/twitter-api/tweets/volume-streams/quick-start

const needle = require('needle');
const { bearerToken } = require('../config/config');
var DB = require("../mongoDB/database").getDatabase

const endpointUrl = 'https://api.twitter.com/2/tweets/sample/stream?tweet.fields=author_id,created_at,text&user.fields=created_at&place.fields=country';

function SampleStreamConnect(retryAttempt) {
  let count = 0, tweets = [];
  const dayInMilliseconds = 1000 * 60 * 60 * 24;
  setInterval(() => {
    addTweetCountToDB({ time: new Date(), count })
  }, dayInMilliseconds)
  const stream = needle.get(endpointUrl, {
    headers: {
      "User-Agent": "v2SampleStreamJS",
      "Authorization": `Bearer ${bearerToken}`
    },
    timeout: 20000
  });

  stream.on('data', data => {
    try {
      const json = JSON.parse(data);
      tweets.push(json.data)
      count++;
      if (count && count === 2000) {
        addSampleStreamTweetsToDB(tweets);
        tweets = [];
        //stream.removeAllListeners()
      }
      // A successful connection resets retry count.
      retryAttempt = 0;
    } catch (e) {
      // Catches error in case of 401 unauthorized error status.
      if (data.status === 401) {
        console.log(data);
        // process.exit(1);
      } else if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
        console.log(data.detail)
        // process.exit(1)
      } else {
        // Keep alive signal received. Do nothing.
      }
    }
  }).on('err', error => {
    if (error.code !== 'ECONNRESET') {
      console.log(error.code);
      process.exit(1);
    } else {
      // This reconnection logic will attempt to reconnect when a disconnection is detected.
      // To avoid rate limits, this logic implements exponential backoff, so the wait time
      // will increase if the client cannot reconnect to the stream.
      setTimeout(() => {
        console.warn("A connection error occurred. Reconnecting...")
        SampleStreamConnect(++retryAttempt);
      }, 2 ** retryAttempt);
    }
  });
  return stream;
}

const addSampleStreamTweetsToDB = async (docs = [], res) => {
  try {
    if (docs && docs.length) {
      let database = DB();
      const response = await database.collection("twitterSampleStream").insertMany(docs)
      console.log(response?.insertedCount)
      if (res) {
        res.send(response)
      }
    }
  } catch (err) {
    console.log('Failed to Add docs to DB ', new Date())
  }

}

const addTweetCountToDB = async (doc = {}, res) => {
  try {
    if (doc && Object.keys(doc).length) {
      let database = DB();
      const response = await database.collection("twitterStreamStatistics").insertOne(doc)
      console.log(response?.insertedCount)
      if (res) {
        res.send(response)
      }
    }
  } catch (err) {
    console.log("Failed to Add to Docs: ", doc)
  }
}
module.exports = {
  SampleStreamConnect,
  addSampleStreamTweetsToDB
}