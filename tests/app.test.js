require('dotenv').config()
const nock = require('nock')
const jwt = require('jsonwebtoken')
const request = require('supertest')
const { app, server } = require('../index')
const { nockHelper, nockBadRequest } = require('./helpers')

afterAll(() => {
    server.close()
})

describe('GET /auth', () => {

    it('response for valid but unknown token contains authUrl for each api', async () => {
        const token = jwt.sign({ key: '1234' }, process.env.SECRET)
        const response = await request(app)
            .get('/auth')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        expect(response.body.token).toBeTruthy()
        response.body.apis.map(api => {
            if (api.api === 'reddit') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
            }
            if (api.api === 'youtube') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
            }
        })
    })

    it('response for invalid token contains authUrl for each api', async () => {
        const token = jwt.sign({ key: '1234' }, 'sekret')
        const response = await request(app)
            .get('/auth')
            .set('Authorization', `Bearer klendathu`)
            .expect(200)
        expect(response.body.token).toBeTruthy()
        response.body.apis.map(api => {
            if (api.api === 'reddit') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
            }
            if (api.api === 'youtube') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
            }
        })
    })

    it('response for missing token contains authUrl for each api', async () => {
        const response = await request(app)
            .get('/auth')
            .expect(200)
        expect(response.body.token).toBeTruthy()
        response.body.apis.map(api => {
            if (api.api === 'reddit') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
            }
            if (api.api === 'youtube') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
            }
        })
    })
})

describe('GET /auth/:api', () => {

    describe('youtube auth uri', () => {

        it('youtube uri: redirects, exists i guess', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)

            nock('https://www.googleapis.com')
                //.log(console.log)
                .defaultReplyHeaders({ 'access-control-allow-origin': '*' })    //?
                .post('/oauth2/v4/token', "grant_type=authorization_code&code=marabou&redirect_uri=http://localhost:5000/auth/youtube")
                .reply(200, {
                    access_token: '<access_token>'
                })

            const response = await request(app)
                .get(`/auth/youtube?code=marabou&state=${token}`)

            expect(response.status).toBe(302)
        })

        it('GET /auth finds youtube api active', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)
            const response = await request(app)
                .get('/auth')
                .set('Authorization', `Bearer ${token}`)
            expect(response.body.apis).toBeTruthy()
            expect(response.body.token).toBeFalsy()
            response.body.apis.map(api => {
                if (api.api === 'reddit') {
                    expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                }
                if (api.api === 'youtube') {
                    expect(api.authUrl).toBeFalsy()
                }
            })
        })
    })

    describe('reddit auth uri', () => {

        it('reddit uri: redirects, exists i guess', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)

            nock('https://www.reddit.com', {
                reqheaders: {
                    'User-Agent': process.env.REDDIT_USER_AGENT,
                }
            })
                //.defaultReplyHeaders({ 'access-control-allow-origin': '*' })    //?
                .post('/api/v1/access_token', `grant_type=authorization_code&code=caribou&redirect_uri=${process.env.REDDIT_REDIRECT_URI}`)
                .reply(200, {
                    access_token: '<access_token>'
                })

            const response = await request(app)
                .get(`/auth/reddit?code=caribou&state=${token}`)

            expect(response.status).toBe(302)
        })

        it('GET /auth finds both apis active', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)
            const response = await request(app)
                .get('/auth')
                .set('Authorization', `Bearer ${token}`)
            expect(response.body.apis).toBeTruthy()
            expect(response.body.token).toBeFalsy()
            response.body.apis.map(api => {
                if (api.api === 'reddit') {
                    expect(api.authUrl).toBeFalsy()
                }
                if (api.api === 'youtube') {
                    expect(api.authUrl).toBeFalsy()
                }
            })
        })
    })


})

