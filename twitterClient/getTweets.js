// Open a live stream of roughly 1% random sample of publicly available Tweets
// https://developer.twitter.com/en/docs/twitter-api/tweets/volume-streams/quick-start

const needle = require('needle');
const { bearerToken } = require('../config/config');
var DB = require("../mongoDB/database").getDatabase

const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";

function streamConnect(q) {
    return new Promise(async (resolve, reject) => {
        let params = {
            'query': q + ' lang:en -is:retweet',
            'max_results': 100,
            'tweet.fields': 'author_id,created_at,text'
        }

        let count = 0;
        let tweetData = [];
        while (count < 3000) {
            let res = await needle('get', endpointUrl, params, {
                headers: {
                    "User-Agent": "v2RecentSearchJS",
                    "authorization": `Bearer ${bearerToken}`
                }
            })

            if (res.body) {
                count = count + res?.body?.meta?.result_count;
                if (res.body?.meta?.next_token) {
                    params['next_token'] = res.body?.meta?.next_token;
                }
                const modifiedData = (res?.body?.data || [])?.map(ele => { return { ...ele, query: q } });
                tweetData.push(...modifiedData);
            } else {
                if (count > 0) {
                    console.log('TweetData: ', tweetData.length)
                    resolve(tweetData)
                } else {
                    reject('Unsuccessful request');
                }
            }
        }
        console.log('TweetData: ', tweetData.length, q)
        resolve(tweetData)
    })
}

const addTopTweetsToDB = async (docs, res) => {
    try {
        if (docs && docs.length) {
            console.log("Adding to DB", docs.length)
            let database = DB();
            if (docs.length) {
                const response = await database.collection("twitter").insertMany(docs)
                console.log(response?.insertedCount)
                if (res) {
                    res.send(response)
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}
module.exports = {
    streamConnect,
    addTopTweetsToDB
}