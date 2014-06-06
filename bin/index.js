'use strict';
var shared = require( '../shared' );
var env = shared.env;
var debug = shared.debug;

var fork = require( 'child_process' ).fork;

// get proposals job
var getProposals;
function getProposalsFork() {
  if( getProposals ) {
    getProposals.kill();
    return;
  }

  debug( 'Job: getProposals forked' );

  var args = [];
  if( env.get( 'debug' ) || env.get( 'DEBUG' ) ) {
    args.push( '--debug' );
  }

  getProposals = fork( __dirname + '/getProposals', args );
  getProposals.on( 'exit', function( code, signal ) {
    debug( 'Job: getProposals exited w/ code %d – signal %d', code, signal );
    getProposals = null;
  });
}

setInterval( getProposalsFork, 60000 );

getProposalsFork();
