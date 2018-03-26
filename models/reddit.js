const axios = require('axios')

exports.getContent = async (token) => {
    try {
        const res = await axios({
            url: 'https://oauth.reddit.com/best',
            headers: {
                'User-Agent': process.env.REDDIT_USER_AGENT,
                'Authorization': "bearer " + token
            }
        })
        return res.data.data.children
    } catch (exception) {
        console.log('unauthorized')
    }
}