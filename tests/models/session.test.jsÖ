const jwt = require('jsonwebtoken')
const rewire = require('rewire')
const nock = require('nock')
const session = rewire('../../models/session')

session.__set__({
    process: {
        env: {
            SECRET: 'secret'
        }
    }
})

const sessions = session.__get__('sessions')

describe('sessions', () => {

    const apis = {
        youtube: '<api_token>',
        reddit: ''
    }

    it('creates new session', () => {
        expect(sessions.sessions).toEqual({})
        sessions.new('1234', apis)
        const expected = {
            '1234': apis
        }
        expect(sessions.sessions).toEqual(expected)
    })

    it('checks if given key has a session', () => {
        const has = sessions.has('1234')
        expect(has).toBe(true)
    })

    it('fetches sessions corresponding to the key', () => {
        const got = sessions.get('1234')
        expect(got).toEqual(apis)
    })

    it('removes api token', () => {
        sessions.forget('1234', 'youtube')
        const expected = {
            '1234': {
                youtube: '',
                reddit: ''
            }
        }
        expect(sessions.sessions).toEqual(expected)
    })

    it('removes session', () => {
        sessions.remove('1234')
        expect(sessions.sessions).toEqual({})
    })
})

const keys = [
    'key',
    'setApiToken',
    'getApiToken',
    'removeApiToken',
    'hasActiveApis'
]

describe('findByKey', () => {

    const content = {
        '1234': {
            youtube: '',
            reddit: ''
        }
    }

    it('returns session object if key matches', () => {
        sessions.sessions = content
        expect(sessions.sessions).toEqual(content)
        let sessionObject = session.findByKey()
        expect(sessionObject).toBeFalsy()
        sessionObject = session.findByKey('123')
        expect(sessionObject).toBeFalsy()
        sessionObject = session.findByKey('1234')
        expect(sessionObject.key).toBe('1234')
        expect(Object.keys(sessionObject)).toEqual(keys)
    })
})

describe('newSession', () => {

    it('does nothing without parameter', () => {
        sessions.sessions = {}
        expect(sessions.sessions).toEqual({})
        let sessionObject = session.newSession()
        expect(sessions.sessions).toEqual({})
        expect(sessionObject).toBeFalsy()
        sessionObject = session.newSession({})
        expect(sessions.sessions).toEqual({})
        expect(sessionObject).toBeFalsy()
    })

    it('creates new session and returns session object', () => {
        expect(sessions.sessions).toEqual({})
        const sessionObject = session.newSession('1234')
        const expected = {
            '1234': {
                youtube: '',
                reddit: ''
            }
        }
        expect(sessions.sessions).toEqual(expected)
        expect(sessionObject.key).toBe('1234')
        expect(Object.keys(sessionObject)).toEqual(keys)
    })
})

describe('removeSession', () => {

    const content = {
        '1234': {
            youtube: '',
            reddit: ''
        }
    }

    it('removes session', () => {
        sessions.sessions = content
        expect(sessions.sessions).toEqual(content)
        session.removeSession('123')
        expect(sessions.sessions).toEqual(content)
        session.removeSession('1234')
        expect(sessions.sessions).toEqual({})
    })
})

