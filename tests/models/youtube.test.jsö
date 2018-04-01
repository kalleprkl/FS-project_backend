const nock = require('nock')
const rewire = require('rewire')
const youtube = rewire('../../models/youtube')

const nockHelper = (token, path, query, reply) => {
    nock('https://www.googleapis.com', {
        reqheaders: {
            'Authorization': `Bearer ${token}`
        }
    })
        .get(path)
        .query(query)
        .reply((uri, requestBody) => {
            return [200, reply]
        })
}

const nockBadRequest = (path, query) => {
    nock('https://www.googleapis.com')
        .get(path)
        .query(query)
        .reply(500)
}

const arrayHelper = (count, action) => {
    const array = []
    for (let i = 0; i < count; i++) {
        const item = action(i)
        array.push(item)
    }
    return array
}

const token = '<api_token>'

describe('getPlaylistVideos', () => {

    const getPlaylistVideos = youtube.__get__('getPlaylistVideos')
    const path = '/youtube/v3/playlistItems'
    const query = {
        playlistId: '1',
        maxResults: '1',
        part: 'snippet,contentDetails'
    }
    const reply = {
        items: [
            {
                snippet: {
                    resourceId: { videoId: '123' }
                }
            }
        ]
    }
    const playlists = ['1']

    it('works with proper input', async () => {
        nockHelper(token, path, query, reply)
        const videos = await getPlaylistVideos(token, playlists)
        expect(Array.isArray(videos)).toBe(true)
        expect(videos.length).toBe(1)
        expect(videos.includes('123')).toBe(true)
    })

    it('but not with bad', async () => {
        const videos1 = await getPlaylistVideos(4, playlists)
        expect(Array.isArray(videos1)).toBe(false)
        const videos2 = await getPlaylistVideos(token, {})
        expect(Array.isArray(videos2)).toBe(false)
        const videos3 = await getPlaylistVideos(token)
        expect(Array.isArray(videos3)).toBe(false)
        const videos4 = await getPlaylistVideos({})
        expect(Array.isArray(videos4)).toBe(false)
        const videos5 = await getPlaylistVideos()
        expect(Array.isArray(videos5)).toBe(false)
    })

    it('handles rejection', async () => {
        nockBadRequest(path, query)
        const videos = await getPlaylistVideos('<bad_token>', playlists)
        expect(videos).toBeFalsy()
    })
})

describe('getChannelPlaylists', () => {

    const getChannelPlaylists = youtube.__get__('getChannelPlaylists')
    const path = '/youtube/v3/playlists'
    const query = {
        channelId: '1',
        maxResults: '25',
        part: 'snippet,contentDetails'
    }
    const reply = {
        items: [
            { id: 'redlettermedia' },
            { id: 'magztv' }
        ]
    }
    const channels = ['1']

    it('works with proper input', async () => {
        nockHelper(token, path, query, reply)
        const playlists = await getChannelPlaylists(token, channels)
        expect(playlists).toEqual(expect.arrayContaining(['redlettermedia', 'magztv']))
    })

    it('but not with bad', async () => {
        const playlists1 = await getChannelPlaylists(4, channels)
        expect(playlists1).toBeFalsy()
        const playlists2 = await getChannelPlaylists(token, {})
        expect(playlists2).toBeFalsy()
        const playlists3 = await getChannelPlaylists(token)
        expect(playlists3).toBeFalsy()
        const playlists4 = await getChannelPlaylists({})
        expect(playlists4).toBeFalsy()
        const playlists5 = await getChannelPlaylists()
        expect(playlists5).toBeFalsy()
    })

    it('handles rejection', async () => {
        nockBadRequest(path, query)
        const playlists = await getChannelPlaylists('<bad_token>', channels)
        expect(playlists).toBeFalsy()
    })
})

describe('getMyChannels', () => {

    const getMyChannels = youtube.__get__('getMyChannels')
    const path = '/youtube/v3/subscriptions'
    const query = {
        mine: 'true',
        part: 'snippet,contentDetails'
    }
    const reply = {
        items: [
            {
                snippet: {
                    resourceId: {
                        channelId: '1'
                    }
                }
            }
        ]
    }

    it('works with proper input', async () => {
        nockHelper(token, path, query, reply)
        const channels = await getMyChannels(token)
        expect(channels).toEqual(expect.arrayContaining(['1']))
    })

    it('but not with bad', async () => {
        const channels1 = await getMyChannels(4)
        expect(channels1).toBeFalsy()
        const channels2 = await getMyChannels({})
        expect(channels2).toBeFalsy()
        const channels3 = await getMyChannels()
        expect(channels3).toBeFalsy()
    })

    it('handles rejection', async () => {
        nockBadRequest(path, query)
        const channels = await getMyChannels('<bad_token>')
        expect(channels).toBeFalsy()
    })
})

describe('getContent', () => {

    it('works with proper input', async () => {
        nockHelper(
            token,
            '/youtube/v3/playlistItems',
            {
                playlistId: '2',
                maxResults: '1',
                part: 'snippet,contentDetails'
            },
            {
                items: [
                    {
                        snippet: {
                            resourceId: { videoId: '3' }
                        }
                    }
                ]
            }
        )
        nockHelper(
            token,
            '/youtube/v3/playlists',
            {
                channelId: '1',
                maxResults: '25',
                part: 'snippet,contentDetails'
            },
            {
                items: [
                    { id: '2' },
                ]
            }
        )
        nockHelper(
            token,
            '/youtube/v3/subscriptions',
            {
                mine: 'true',
                part: 'snippet,contentDetails'
            },
            {
                items: [
                    {
                        snippet: {
                            resourceId: {
                                channelId: '1'
                            }
                        }
                    }
                ]
            }
        )
        const videos = await youtube.getContent(token)
        expect(videos).toEqual(expect.arrayContaining(['3']))
    })

    it('but not with bad', async () => {
        const videos1 = await youtube.getContent(4)
        expect(videos1).toBeFalsy()
        const videos2 = await youtube.getContent([])
        expect(videos2).toBeFalsy()
        const videos3 = await youtube.getContent()
        expect(videos3).toBeFalsy()
    })

    it('handles rejection', async () => {

        nockHelper(
            token,
            '/youtube/v3/playlistItems',
            {
                playlistId: '2',
                maxResults: '1',
                part: 'snippet,contentDetails'
            },
            {
                items: [
                    {
                        snippet: {
                            resourceId: { videoId: '3' }
                        }
                    }
                ]
            }
        )
        nockBadRequest(
            '/youtube/v3/playlists',
            {
                channelId: '1',
                maxResults: '25',
                part: 'snippet,contentDetails'
            }
        )
        nockHelper(
            token,
            '/youtube/v3/subscriptions',
            {
                mine: 'true',
                part: 'snippet,contentDetails'
            },
            {
                items: [
                    {
                        snippet: {
                            resourceId: {
                                channelId: '1'
                            }
                        }
                    }
                ]
            }
        )
        const videos = await youtube.getContent(token)
        expect(videos).toBeFalsy()
    })
})
