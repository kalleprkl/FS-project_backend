/*const youtubeRouter = require('express').Router()
const { google } = require('googleapis')

youtubeRouter.get('/', async (request, response) => {
    var service = google.youtube('v3');
    //var parameters = removeEmptyParameters(requestData['params']);
    //parameters['auth'] = auth;
    service.playlists.list(params.params, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response);
    });
    response.json({ fuck: 'you' })
})

function playlistsListByChannelId(auth, requestData) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    parameters['auth'] = auth;
    service.playlists.list(parameters, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response);
    });
}

function playlistsListByChannelId(requestData) {
    var service = google.youtube('v3');
    var parameters = removeEmptyParameters(requestData['params']);
    //parameters['auth'] = auth;
    service.playlists.list(parameters, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response);
    });
}

function removeEmptyParameters(params) {
    for (var p in params) {
        if (!params[p] || params[p] == 'undefined') {
            delete params[p];
        }
    }
    return params;
}

const params = {
    params: {
        channelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
        maxResults: '25',
        part: 'snippet,contentDetails'
    }
}

module.exports = youtubeRouter*/