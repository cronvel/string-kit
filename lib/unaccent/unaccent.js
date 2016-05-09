
var map = require( './map.json' ) ;

module.exports = function( str )
{
	return str.replace( /[^\u0000-\u007e]/g , c => map[ c ] || c ) ;
} ;

            