describe('responseForExisting', () => {

    const content = {
        '1234': {
            youtube: '',
            reddit: ''
        }
    }

    it('returns falsy with invalid parameters', () => {
        sessions.sessions = content
        let response = session.responseForExisting()
        expect(response).toBeFalsy()
        response = session.responseForExisting('Cats!')
        expect(response).toBeFalsy()
        response = session.responseForExisting('4321')
        expect(response).toBeFalsy()
    })

    const content2 = {
        '1234': {
            youtube: '',
            reddit: '<apiToken>'
        },
        '5678': {
            youtube: '<apiToken>',
            reddit: '<apiToken>'
        },
        '4321': {
            youtube: '',
            reddit: ''
        }
    }

    it('returns object with valid parameters (one active)', () => {
        sessions.sessions = content2
        let response = session.responseForExisting('1234')
        const expected = [
            { api: "youtube", authUrl: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth') },
            { api: 'reddit', authUrl: '' }
        ]
        expect(response.apis).toEqual(expect.arrayContaining(expected))
    })

    it('returns object with valid parameters (both active)', () => {
        let response = session.responseForExisting('5678')
        const expected = [
            { api: "youtube", authUrl: '' },
            { api: 'reddit', authUrl: '' }
        ]
        expect(response.apis).toEqual(expect.arrayContaining(expected))
    })

    it('returns object with valid parameters (both inactive)', () => {
        let response = session.responseForExisting('4321')
        const expected = [
            { api: "youtube", authUrl: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth') },
            { api: 'reddit', authUrl: expect.stringContaining('https://www.reddit.com/api/v1/authorize') }
        ]
        expect(response.apis).toEqual(expect.arrayContaining(expected))
    })
})

describe('responseForNewSession', () => {
    it('creates', () => {
        const response = session.responseForNewSession()
        const keys = Object.keys(response)
        expect(keys.length).toBe(2)
        expect(keys.includes('token')).toBe(true)
        expect(keys.includes('apis')).toBe(true)
        expect(typeof response.token === 'string').toBe(true)
        expect(Array.isArray(response.apis)).toBe(true)
        response.apis.map(api => {
            if (api.api === 'reddit') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize'))
            }
            if (api.api === 'youtube') {
                expect(api.authUrl).toEqual(expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth'))
            }
        })
    })
})

describe('requestApiToken', () => {
    it('returns token', async () => {
        const authServer = nock('https://www.googleapis.com')
            .post('/oauth2/v4/token')
            .reply(200, {
                access_token: '<access_token>'
            })
        const response = await session.requestApiToken('youtube', '1234')
        expect(response).toBe('<access_token>')
    })
    it('or does nothing', async () => {
        let response = await session.requestApiToken('1234')
        expect(response).toBeFalsy()
        response = await session.requestApiToken()
        expect(response).toBeFalsy()
        response = await session.requestApiToken('skene', '1234')
        expect(response).toBeFalsy()
        const authServer = nock('https://www.googleapis.com')
            .post('/oauth2/v4/token')
            .reply(401)
        response = await session.requestApiToken({}, {})
        expect(response).toBeFalsy()
    })
})

describe('sessionObject', () => {

    const getSessionObject = session.__get__('sessionObject')

    const content = {
        '1234': {
            youtube: '',
            reddit: ''
        }
    }

    beforeAll(() => {
        sessions.sessions = content
    })

    it('does what it do', () => {
        expect(sessions.sessions).toEqual(content)
        const key = '1234'
        const sessionObject = getSessionObject(key)
        expect(sessionObject.key).toBe(key)
        const added = sessionObject.setApiToken('reddit', '<api_token>')
        expect(sessions.sessions[key]['reddit']).toBe('<api_token>')
        expect(added).toBe(true)
        const token = sessionObject.getApiToken('reddit')
        expect(token).toBe('<api_token>')
        let has = sessionObject.hasActiveApis()
        expect(has).toBe(true)
        const removed = sessionObject.removeApiToken('reddit')
        has = sessionObject.hasActiveApis()
        expect(has).toBe(false)
    })
})

describe('setApiToken', () => {

    const setApiToken = session.__get__('setApiToken')

    const content = {
        '1234': {
            youtube: '',
            reddit: ''
        }
    }

    beforeEach(() => {
        sessions.sessions = content
    })

    it('sets token', () => {
        const key = '1234'
        const apiToken = '<api_token>'
        expect(sessions.sessions[key]['youtube']).toBeFalsy()
        const added = setApiToken(key, 'youtube', apiToken)
        const expected = {
            '1234': {
                youtube: '<api_token>',
                reddit: ''
            }
        }
        expect(sessions.sessions).toEqual(expected)
        expect(added).toBe(true)
        expect(sessions.sessions[key]['youtube']).toBe(apiToken)
    })

    it('doesnt set token', () => {
        expect(sessions.sessions).toEqual(content)
        const key = '1234'
        const apiToken = '<api_token>'
        expect(sessions.sessions).toEqual(content)
        let added = setApiToken('1234', 'reddit', {})
        expect(added).toBe(false)
        added = setApiToken('123', 'reddit', apiToken)
        expect(added).toBe(false)
        expect(sessions.sessions).toEqual(content)
        added = setApiToken('1234', 'myspace', apiToken)
        expect(added).toBe(false)
        expect(sessions.sessions).toEqual(content)
        added = setApiToken({}, 'reddit', apiToken)
        expect(added).toBe(false)
        expect(sessions.sessions).toEqual(content)
        added = setApiToken({}, 'reddit')
        expect(added).toBe(false)
        expect(sessions.sessions).toEqual(content)
        added = setApiToken({})
        expect(added).toBe(false)
        expect(sessions.sessions).toEqual(content)
        added = setApiToken()
        expect(added).toBe(false)
        expect(sessions.sessions).toEqual(content)
    })
})

describe('getApiToken', () => {

    const getApiToken = session.__get__('getApiToken')

    beforeEach(() => {
        sessions.sessions = {
            '1234': {
                youtube: '',
                reddit: '<api_token>'
            }
        }
    })

    it('gets token', () => {
        const token = getApiToken('1234', 'reddit')
        expect(token).toBe('<api_token>')
    })

    it('doesnt', () => {
        let token = getApiToken('123', 'reddit')
        expect(token).toBeFalsy()
        token = getApiToken('123', 'reddit')
        expect(token).toBeFalsy()
        token = getApiToken('1234', 'myspace')
        expect(token).toBeFalsy()
        token = getApiToken()
        expect(token).toBeFalsy()
    })
})

describe('removeApiToken', () => {

    const removeApiToken = session.__get__('removeApiToken')
    
    const content = {
        '1234': {
            youtube: '',
            reddit: '<api_token>'
        }
    }

    beforeEach(() => {
        sessions.sessions = content
    })

    it('removes', () => {
        expect(sessions.sessions).toEqual(content)
        const removed = removeApiToken('1234', 'reddit')
        expect(removed).toBe(true)
        expect(sessions.sessions['reddit']).toBeFalsy()
    })
    it('doesnt', () => {
        expect(sessions.sessions).toEqual(content)
        let removed = removeApiToken('123', 'reddit')
        expect(removed).toBe(false)
        expect(sessions.sessions).toEqual(content)
        removed = removeApiToken('1234', 'youtube')
        expect(removed).toBe(false)
        expect(sessions.sessions).toEqual(content)
        removed = removeApiToken('1234', 'service')
        expect(removed).toBe(false)
        expect(sessions.sessions).toEqual(content)
        removed = removeApiToken('1234')
        expect(removed).toBe(false)
        expect(sessions.sessions).toEqual(content)
        removed = removeApiToken()
        expect(removed).toBe(false)
        expect(sessions.sessions).toEqual(content)
    })
})

describe('hasActiveApis', () => {

    const hasActiveApis = session.__get__('hasActiveApis')

    beforeAll(() => {
        sessions.sessions = {
            '1234': {
                youtube: '',
                reddit: '<api_token>'
            },
            '5678': {
                youtube: '',
                reddit: ''
            }
        }
    })

    it('checks correct', () => {
        let isTrue = hasActiveApis('1234')
        expect(isTrue).toBe(true)
        isTrue = hasActiveApis('5678')
        expect(isTrue).toBe(false)
        isTrue = hasActiveApis('marble')
        expect(isTrue).toBe(false)
        isTrue = hasActiveApis()
        expect(isTrue).toBe(false)
    })
})

describe('generateAuthUrl', () => {

    const generateAuthUrl = session.__get__('generateAuthUrl')

    it('returns falsy with invalid input', () => {
        let url = generateAuthUrl('yahoo', '1234')
        expect(url).toBeFalsy()
        url = generateAuthUrl({}, [])
        expect(url).toBeFalsy()
        url = generateAuthUrl(2)
        expect(url).toBeFalsy()
        url = generateAuthUrl()
        expect(url).toBeFalsy()
    })

    it('returns url with proper input', () => {
        const key = '1234'
        let url = generateAuthUrl('reddit', key)
        const token = jwt.sign({ key }, 'secret')
        expect(url).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize?response_type=code&client_id='))
        expect(url).toEqual(expect.stringContaining(token))
    })
})




