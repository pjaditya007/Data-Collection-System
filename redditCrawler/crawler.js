const cheerio = require("cheerio");
var DB = require("../mongoDB/database").getDatabase
const puppeteer = require('puppeteer');

const getTopComments = (q = '') => {
    return new Promise(async (resolve, reject) => {

        try {
            const browser = await puppeteer.launch({ headless: true });

            const page = await browser.newPage();

            await page.goto(`https://www.reddit.com/search/?q=${q}&t=day`, {waitUntil: 'domcontentloaded'});
            
            const pageHTML = await page.content();
            // initializing cheerio on the current webpage 
            let $ = cheerio.load(pageHTML);

            let posts =  $('[data-testid="post-container"]') || new NodeList();
           
            const postIds = Array.from(posts).map((ele) => (ele?.attribs?.id || '_').split('_')[1])
            let commentTexts = [];
            for(id of postIds) {
                await page.goto(`https://www.reddit.com/comments/${id}?sort=top`, {waitUntil: 'domcontentloaded'});
                await page.setViewport({
                    width: 1200,
                    height: 800
                });
            
                await autoScroll(page);
                const commentPageHTML = await page.content();

                $ = cheerio.load(commentPageHTML);
                //console.log(commentPageHTML.data);
                let comments =  $('[data-testid="comment"]') || new NodeList();
                let text = '', user = '';
                let timestamps = $('[data-testid="comment_timestamp"]') || new NodeList();
                timestamps = Array.from(timestamps);
                Array.from(comments).forEach((ele, i) => { 
                    try {
                        text = $(ele)?.parent()?.text();
                        user = text.substring(7, text.indexOf(' ·'))
                    } catch(err) {
                        user = 'Unknown';
                    }
                    commentTexts.push({ 
                    query: q,
                    commentTimeStamp: $(timestamps[i]).text(),
                    user,
                    comment: $(ele).text() 
                }) 
                }
                )
            }
            await browser.close();
            resolve(commentTexts)
        }
        catch (err) {
            console.error(err)
            reject(err)
        }

    })
}

const addTopCommentsToDB = async (docs, res) => {
    try {
        let database = DB();
        if(docs && docs.length) {
            const response = await database.collection("reddit").insertMany(docs)
            if(res) {
                res.send(response)
            }
        }
    } catch (error) {
        console.log(error)
    }
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

module.exports = {
    getTopComments,
    addTopCommentsToDB
}


