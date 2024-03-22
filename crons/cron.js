var cron = require('node-cron');
const { getTopTopics } = require("../trends/getTrends");
const { streamConnect, addTopTweetsToDB } = require("../twitterClient/getTweets")
const { getTopComments, addTopCommentsToDB }  = require("../redditCrawler/crawler")
const { getNewsArticles, addNewsArticlesToDB } = require("../newsAPI/api")

cron.schedule('0 0 10 * * *', async () => {
    try {
        const topics = await getTopTopics();
        console.log(topics);
        for(let each of topics.split(",")) {
            let data = await getNewsArticles(each.trim());
            addNewsArticlesToDB(data)
        
            data = await streamConnect(each.trim());
            addTopTweetsToDB(data)
            
            data = await getTopComments(each.trim());
            addTopCommentsToDB(data);
        }
    } catch (error) {
        console.error('Failed to Run CRON', error)
    }

})

cron.schedule('0 0 22 * * *', async () => {
    try {
        const topics = await getTopTopics();
        console.log(topics);
        for(let each of topics.split(",")) {
            let data = await getNewsArticles(each.trim());
            addNewsArticlesToDB(data)
        
            data = await streamConnect(each.trim());
            addTopTweetsToDB(data)
            
            data = await getTopComments(each.trim());
            addTopCommentsToDB(data);
        }
    } catch (error) {
        console.error('Failed to Run CRON', error)
    }

})