describe('GET /data/:api', () => {

    describe('youtube data', () => {

        nockHelper.youtube(
            '<access_token>',
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
        nockHelper.youtube(
            '<access_token>',
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
        nockHelper.youtube(
            '<access_token>',
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

        it('youtube: authorized gets data', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)
            const response = await request(app)
                .get('/data/youtube')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
            expect(response.body).toEqual(['3'])
        })

        it('youtube: unauthorized doesnt 1', async () => {
            const token = jwt.sign({ key: '1234' }, 'kermakakku')
            const response1 = await request(app)
                .get('/data/youtube')
                .set('Authorization', `Bearer ${token}`)
                .expect(401)
        })

        it('youtube: unauthorized doesnt 2', async () => {
            const token = jwt.sign({ key: 'ABCD' }, process.env.SECRET)
            const response1 = await request(app)
                .get('/data/youtube')
                .set('Authorization', `Bearer ${token}`)
                .expect(401)
        })
    })

    describe('reddit data', () => {

        const path = '/best'
        const reply = {
            data: {
                children: ['1', '2']
            }
        }
        const token = jwt.sign({ key: '1234' }, process.env.SECRET)

        it('reddit: authorized gets data', async () => {
            nockHelper.reddit(token, path, reply)
            const response = await request(app)
                .get('/data/reddit')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
            expect(response.body).toEqual(['1', '2'])
        })

        it('reddit: unauthorized doesnt 1', async () => {
            const token = jwt.sign({ key: '1234' }, 'kermakakku')
            const response1 = await request(app)
                .get('/data/reddit')
                .set('Authorization', `Bearer ${token}`)
                .expect(401)
        })

        it('reddit: unauthorized doesnt 2', async () => {
            const token = jwt.sign({ key: 'ABCD' }, process.env.SECRET)
            const response1 = await request(app)
                .get('/data/reddit')
                .set('Authorization', `Bearer ${token}`)
                .expect(401)
        })
    })
})

describe('GET /auth/logout/:api', () => {

    describe('youtube logoout', () => {

        it('youtube: removes api access token from sessions', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)
            response = await request(app)
                .get('/auth/logout/youtube')
                .set('Authorization', `Bearer ${token}`)

            expect(response.status).toBe(200)
            expect(response.body.apis).toBeTruthy()
            expect(response.body.token).toBeFalsy()
            response.body.apis.map(api => {
                if (api.api === 'reddit') {
                    expect(api.authUrl).toBeFalsy()
                }
                if (api.api === 'youtube') {
                    expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                }
            })
        })

        it('youtube: GET /auth finds no active session', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)
            const response = await request(app)
                .get('/auth')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
            expect(response.body.token).toBeFalsy()
            response.body.apis.map(api => {
                if (api.api === 'reddit') {
                    expect(api.authUrl).toBeFalsy()
                }
                if (api.api === 'youtube') {
                    expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                }
            })
        })
    })

    describe('reddit logout', () => {

        it('reddit: removes api access token from sessions', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)
            response = await request(app)
                .get('/auth/logout/reddit')
                .set('Authorization', `Bearer ${token}`)

            expect(response.status).toBe(200)
            expect(response.body.apis).toBeTruthy()
            expect(response.body.token).toBeTruthy()
            response.body.apis.map(api => {
                if (api.api === 'reddit') {
                    expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                }
                if (api.api === 'youtube') {
                    expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                }
            })
        })

        it('reddit: GET /auth finds no active sessions', async () => {
            const token = jwt.sign({ key: '1234' }, process.env.SECRET)
            const response = await request(app)
                .get('/auth')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
            expect(response.body.token).toBeTruthy()
            response.body.apis.map(api => {
                if (api.api === 'reddit') {
                    expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                }
                if (api.api === 'youtube') {
                    expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                }
            })
        })
    })


    it('doesnt log out if it doesnt know who to log out', async () => {
        response = await request(app)
            .get('/auth/logout/youtube')
            .set('Authorization', `Bearer shits/'ngigles`)
        expect(response.status).toBe(400)
    })
})