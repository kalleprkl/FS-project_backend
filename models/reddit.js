const axios = require('axios')
axios.defaults.adapter = require('axios/lib/adapters/http') 
const { validateInput } = require('./utils')

exports.getContent = async (token) => {
    console.log('MODEL', token)
    
    if (validateInput({ token })) {
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
            return ''
        }
    }
    return ''
}