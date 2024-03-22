const { newsAPIKey, newsAPIURL } = require("../config/config")

const axios = require('axios');
const moment = require("moment/moment");
const client = axios.create()
var DB = require("../mongoDB/database").getDatabase

const getNewsArticles = (q) => {
    return new Promise((resolve, reject) => {
        client.get(newsAPIURL, {
            params: {
                q,
                from: moment().format('YYYY-MM-DD'),
                sortBy: 'publishedAt',
                apiKey: newsAPIKey,
                language: 'en'
            }
        }).then((response) => {
            const articles = (response?.data?.articles || []).map(ele => { return { ...ele, query: q } })
            resolve(articles)
        })
    })
}

const addNewsArticlesToDB = async (docs, res) => {
    try {
        let database = DB();
        if(docs && docs.length) {
            const response = await database.collection("newsAPI").insertMany(docs)
            if(res) {
                res.send(response)
            }
        }
    } catch(err) {
        console.error(err)
        if(res) {
            res.send(response)
        }
    }
}


module.exports = {
    getNewsArticles,
    addNewsArticlesToDB
}