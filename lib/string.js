/*
	The Cedric's Swiss Knife (CSK) - CSK string toolbox

	Copyright (c) 2014 Cédric Ronvel 
	
	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/



// Load modules
var tree = require( 'tree-kit' ) ;



// Create and export
module.exports = tree.extend( null , {} ,
	
	// Tier 1
	{ escape: require( './escape.js' ) } ,
	
	// Tier 2
	require( './format.js' ) ,
	
	// Tier 3
	require( './inspect.js' )
) ;





			/* Polyfills for String.prototype */


/*
if ( ! String.prototype.repeat )
{
	// From: http://stackoverflow.com/questions/202605/repeat-string-javascript
	String.prototype.repeat = function( count )
	{
		if ( count < 1 ) { return '' ; }
		
		var result = '' , pattern = this.valueOf() ;
		
		while ( count > 1 )
		{
			if ( count & 1 ) { result += pattern ; }
			count >>= 1 ;
			pattern += pattern ;
		}
		
		return result + pattern ;
	} ;
}
//*/


