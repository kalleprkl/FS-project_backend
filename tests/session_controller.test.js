const nock = require('nock')
const jwt = require('jsonwebtoken')
const rewire = require('rewire')
const request = require('supertest')
const { app, server } = require('../index')
const session = rewire('../models/session')
const router = rewire('../controllers/session')
require('dotenv').config()

afterAll(() => {
    server.close()
})

describe('/auth', () => {

    it('response for valid but unknown token contains authUrl for each api', done => {
        const token = jwt.sign({ key: '1234' }, process.env.SECRET)
        request(app)
            .get('/auth')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end((err, res) => {
                const apis = res.body.apis
                const resToken = res.body.token
                expect(apis.length).toBe(2)
                expect(typeof resToken === 'string').toBe(true)
                expect(Object.keys(apis).includes('reddit'))
                expect(Object.keys(apis).includes('youtube'))
                apis.map(api => {
                    if (api.api === 'reddit') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                    }
                    if (api.api === 'youtube') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                    }
                })
                done()
            })
    })

    it('response for invalid token contains authUrl for each api', done => {
        request(app)
            .get('/auth')
            .set('Authorization', `Bearer youknowwhoiam`)
            .expect(200)
            .end((err, res) => {
                const apis = res.body.apis
                const resToken = res.body.token
                expect(apis.length).toBe(2)
                expect(typeof resToken === 'string').toBe(true)
                expect(Object.keys(apis).includes('reddit'))
                expect(Object.keys(apis).includes('youtube'))
                apis.map(api => {
                    if (api.api === 'reddit') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                    }
                    if (api.api === 'youtube') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                    }
                })
                done()
            })
    })

    it('response for missing token contains authUrl for each api', done => {
        request(app)
            .get('/auth')
            .set('Authorization', `Bearer `)
            .expect(200)
            .end((err, res) => {
                const apis = res.body.apis
                const resToken = res.body.token
                expect(apis.length).toBe(2)
                expect(typeof resToken === 'string').toBe(true)
                expect(Object.keys(apis).includes('reddit'))
                expect(Object.keys(apis).includes('youtube'))
                apis.map(api => {
                    if (api.api === 'reddit') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                    }
                    if (api.api === 'youtube') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                    }
                })
                done()
            })
    })

    it('response for missing authorization header contains authUrl for each api', done => {
        request(app)
            .get('/auth')
            .expect(200)
            .end((err, res) => {
                const apis = res.body.apis
                const resToken = res.body.token
                expect(apis.length).toBe(2)
                expect(typeof resToken === 'string').toBe(true)
                expect(Object.keys(apis).includes('reddit'))
                expect(Object.keys(apis).includes('youtube'))
                apis.map(api => {
                    if (api.api === 'reddit') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                    }
                    if (api.api === 'youtube') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                    }
                })
                done()
            })
    })
})

describe('/auth/:api', () => {
    it('doesnt throw errors with nock because i didnt match body and do the other thing', async () => {
        const token = jwt.sign({ key: '1234' }, process.env.SECRET)
        const body = {
            "method": "POST"
            , "headers": {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            "url": "https://www.googleapis.com/oauth2/v4/token",
            "auth": {
                "username": process.env.YOUTUBE_CLIENT_ID,
                "password": process.env.YOUTUBE_CLIENT_SECRET
            },
            "data": "grant_type=authorization_code&code=marabou&redirect_uri=http://localhost:5000/auth/youtube"
        }


        nock('https://www.googleapis.com')
            //.log(console.log)
            .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
            .post('/oauth2/v4/token', "grant_type=authorization_code&code=marabou&redirect_uri=http://localhost:5000/auth/youtube")
            .reply(200, {
                access_token: '<access_token>'
            })

        const response = await request(app)
            .get(`/auth/youtube?code=marabou&state=${token}`)

        expect(response.status).toBe(302)
    })
})

describe('/auth revisited, the key inside the token should now be known', () => {
    it('response for valid and known token contains authUrl for reddit and no token,', async () => {
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

describe('/auth/logout/:api', () => {

    it('logs out', async () => {
        const token = jwt.sign({ key: '1234' }, process.env.SECRET)
        response = await request(app)
            .get('/auth/logout/youtube')
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
        console.log(response.status)
    })

    it('response for valid but unknown..', done => {
        const token = jwt.sign({ key: '1234' }, process.env.SECRET)
        request(app)
            .get('/auth')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .end((err, res) => {
                const apis = res.body.apis
                const resToken = res.body.token
                expect(apis.length).toBe(2)
                expect(typeof resToken === 'string').toBe(true)
                expect(Object.keys(apis).includes('reddit'))
                expect(Object.keys(apis).includes('youtube'))
                apis.map(api => {
                    if (api.api === 'reddit') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
                    }
                    if (api.api === 'youtube') {
                        expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
                    }
                })
                done()
            })
    })

    it('doesnt log out if in doesnt know who to log out', async () => {
        response = await request(app)
            .get('/auth/logout/youtube')
            .set('Authorization', `Bearer shits/'ngigles`)
        expect(response.status).toBe(400)
    })
})