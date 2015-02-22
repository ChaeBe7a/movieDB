'use strict';

var db= require('./mongo').connect('mongodb://localhost:27017/movieDB');
var uuid= require('node-uuid');


var getMovieToken= (function() {
    var tokens= {};

    return function( token ) {
        if ( !token ) token= uuid.v1();

        if ( !( token in tokens ) ) {
            tokens[token]= {
                data: {
                    token: token,
                },
            };
        }
        else {
            clearTimeout(tokens[token].timer);
        }
        tokens[token].timer= setTimeout(function() { delete tokens[token] }, 3600);
        return tokens[token].data;
    };
})();

var getMovies= function( token, query, cb ) {
    return db('Movies', function( err, coll ) {
        if ( err ) return cb(err);

        var tokenData= getMovieToken(token);

        return coll.find().skip(tokenData.skip || 0).limit(10).toArray(function( err, movies ) {
            if ( err ) return cb(err);

            tokenData.skip= ( tokenData.skip || 0 ) + 10;

            return cb(null, {
                token: token || tokenData.token,
                movies: movies,
                hasMore: movies.length === 10,
            });
        });
    });


}


exports.getMovies= getMovies;
