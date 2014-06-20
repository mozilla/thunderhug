'use strict';

var moment = require( 'moment' );
var remoteConfig = require( './remoteConfig' );
var shared = require( '../shared' );
var redisClient = shared.redisClient;
var env = shared.env;
var debug = shared.debug;

// all sessions sheet
var redisKey = 'megazord';
if( env.get( 'REDIS_PREFIX' ) ) {
  redisKey = env.get( 'REDIS_PREFIX' ) + ':' + redisKey;
}

/**
 * Returns public view of twitter handle for a facilitator
 * based on session privacy options
 *
 * @param  {String} handle          Twitter handle
 * @param  {String} privacyOptions  Privacy options
 * @return {String}                 Publicly safe string
 */
function facilitatorTwitter( handle, privacyOptions ) {
  // check if we should hide the handle
  if( /twitter/ig.test( privacyOptions ) ) {
    return '';
  }

  return handle;
}

/**
 * Return an array of facilitators for a session [internal]
 *
 * @param  {Object} session A session object
 * @return {Array}          Array of facilitators for public display
 */
function sessionFaclitiators( session ) {
  var facilitators = [];

  // deal w/ primary facilitator first (the person who submitted the form)
  facilitators.push({
    name: session.firstname + ' ' + session.surname,
    twitter: facilitatorTwitter( session.twitter, session.privacy )
  });

  // separate out remaining facilitators (if any)
  var additional = session.facilitators.split( '\n' );
  additional.forEach( function( facilitator ) {
    var twitterRegExp = /\B@[a-z0-9_-]+/ig; // matches a twitter handle

    // look for their twitter handle and separate that out from their name
    var twitter = facilitator.match( twitterRegExp ) || '';
    if( twitter ) {
      twitter = facilitatorTwitter( twitter[ 0 ], session.privacy );
    }

    // clean up their name to be just that
    facilitator = facilitator.replace( twitterRegExp, '' ).trim();

    // add results to
    facilitators.push({
      name: facilitator,
      twitter: twitter
    });
  });

  return facilitators;
}

/**
 * Returns public view of orgnaization/affilliation based on
 * session privacy options
 *
 * @param  {String} organization   The organization/affliation
 * @param  {String} privacyOptions Privacy options
 * @return {String}                Publicly safe string
 */
function sessionOrganization( organization, privacyOptions ) {
  // check if we should hide orgnaization/affilliation
  if( /orgnaization/ig.test( privacyOptions ) ) {
    return '';
  }

  return organization;
}

/**
 * Clean a session for public display [internal]
 *
 * @param  {Object} session A session object
 * @return {Object}         Cleaned session object
 */
function cleanSession( session ) {
  var themeSlug = remoteConfig.reverseLookup( session.theme ) || { key: '' };
  themeSlug = themeSlug.key;
  return {
    title: session.title,
    theme: session.theme,
    themeSlug: themeSlug,
    facilitators: sessionFaclitiators( session ),
    organization: sessionOrganization( session.organization, session.privacy ),
    goals: session.goals,
    agenda: session.agenda,
    scale: session.scale,
    outcomes: session.outcomes,
    timestamp: moment( session.timestamp ).toISOString()
  };
}

/**
 * Get sessions to publicly display
 *
 * @param  {[String]} theme A theme to refine results to (optional)
 * @param  {Function} done  Callback function given an `Error` and `Array` param
 */
function getSessions( theme, done ) {
  debug( 'getting sessions' );
  // make theme optional
  if( typeof theme === 'function' ) {
    done = theme;
    theme = undefined;
  }

  redisClient.get( redisKey, function( err, sessions ) {
    if( err ) {
      done( err, [] );
      return console.error( err );
    }

    if( sessions === null ) {
      done( err, [] );
      return debug( 'no sessions found' );
    }

    debug( 'sessions found in db, cleaning them up' );

    var rawSessions = JSON.parse( sessions ).data;
    sessions = []; // repurpose sessions to recieve cleaned up data

    rawSessions.forEach( function( session ) {
      // only return session if its of the correct theme
      if( theme && remoteConfig.reverseLookup( session.theme ).key !== theme ) {
        return;
      }

      // clean up the session ready for public output
      // then pump into return
      sessions.push( cleanSession( session ) );
    });

    done( err, sessions );
  });
}

/**
 * Get all themes and their names
 *
 * @return {Array} An array of objects conating theme names and descriptions
 */
function getThemes() {
  debug( 'getting all known themes' );
  var themes = [];
  var themeNames = remoteConfig.getType( 'theme' );

  for( var slug in themeNames ) {
    themes.push({
      slug: slug,
      name: themeNames[ slug ],
      description: remoteConfig.get( slug + ':description' )
    });
  }
}

/**
 * Gets a theme's name, and descripion using its slug
 *
 * @param  {String} theme Theme's slug
 * @return {Object}       Object containing the theme's name, slug, and description
 */
function getTheme( theme ) {
  debug( 'getting theme %s', theme );
  var themeDetails = remoteConfig.getKey( theme );
  return {
    slug: theme,
    name: themeDetails.theme,
    description: themeDetails.description
  };
}

/**
 * Get an array of theme slugs
 *
 * @return {Array} An array of theme slugs (strings)
 */
function getThemeSlugs() {
  debug( 'getting theme slugs' );
  var themes = remoteConfig.getType( 'theme' );
  var rtn = [];
  for( var slug in themes ) {
    rtn.push( slug );
  }
  return rtn;
}

module.exports = {
  getSessions: getSessions,
  getTheme: getTheme,
  getThemes: getThemes,
  getThemeSlugs: getThemeSlugs
};
