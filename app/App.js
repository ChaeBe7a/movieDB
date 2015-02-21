/** @jsx React.DOM */

'use strict';

var React = require('react');
var Router= require('react-router');

var Route= Router.Route;
var RouteHandler= Router.RouteHandler;

//var EndlessList= require('./EndlessList').EndlessList;
var InfiniteScroll = require('react-infinite-scroll')(React);

var api= require('./api');
var Tools= require('./tools');

var DefaultRoute= Router.DefaultRoute;

var Movies= React.createClass({
    getInitialState: function() {
        return {
            items: ['movie1', 'movie2'],
        }
    },

    render: function() {
        return (
            <div>
                { this.state.items.map(function( name ) {
                    return ( <div>{ name }</div> )
                }) }
            </div>
        );
    },
});

var routes = (
    <Route name="app" path="/" handler={Movies}>
        <DefaultRoute name="query" handler={Movies} />
    </Route>
);

Router.run(routes, function ( Handler ) {
    React.render(<Handler />, document.body);
});

