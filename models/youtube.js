const axios = require('axios')

exports.get = async (token) => {
    try {
        const res = await axios({
            url: 'https://www.googleapis.com/youtube/v3/subscriptions/?mine=true&part=snippet%2CcontentDetails',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const channels = res.data.items.map(item => item.snippet.resourceId.channelId)
        const channelPlaylists = await Promise.all(channels.map(async channel => {
            //playlists of a channel
            const res = await axios({
                url: `https://www.googleapis.com/youtube/v3/playlists?maxResults=25&channelId=${channel}&part=snippet%2CcontentDetails`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const ids = res.data.items.map(item => item.id)
            return ids
        }))
        const playlists = []
        channelPlaylists.map(cpl => cpl.map(pl => playlists.push(pl)))
        const videos = await Promise.all(playlists.map(async playlist => {
            const res = await axios({
                url: `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlist}&maxResults=1&part=snippet%2CcontentDetails`,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const videoIds = []
            res.data.items.map(item => videoIds.push(item.snippet.resourceId.videoId))
            return res.data.items[0].snippet.resourceId.videoId
        }))
        return videos
    } catch (error) {
        console.log('error with api')
    }
}