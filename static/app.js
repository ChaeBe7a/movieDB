#!/usr/bin/node

'use strict';
var restify = require('restify');

var movieApi= require('./movieApi');

var send= function( next, err, data ) {
    this.contentType = 'json';

    if ( err ) {
        this.send({ success: false, error: err });
        return next();
    }
    this.send({ success: true, data: data });
    return next();
};

var server = restify.createServer();
server.use(restify.bodyParser());

server.get(/\/static\/?.*/, restify.serveStatic({
    directory: __dirname,
    default: 'index.html',
}));

server.get(/\/?/, restify.serveStatic({
    directory: __dirname + '/static',
    default: 'index.html',
}));

server.post('movies/:token', function( req, res, next ) {
    return movieApi.getMovies(null, null, null, null, send.bind(res, next));
});


server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});