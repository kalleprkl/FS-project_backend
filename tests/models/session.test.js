const jwt = require('jsonwebtoken')
const rewire = require('rewire')
const nock = require('nock')
const session = rewire('../../models/session')
const utils = require('../../models/utils')
/* session.__set__('utils', utils)
utils.__set__('Session', session)
console.log(utils)
session.__set__('utils', utils)
console.log(session.__get__('utils')) */

session.__set__({
    process: {
        env: {
            SECRET: 'secret'
        }
    }
})

const activeApis = {
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

const noActiveApis = {
    '1234': {
        youtube: '',
        reddit: ''
    }
}

const keys = [
    'key',
    'setApiToken',
    'getApiToken',
    'removeApiToken',
    'hasActiveApis'
]


describe('findByKey', () => {
    it.only('returns session object if key matches', () => {
        const sessions = session.__get__('sessions')
        sessions.set(noActiveApis)
        expect(sessions.sessions).toEqual(noActiveApis)
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

    beforeEach(() => {
        session.__set__('sessions', {})
    })
    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('does nothing without parameter', () => {
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual({})
        let sessionObject = session.newSession()
        expect(sessions).toEqual({})
        expect(sessionObject).toBeFalsy()
        sessionObject = session.newSession({})
        expect(sessions).toEqual({})
        expect(sessionObject).toBeFalsy()
    })

    it('creates new session and returns session object', () => {
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual({})
        const sessionObject = session.newSession('1234')
        expect(sessions).toEqual(noActiveApis)
        expect(sessionObject.key).toBe('1234')
        expect(Object.keys(sessionObject)).toEqual(keys)
    })
})

describe('removeSession', () => {
    it('removes session', () => {
        session.__set__('sessions', noActiveApis)
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual(noActiveApis)
        session.removeSession('123')
        expect(sessions).toEqual(noActiveApis)
        session.removeSession('1234')
        expect(session.__get__('sessions')).toEqual({})
    })
})

describe('responseForExisting', () => {

    it('returns falsy with invalid parameters', () => {
        session.__set__('sessions', noActiveApis)
        let response = session.responseForExisting()
        expect(response).toBeFalsy()
        response = session.responseForExisting('Cats!')
        expect(response).toBeFalsy()
        response = session.responseForExisting('4321')
        expect(response).toBeFalsy()
    })

    beforeEach(() => {
        session.__set__('sessions', activeApis)
    })

    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('returns object with valid parameters (one active)', () => {
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

//WTF? noActiveApis out of scope or something

const stillNoActiveApis = {
    '1234': {
        youtube: '',
        reddit: ''
    }
}

describe('sessionObject', () => {

    beforeAll(() => {
        session.__set__('sessions', stillNoActiveApis)
    })
    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('does what it do', () => {
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual(stillNoActiveApis)
        const call = session.__get__('sessionObject')
        const key = '1234'
        const sessionObject = call(key)
        expect(sessionObject.key).toBe(key)
        const added = sessionObject.setApiToken('reddit', '<api_token>')
        expect(sessions[key]['reddit']).toBe('<api_token>')
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

    beforeEach(() => {
        session.__set__('sessions', stillNoActiveApis)
    })
    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('sets token', () => {
        const sessions = session.__get__('sessions')
        const setApiToken = session.__get__('setApiToken')
        const key = '1234'
        const apiToken = '<api_token>'
        expect(sessions[key]['youtube']).toBeFalsy()
        const added = setApiToken(key, 'youtube', apiToken)
        expect(added).toBe(true)
        expect(sessions[key]['youtube']).toBe(apiToken)
    })

    it('doesnt set token', () => {
        const sessions = session.__get__('sessions')
        const setApiToken = session.__get__('setApiToken')
        const key = '1234'
        const apiToken = '<api_token>'
        expect(sessions).toEqual(stillNoActiveApis)
        let added = setApiToken('1234', 'reddit', {})
        expect(added).toBe(false)
        added = setApiToken('123', 'reddit', apiToken)
        expect(added).toBe(false)
        expect(sessions).toEqual(stillNoActiveApis)
        added = setApiToken('1234', 'myspace', apiToken)
        expect(added).toBe(false)
        expect(sessions).toEqual(stillNoActiveApis)
        added = setApiToken({}, 'reddit', apiToken)
        expect(added).toBe(false)
        expect(sessions).toEqual(stillNoActiveApis)
        added = setApiToken({}, 'reddit')
        expect(added).toBe(false)
        expect(sessions).toEqual(stillNoActiveApis)
        added = setApiToken({})
        expect(added).toBe(false)
        expect(sessions).toEqual(stillNoActiveApis)
        added = setApiToken()
        expect(added).toBe(false)
        expect(sessions).toEqual(stillNoActiveApis)
    })
})

describe('getApiToken', () => {

    beforeEach(() => {
        session.__set__('sessions', {
            '1234': {
                youtube: '',
                reddit: '<api_token>'
            }
        })
    })
    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('gets token', () => {
        const getApiToken = session.__get__('getApiToken')
        const token = getApiToken('1234', 'reddit')
        expect(token).toBe('<api_token>')
    })

    it('doesnt', () => {
        const getApiToken = session.__get__('getApiToken')
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

    const content = {
        '1234': {
            youtube: '',
            reddit: '<api_token>'
        }
    }

    beforeEach(() => {
        session.__set__('sessions', content)
    })
    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('removes', () => {
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual(content)
        const removeApiToken = session.__get__('removeApiToken')
        const removed = removeApiToken('1234', 'reddit')
        expect(removed).toBe(true)
        expect(sessions['reddit']).toBeFalsy()
    })
    it('doesnt', () => {
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual(content)
        const removeApiToken = session.__get__('removeApiToken')
        let removed = removeApiToken('123', 'reddit')
        expect(removed).toBe(false)
        expect(sessions).toEqual(content)
        removed = removeApiToken('1234', 'youtube')
        expect(removed).toBe(false)
        expect(sessions).toEqual(content)
        removed = removeApiToken('1234', 'service')
        expect(removed).toBe(false)
        expect(sessions).toEqual(content)
        removed = removeApiToken('1234')
        expect(removed).toBe(false)
        expect(sessions).toEqual(content)
        removed = removeApiToken()
        expect(removed).toBe(false)
        expect(sessions).toEqual(content)
    })
})

describe('hasActiveApis', () => {
    const content = {
        '1234': {
            youtube: '',
            reddit: '<api_token>'
        },
        '5678': {
            youtube: '',
            reddit: ''
        }
    }

    beforeAll(() => {
        session.__set__('sessions', content)
    })
    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('checks correct', () => {
        const hasActiveApis = session.__get__('hasActiveApis')
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
    it('returns falsy with invalid input', () => {
        const generateAuthUrl = session.__get__('generateAuthUrl')
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
        const generateAuthUrl = session.__get__('generateAuthUrl')
        const key = '1234'
        let url = generateAuthUrl('reddit', key)
        const token =jwt.sign({ key }, 'secret')
        expect(url).toEqual(expect.stringContaining('https://www.reddit.com/api/v1/authorize?response_type=code&client_id='))
        expect(url).toEqual(expect.stringContaining(token))
    })
})

/* describe('validateInput', () => {

    const content = {
        '1234': {
            youtube: '',
            reddit: '<api_token>'
        }
    }

    beforeAll(() => {
        session.__set__('sessions', content)
    })

    it('validates proper', () => {
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual(content)
        const validateInput = session.__get__('validateInput')
        let valid = validateInput({
            key: '1234',
            api: 'reddit',
            code: '<code>',
            apiToken: '<api_token>'
        })
        expect(valid).toBe(true)
        valid = validateInput({
            key: '1234',
            api: 'reddit',
            code: '<code>',
            apiToken: {}
        })
        expect(valid).toBe(false)
        valid = validateInput({
            key: '123',
            api: 'reddit',
            code: '<code>',
            apiToken: '<api_token>'
        })
        expect(valid).toBe(false)
        valid = validateInput({
            key: '1234',
            api: '4chan',
            code: '<code>',
            apiToken: '<api_token>'
        })
        expect(valid).toBe(false)
        valid = validateInput({
            key: '1234',
            api: 'reddit',
            code: 3,
            apiToken: '<api_token>'
        })
        expect(valid).toBe(false)
        valid = validateInput({})
        expect(valid).toBe(false)
        valid = validateInput(67)
        expect(valid).toBe(false)
        valid = validateInput()
        expect(valid).toBe(false)
    })
}) */



