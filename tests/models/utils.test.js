const rewire = require('rewire')
const utils = rewire('../../models/utils')

describe('validateInput', () => {

    const validators = utils.__get__('validators')

    const keys = [
        'key',
        'api',
        'code',
        'apiToken',
        'token',
        'playlists',
        'channels'
    ]

    it('validators', () => {
        expect(Object.keys(validators)).toEqual(keys)
    })

    it('validates proper (good input)', () => {
        let valid = utils.validate({
            key: 'string',
            api: 'reddit',
            code: 'string',
            apiToken: 'string',
            token: 'string',
            playlists: [],
            channels: []
        })
        expect(valid).toBe(true)
        valid = utils.validate({
            key: 'string',
            api: 'youtube',
            code: 'string',
            apiToken: 'string',
            token: 'string',
            playlists: [],
            channels: []
        })
        expect(valid).toBe(true)
    })

    it('validates proper (bad input)', () => {
        let valid = utils.validate({
            key: 'string',
            api: 'aku ankka',       //<---
            code: 'string',
            apiToken: 'string',
            token: 'string',
            playlists: [],
            channels: []
        })
        expect(valid).toBe(false)
        valid = utils.validate({
            key: {},
            api: 'reddit',
            code: 'string',
            apiToken: 'string',
            token: 'string',
            playlists: [],
            channels: []
        })
        expect(valid).toBe(false)
        valid = utils.validate({
            key: 'string',
            api: 'reddit',
            code: 2,
            apiToken: 'string',
            token: 'string',
            playlists: [],
            channels: []
        })
        expect(valid).toBe(false)
        valid = utils.validate({
            key: 'string',
            api: 'reddit',
            code: 'string',
            apiToken: [],
            token: 'string',
            playlists: [],
            channels: []
        })
        expect(valid).toBe(false)
        valid = utils.validate({
            key: 'string',
            api: 'reddit',
            code: 'string',
            apiToken: 'string',
            token: 67,
            playlists: [],
            channels: []
        })
        expect(valid).toBe(false)
        valid = utils.validate({
            key: 'string',
            api: 'reddit',
            code: 'string',
            apiToken: 'string',
            token: 'string',
            playlists: 'string',
            channels: []
        })
        expect(valid).toBe(false)
        valid = utils.validate({
            key: 'string',
            api: 'reddit',
            code: 'string',
            apiToken: 'string',
            token: 'string',
            playlists: [],
            channels: {}
        })
        expect(valid).toBe(false)
    })
}) 
