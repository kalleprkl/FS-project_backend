require('dotenv').config()
const nock = require('nock')
const reddit = require('../../models/reddit')
const { nockHelper, nockBadRequest } = require('../helpers')

describe('getContent', () => {

    const path = '/best'
    const reply = {
        data: {
            children: ['1', '2']
        }
    }
    const token = '<api_token>'

    it('works when token is a string', async () => {
        nockHelper.reddit(token, path, reply)
        const response = await reddit.getContent(token)
        expect(response).toEqual(['1', '2'])
    })

    it('doesnt when not', async () => {
        const response1 = await reddit.getContent([])
        expect(response1).toBeFalsy()
        const response2 = await reddit.getContent()
        expect(response2).toBeFalsy()
    })

    it('handles 500', async () => {
        nockBadRequest.reddit('https://oauth.reddit.com', path)
        const response = await reddit.getContent('<bad_token>')
        expect(response).toBeFalsy()
    })
})
