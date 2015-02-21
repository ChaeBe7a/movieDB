'use strict';

var getMovies= function( token, query, start, count, cb ) {
    return cb(null, ['movie1', 'movie2']);
}


exports.getMovies= getMovies;
