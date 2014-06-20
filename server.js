'use strict';

// now for the app
var express = require( 'express' );
var morgan = require( 'morgan' );
var json2csv = require( 'json2csv' );
var sessions = require( './lib/sessions' );
var shared = require( './shared' );
var env = shared.env;
var debug = shared.debug;

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

// no caching of api routes pl0x
app.all( '*',  function( req, res, next ) {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  return next();
});

// healthcheck
app.get( [ '/', '/healthcheck/:format?' ], function( req, res ) {
  res.jsonp( healthcheck );
});

/**
 * Gets proposals and deals w/ response + response format
 *
 * @param  {Object} req Request object from express route
 * @param  {Object} res Response object from express route
 */
function getProposals( req, res ) {
  // format response in JSON
  function jsonDone( err, proposals ) {
    debug( 'responding to request w/ json' );
    if( err ) {
      return res.status( 500 ).jsonp({
        errors: [{
          message: err.toString(),
          code: 500
        }]
      });
    }

    /*
      meta block for this request
     */
    var meta = {
      slug: 'all',
      name: 'All Proposals',
      description: 'A full listing of all proposals submitted'
    };

    // if we were given a theme override default
    if( req.params.theme ) {
      meta = sessions.getTheme( req.params.theme );
    }

    // add proposals count to meta
    meta.totalProposals = proposals.length;

    var resObj = {
      meta: meta,
      sessions: proposals
    };

    if( meta.slug === 'all' ) {
      resObj.themes = sessions.getThemes();
    }

    return res.jsonp( resObj );
  }

  function csvDone( err, proposals ) {
    debug( 'responding to request w/ json' );
    if( err || !proposals[ 0 ] ) {
      if( !proposals[ 0 ] ) {
        err = 'No proposals to display right now.';
      }
      return json2csv({
        data: [{
          error: err.toString()
        }],
        fields: [ 'error' ]
      }, function( err, csv ) {
        if ( err ) {
          res.status( 500 ).send();
          return console.error( err );
        }
        res.set('Content-Type', 'text/plain');
        res.send( csv );
      });
    }

    // flattern facilitators out for csv
    proposals.forEach( function( proposal, idx ) {
      var facilitators = '';

      proposal.facilitators.forEach( function( facilitator ) {
        var tmp = facilitator.name + ' ' + facilitator.twitter;
        facilitators += tmp.trim() + '\n';
      });

      proposals[ idx ].facilitators = facilitators.trim();
    });

    json2csv({
      data: proposals,
      fields: Object.keys( proposals[ 0 ] )
    }, function( err, csv ) {
      if ( err ) {
        res.status( 500 ).send();
        return console.error( err );
      }
      res.set('Content-Type', 'text/plain');
      res.send( csv );
    });
  }

  // if we don't have a mapping for the theme don't try and load it.
  if( req.params.theme && sessions.getThemeSlugs().indexOf( req.params.theme ) === -1 ) {
    return res.status( 404 ).jsonp({
      errors: [{
        message: req.url + ' not found',
        code: 404
      }]
    });
  }

  switch( req.params.format ) {
    case 'json':
    case 'jsonp':
    case undefined:
      if( req.params.theme ) {
        return sessions.getSessions( req.params.theme, jsonDone );
      }
      return sessions.getSessions( jsonDone );
    case 'csv':
      if( req.params.theme ) {
        return sessions.getSessions( req.params.theme, csvDone );
      }
      return sessions.getSessions( csvDone );
    default:
      return res.status( 400 ).jsonp({
        errors: [{
          message: 'requested format is unsupported',
          code: 400
        }]
      });
  }
}

// return all proposals (special route)
app.get( '/all/:format?', getProposals);
// return specific themes proposals
app.get( '/:theme/:format?', getProposals);

// custom 404
app.use( function( req, res, next ) {
  res.status( 404 ).jsonp({
    errors: [{
      message: req.url + ' not found',
      code: 404
    }]
  });

  return next();
});

// launch the server
var server = app.listen( env.get( 'PORT' ) || 3000, function() {
  debug( 'Listening on port %d', server.address().port );
});
