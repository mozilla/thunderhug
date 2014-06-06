'use strict';

// now for the app
var express = require( 'express' );
var morgan = require( 'morgan' );

var shared = require( './shared' );
var env = shared.env;
var debug = shared.debug;
var redisClient = shared.redisClient;

// job scheduler
require( './bin' );

// setup server
var app = express();

// health check
var healthcheck = {
  version: require('./package').version,
  http: 'okay'
};

// some logging
if( env.get( 'debug' ) || env.get( 'DEBUG' ) ) {
  app.use( morgan( 'dev' ) );
}

app.get( [ '/', '/healthcheck' ], function( request, response ) {
  response.json( healthcheck );
});

app.get( '/all', function( request, response ) {
  redisClient.get( 'thunderhug:megazord', function( error, data ) {
    if( error ) {
      response.status( 500 ).json({
        errors: [{
          message: 'unable to contact the database at this time',
          code: 500
        }]
      });
      console.log( error );
      return;
    }

    if( data === null ) {
      response.status( 500 ).json({
        errors: [{
          message: 'unable to get proposals at this time',
          code: 500
        }]
      });
      console.error( 'unable to get data for the megazord sheet' );
      return;
    }

    data = JSON.parse( data );
    var proposals = data.data;

    response.json( proposals );
  });
});

app.get( '/theme/:theme', function( request, response ) {
  // something here
  response.json( {} );
});

// launch the server
var server = app.listen( env.get( 'PORT' ) || 3000, function() {
  debug( 'Listening on port %d', server.address().port );
});
