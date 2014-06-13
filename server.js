'use strict';

// now for the app
var express = require( 'express' );
var morgan = require( 'morgan' );
var moment = require( 'moment' );
var json2csv = require( 'json2csv' );

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

// return publicly safe proposals from full dataset
function cleanProposals( proposals ) {
  /**
   * return twitter handle ONLY if allowed by user
   */
  function twitter( handle, proposal ) {
    if( /twitter/ig.test( proposal.privacy ) ) {
      return '';
    }

    return handle;
  }

  /**
   * return organization ONLY if allowed by user
   */
  function organization( org, proposal ) {
    if( /organization/ig.test( proposal.privacy ) ) {
      return '';
    }

    return org;
  }

  var safeProposals = [];
  proposals.forEach( function( proposal ) {
    /*
      Deal w/ session data
     */
    var safeProposal = {
      title: proposal.title,
      theme: proposal.theme,
      organization: organization( proposal.organization, proposal ),
      goals: proposal.goals,
      agneda: proposal.agenda,
      scale: proposal.scale,
      outcomes: proposal.outcomes
    };

    // deal w/ timestamp
    safeProposal.timestamp = moment( proposal.timestamp ).toISOString();

    /*
      deal w/ facilitators
     */
    safeProposal.facilitators = [];

    // deal w/ first facilitator (required)
    safeProposal.facilitators.push({
      name: proposal.firstname + ' ' + proposal.surname,
      twitter: twitter( proposal.twitter, proposal )
    });

    // deal w/ additional facilitators
    var additionalFacilitators = proposal.facilitators.split( '\n' );
    additionalFacilitators.forEach( function( facilitator ) {
      var twitter = facilitator.match( /\B@[a-z0-9_-]+/i );
      if( twitter ) {
        twitter = twitter[ 0 ];
      }
      else {
        twitter = '';
      }

      facilitator = facilitator.replace( /\B@[a-z0-9_-]+/gi, '' ).trim();

      if( facilitator !== '' ) {
        safeProposal.facilitators.push({
          name: facilitator,
          twitter: twitter
        });
      }
    });

    safeProposals.push( safeProposal );
  });

  return safeProposals;
}

// deal w/ api calls
app.get( [ '/', '/healthcheck' ], function( request, response ) {
  response.jsonp( healthcheck );
});

app.get( '/all', function( request, response ) {
  // get config
  redisClient.get( 'thunderhug:meta', function( error, meta ) {
    if( error ) {
      response.status( 500 ).jsonp({
        errors: [{
          message: 'unable to contact the database at this time',
          code: 500
        }]
      });
      console.log( error );
      return;
    }

    if( meta === null ) {
      response.status( 500 ).jsonp({
        errors: [{
          message: 'unable to get config information at this time',
          code: 500
        }]
      });
      console.error( 'unable to get data for the megazord sheet' );
      return;
    }

    meta = JSON.parse( meta );

    // get megazord (all) proposals
    redisClient.get( 'thunderhug:megazord', function( error, data ) {
      if( error ) {
        response.status( 500 ).jsonp({
          errors: [{
            message: 'unable to contact the database at this time',
            code: 500
          }]
        });
        console.log( error );
        return;
      }

      if( data === null ) {
        response.status( 500 ).jsonp({
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
      var safeProposals = cleanProposals( proposals );

      response.jsonp( safeProposals );
    });
  });
});

app.get( '/:theme/:format?', function( request, response ) {
  redisClient.get( 'thunderhug:meta', function( error, meta ) {
    if( error ) {
      response.status( 500 ).jsonp({
        errors: [{
          message: 'unable to contact the database at this time',
          code: 500
        }]
      });
      console.log( error );
      return;
    }

    if( meta === null ) {
      response.status( 500 ).jsonp({
        errors: [{
          message: 'unable to get config information at this time',
          code: 500
        }]
      });
      console.error( 'unable to get data for the megazord sheet' );
      return;
    }

    meta = JSON.parse( meta );
    var themeName = '';
    meta.data.forEach( function( item ) {
      if( item.type === 'theme' && item.key === request.params.theme ) {
        themeName = item.value;
      }
    });

    if( themeName === '' ) {
      response.status( 404 ).jsonp({
        errors: [{
          message: 'the theme you requested was not recognized',
          code: 404
        }]
      });
      return;
    }

    // get megazord (all) proposals
    redisClient.get( 'thunderhug:megazord', function( error, data ) {
      if( error ) {
        response.status( 500 ).jsonp({
          errors: [{
            message: 'unable to contact the database at this time',
            code: 500
          }]
        });
        console.log( error );
        return;
      }

      if( data === null ) {
        response.status( 500 ).jsonp({
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
      var themeProposals = [];

      proposals.forEach( function( proposal ) {
        if( proposal.theme === themeName ) {
          themeProposals.push( proposal );
        }
      });

      var safeProposals = cleanProposals( themeProposals );

      switch( request.params.format ) {
        case 'json':
        case 'jsonp':
        case undefined:
          response.jsonp( safeProposals );
        break;
        case 'csv':
          // csv code here
          safeProposals.forEach( function( proposal, idx ) {
            var stringifiedFacilitators = proposal.facilitators;

            stringifiedFacilitators.forEach( function( facilitator, idx ) {
              var tmp = facilitator;
              facilitator = tmp.name;

              if( tmp.twitter ) {
                facilitator += ' ' + tmp.twitter;
              }

              proposal.facilitators[ idx ] = facilitator;
            });

            stringifiedFacilitators = stringifiedFacilitators.join( '\n' );

            safeProposals[ idx ].facilitators = stringifiedFacilitators;
          });

          json2csv( {
            data: safeProposals,
            fields: [
              'timestamp',
              'title',
              'theme',
              'organization',
              'facilitators',
              'goals',
              'agneda',
              'scale',
              'outcomes'
            ]
          }, function( error, csv ) {
            if ( error ) {
              response.status( 500 ).send();
              return console.error( error );
            }
            response.set('Content-Type', 'text/plain');
            response.send( csv );
          });
        break;
        default:
          // default code here
          response.status( 400 ).jsonp({
            errors: [{
              message: 'requested format (' + request.params.format + ') not recognized',
              code: 400
            }]
          });
        break;
      }
    });
  });
});

// launch the server
var server = app.listen( env.get( 'PORT' ) || 3000, function() {
  debug( 'Listening on port %d', server.address().port );
});
