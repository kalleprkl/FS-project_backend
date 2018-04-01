const axios = require('axios')
const { validateInput } = require('./utils')

exports.getContent = async (token) => {
    if (validateInput({ token })) {
        try {
            const channels = await getMyChannels(token)
            const playlists = await getChannelPlaylists(token, channels)
            const videos = await getPlaylistVideos(token, playlists)
            return videos
        } catch (error) {
            console.log('api get error')
            return ''
        }
    }
    return ''
}

const baseUrl = (scope, mine, maxResults, ) => {

}



const getMyChannels = async (token) => {
    if (validateInput({ token })) {
        try {
            const response = await axios({
                url: 'https://www.googleapis.com/youtube/v3/subscriptions?mine=true&part=snippet%2CcontentDetails',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const channels = response.data.items.map(item => item.snippet.resourceId.channelId)
            return channels
        } catch (error) {
            console.log('api get error')
            return ''
        }
    }
    return ''
}

const address = {
    baseUrl: 'https://www.googleapis.com/youtube/v3',

}

const getChannelPlaylists = async (token, channels) => {
    if (validateInput({ token, channels })) {
        try {
            let playlists = []
            const channelPlaylists = await Promise.all(channels.map(async channel => {
                const res = await axios({
                    url: `https://www.googleapis.com/youtube/v3/playlists?channelId=${channel}&maxResults=25&part=snippet%2CcontentDetails`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const ids = res.data.items.map(item => item.id)
                return ids
            }))
            channelPlaylists.map(cpl => cpl.map(pl => playlists.push(pl)))
            return playlists
        } catch (error) {
            console.log('api get error')
            return ''
        }
    }
    return ''
}



const getPlaylistVideos = async (token, playlists) => {
    if (validateInput({ token, playlists })) {
        try {
            const videos = await Promise.all(playlists.map(async playlist => {
                const res = await axios({
                    url: `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlist}&maxResults=1&part=snippet%2CcontentDetails`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                return res.data.items[0].snippet.resourceId.videoId
            }))
            return videos
        } catch (error) {
            console.log('api get error')
            return ''
        }
    }
    return ''
}

/* const validateInput = (input) => {
    if (input) {
        const inputKeys = Object.keys(input)
        if (Array.isArray(inputKeys) && inputKeys.length > 0) {
            let valid = true
            for (let i = 0; i < inputKeys.length; i++) {
                const key = inputKeys[i]
                const validator = validators[key]
                if (!validator || !validator(input[key])) {
                    return false
                }
            }
            return true
        }
        return false
    }
    return false
} */

/* const validators = {
    token: (token) => {
        if (typeof token === 'string') {
            return true
        }
        return false
    },
    playlists: (playlists) => {
        if (Array.isArray(playlists)) {
            return true
        }
        return false
    },
    channels: (channels) => {
        if (Array.isArray(channels)) {
            return true
        }
        return false
    }
} */

