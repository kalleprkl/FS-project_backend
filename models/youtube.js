const axios = require('axios')

exports.getContent = async (token) => {
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

const getMyChannels = async (token) => {
    let channels = []
    try {
        const response = await axios({
            url: 'https://www.googleapis.com/youtube/v3/subscriptions/?mine=true&part=snippet%2CcontentDetails',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        channels = response.data.items.map(item => item.snippet.resourceId.channelId)
    } catch (error) {
        console.log('api get error')
    }
    return channels
}

const getChannelPlaylists = async (token, channels) => {
    let playlists = []
    try {
        const channelPlaylists = await Promise.all(channels.map(async channel => {
            const res = await axios({
                url: `https://www.googleapis.com/youtube/v3/playlists?maxResults=25&channelId=${channel}&part=snippet%2CcontentDetails`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const ids = res.data.items.map(item => item.id)
            return ids
        }))
        channelPlaylists.map(cpl => cpl.map(pl => playlists.push(pl)))
    } catch (error) {
        console.log('api get error')
    }
    return playlists
}

const getPlaylistVideos = async (token, playlists) => {
    let videos = []
    try {
        videos = await Promise.all(playlists.map(async playlist => {
            const res = await axios({
                url: `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlist}&maxResults=1&part=snippet%2CcontentDetails`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.items[0].snippet.resourceId.videoId
        }))
    } catch (error) {
        console.log('api get error')
    }
    return videos
}

