'use strict';

var cbWrapper= function( cb ) {
    return function( data ) {
        if ( data.success ) return cb(data.data);
    };
};

var getMovies= function( token, query, cb ) {
    $.post('/movies/' + ( token || '' ), query, cbWrapper(cb));
};

module.exports= {
    getMovies: getMovies,
};
