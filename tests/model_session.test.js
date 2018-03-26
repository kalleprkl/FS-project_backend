const rewire = require('rewire')
const session = rewire('../models/session')
const nock = require('nock')

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
    it('returns session object if key matches', () => {
        session.__set__('sessions', noActiveApis)
        expect(session.__get__('sessions')).toEqual(noActiveApis)
        let sessionObject = session.findByKey('123')
        expect(sessionObject).toBe('')
        sessionObject = session.findByKey('1234')
        expect(sessionObject.key).toBe('1234')
        expect(Object.keys(sessionObject)).toEqual(keys)
    })
})

describe('newSession', () => {

    beforeAll(() => {
        session.__set__('sessions', {})
    })
    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('does nothing without parameter', () => {
        const sessions = session.__get__('sessions')
        expect(sessions).toEqual({})
        const sessionObject = session.newSession()
        expect(sessions).toEqual({})
        expect(sessionObject).toBe('')
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
    it('removes Session', () => {
        session.__set__('sessions', noActiveApis)
        expect(session.__get__('sessions')).toEqual(noActiveApis)
        session.removeSession({ key: '123' })
        expect(session.__get__('sessions')).toEqual(noActiveApis)
        session.removeSession({ key: '1234' })
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
        response = session.responseForExisting({ key: '4321' })
        expect(response).toBeFalsy()
    })

    beforeEach(() => {
        session.__set__('sessions', activeApis)
    })

    afterAll(() => {
        session.__set__('sessions', {})
    })

    it('returns object with valid parameters (one active)', () => {
        let response = session.responseForExisting({ key: '1234' })
        const expected = [
            { api: "youtube", authUrl: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth') },
            { api: 'reddit', authUrl: '' }
        ]
        expect(response.apis).toEqual(expect.arrayContaining(expected))
    })

    it('returns object with valid parameters (both active)', () => {
        let response = session.responseForExisting({ key: '5678' })
        const expected = [
            { api: "youtube", authUrl: '' },
            { api: 'reddit', authUrl: '' }
        ]
        expect(response.apis).toEqual(expect.arrayContaining(expected))
    })

    it('returns object with valid parameters (both inactive)', () => {
        let response = session.responseForExisting({ key: '4321' })
        const expected = [
            { api: "youtube", authUrl: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth') },
            { api: 'reddit', authUrl: expect.stringContaining('https://www.reddit.com/api/v1/authorize') }
        ]
        expect(response.apis).toEqual(expect.arrayContaining(expected))
    })
})

describe('getApiToken', async () => {
    await it('returns token', async () => {
        const authServer = nock('https://www.googleapis.com')
            .post('/oauth2/v4/token')
            .reply(200, {
                access_token: '<access_token>'
            })
        const response = await session.requestApiToken('youtube', '1234')
        expect(response).toBe('<access_token>')
    })
    await it('or does nothing', async () => {
        let response = await session.requestApiToken('1234')
        expect(response).toBeFalsy()
        response = await session.requestApiToken()
        expect(response).toBeFalsy()
        const authServer = nock('https://www.googleapis.com')
            .post('/oauth2/v4/token')
            .reply(401)
        response = await session.requestApiToken({}, {})
        expect(response).toBeFalsy()
    })
})

//WTF? noActiveApis forgotten at this point

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
        const call = session.__get__('sessionObject')
        const key = '1234'
        const sessionObject = call(key)
        expect(sessionObject.key).toBe(key)
        expect(sessions).toEqual(stillNoActiveApis)
        const added = sessionObject.setApiToken('reddit', '<api_token>')
        expect(sessions[key]['reddit']).toBe('<api_token>')
        expect(added).toBe(true)
        const token = sessionObject.getApiToken('reddit')
        expect(token).toBe('<api_token>')
        let isTrue = sessionObject.hasActiveApis()
        expect(isTrue).toBe(true)
        const removed = sessionObject.removeApiToken('reddit')
        isTrue = sessionObject.hasActiveApis()
        expect(isTrue).toBe(false)
    })
})



