// require('dotenv').config()
const {TwitterClient} = require('twitter-api-client')

const twitterClient = new TwitterClient({
    apiKey: 'XXXXXX',
    apiSecret: 'XXXX',
    accessToken: 'XXXXX-XXXXX',
    accessTokenSecret: 'XXXXX'
})

module.exports = twitterClient
