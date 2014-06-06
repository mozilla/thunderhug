'use strict';

module.exports = {
  stripEmails: function( string ) {
    return string.replace( /[^@\s]*@[^@\s]*\.[^@\s]*/ig, '****@*******.***' );
  }
};
