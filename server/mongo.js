'use strict';

var MongoClient= require('mongodb').MongoClient;

var connections= {};

/*
var lazy= function( fn, promises ) {
    var getFn= function( cb ) {
        return fn(function( err, data ) {
            getFn= function() { return cb(err, data) };
            return cb(err, data);
        });
    };

    var result= {};

    Object.keys(promises).forEach(function( name ) {
        var promise= promises[name];

        result[name]= function() {
            var args= Array.prototype.slice.call(arguments);
            return getFn(function( err, data ) {
                if ( err ) return args.pop()(err);

                if ( typeof promise === 'function' ) {
                    args.unshift(data);
                    return promise.apply(this, args);
                }
                return data[name].apply(this, args);
            });
        };
    });
    return result;
};
*/


var getCollection= function( connection, collection, cb ) {
    if ( connection.db ) return cb(null, connection.db.collection(collection));

    return MongoClient.connect(connection.url, function( err, db ) {
        if ( err ) return cb(err);

        connection.db= db;
        return cb(null, db.collection(collection));
    });
};

var connect= function( url ) {
    if ( url in connections ) return connections[url].coll;

    var connection= {
        url: url,
    };
    connection.coll= getCollection.bind(null, connection);

    connections[url]= connection;
    return connection.coll;
};







exports.connect= connect;
