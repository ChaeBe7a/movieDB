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

var MovieList= React.createClass({
    render: function() {
        return (
            <div>
                {
                    this.props.items.map(function( movie ) {
                        return (
                            <div key={ movie._id }>{ movie.name }</div>
                        );
                    })
                }
            </div>
        );
    },
});

var InfiniteMovies= React.createClass({
    getInitialState: function() {
        return {
            items: [],
            hasMore: true,
            lastQuery: null,
            token: null,
        }
    },

    loadMore: function( page ) {
        var token= this.state.token;
        if ( !Tools.equals(this.props.query, this.state.lastQuery) ) {
            token= null;
        }

        var query= this.props.query;

        api.getMovies(token, query, function( data ) {
            this.setState(Tools.clone(this.state, { lastQuery: query, token: data.token, items: this.state.items.concat(data.movies), hasMore: data.hasMore }));
        }.bind(this));
    },

    render: function() {
        return (
            <div>
                <InfiniteScroll loader={ <div>Loading...</div> } loadMore={ this.loadMore } hasMore={ this.state.hasMore }>
                    <MovieList items={ this.state.items } />
                </InfiniteScroll>
            </div>
        );
    },
});

var routes = (
    <Route name="app" path="/" handler={InfiniteMovies}>
        <DefaultRoute name="query" handler={InfiniteMovies} />
    </Route>
);

Router.run(routes, function ( Handler ) {
    React.render(<Handler />, document.body);
});

