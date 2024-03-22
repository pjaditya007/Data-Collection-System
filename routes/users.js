var express = require('express');
var router = express.Router();
const { getTopTopics  } = require("../trends/getTrends");
const { getNewsArticles, addNewsArticlesToDB } = require("../newsAPI/api")
const { streamConnect, addTopTweetsToDB } = require("../twitterClient/getTweets")
// const { SampleStreamConnect, addSampleStreamTweetsToDB } = require("../twitterClient/getSampleStream");

const { getTopComments, addTopCommentsToDB }  = require("../redditCrawler/crawler")
/* GET users listing. */
router.get('/newsAPI', async function(req, res, next) {
  const data = await getNewsArticles('Brazil');
  addNewsArticlesToDB(data, res)
});

// /* Crawl Reddit Page. */
// router.get('/reddit', async function(req, res, next) {
//   const data = await crawlPage();
//   res.send(data);
// });

/* Crawl Top Topics. */
router.get('/getTopics', async function(req, res, next) {
  const data = await getTopTopics();
  res.send(data);
});

/* Twitter Tweets. */
router.get('/getTweets', async function(req, res, next) {
  const data = await streamConnect('Brazil');
  addTopTweetsToDB(data, res)
 // res.send(data);
});

// /* Twitter Tweets. */
// router.get('/getSampleTweets', async function(req, res, next) {
//   SampleStreamConnect(0);
// });

/* Top Comments. */
router.get('/getTopComments', async function(req, res, next) {
  try {
    const data = await getTopComments('Brazil');
    addTopCommentsToDB(data, res); 
  } catch (error) {
    res.send(error)
  }
 // res.send(data);
});

module.exports = router;
