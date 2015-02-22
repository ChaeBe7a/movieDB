/** @jsx React.DOM */

'use strict';

var clone= function() {
    var result= {};
    for ( var i in arguments ) {
        if ( typeof arguments[i] !== 'object' ) continue;

        for ( var prop in arguments[i] ) {
            result[prop]= arguments[i][prop];
        }
    }
    return result;
};

var equals= function( o1, o2 ) {
    if ( o1 === o2 ) return true;

    if ( typeof o1 !== 'object' || typeof o2 !== 'object' ) return false;

    if ( !o1 || !o2 ) return false;

    if ( Object.keys(o1).length !== Object.keys(o2).length ) return false;

    for ( var i in o1 ) {
        if ( !( i in o2 ) ) return false;

        if ( typeof o1[i] !== typeof o2[i] ) return false;

        if ( typeof o1[i] === 'object' ) {
            if ( !equals(o1[i], o2[i]) ) return false;
            continue;
        }
        if ( o1[i] !== o2[i] ) return false;
    }
    return true;
};

exports.clone= clone;
exports.equals= equals;
