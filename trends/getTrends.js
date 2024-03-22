const axios = require("axios");
const cheerio = require("cheerio");

const getTopTopics = () => {
    return new Promise(async (resolve, reject) => {

        try {

            // retrieving the HTML content from paginationURL 
            const pageHTML = await axios.get('https://trends24.in/united-states/');

            // initializing cheerio on the current webpage 
            const $ = cheerio.load(pageHTML.data);

            let trendingData =  $('#container-2d > p').text() || '';
           
            trendingData = trendingData.slice(
                trendingData.indexOf('are') + 3,
                trendingData.indexOf('.  Tweet'),
              ).trim();

            // logging the crawling results 
            console.log(trendingData);

            resolve(trendingData)
        }
        catch (err) {
            reject(err)
        }

        // use productURLs for scraping purposes... 
    })
}

module.exports = {
    getTopTopics
}

