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

/*
	String formater, inspired by C's sprintf().
*/



// Load modules
//var tree = require( 'tree-kit' ) ;



/*
	%%		a single %
	%s		string
	%f		float
	%d	%i	integer
	%u		unsigned integer
	%U		unsigned positive integer (>0)
	%h		hexadecimal
	%x		hexadecimal, force pair of symbols (e.g. 'f' -> '0f')
	%o		octal
	%b		binary
	%J		JSON.stringify()
	%D		drop
	%[		filter function existing in the 'this' context, e.g. %[filter:%a%a]
	%a		argument for a function
	
	Candidate format:
	%c		for char? (can receive a string or an integer translated into an UTF8 chars)
	%C		for currency formating?
	%B		for Buffer objects?
	%e		for scientific notation?
*/

exports.format = function format( str )
{
	if ( typeof str !== 'string' )
	{
		if ( str === null || str === undefined ) { return '' ; }
		else if ( /*str && typeof str === 'object' && */ typeof str.toString === 'function' ) { str = str.toString() ; }
		else { return '' ; }
	}
	
	var arg , value , autoIndex = 1 , args = arguments , length = arguments.length , self = this ;
	
	//console.log( 'format args:' , arguments ) ;
	
	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	str = str.replace( /%(([+-]?)([0-9]*)(\/([^\/]+)\/)?([a-zA-Z%])|\[([a-zA-Z0-9_]+)(:([^\]]*))?\])/g ,
		function( match , trash , relative , index , trash2 , modeArg , mode , fn , trash3 , fnArgString ) {		// jshint ignore:line
			
			//console.log( 'replaceArgs:' , arguments ) ;
			if ( mode === '%' ) { return '%'; }
			
			if ( fn )
			{
				var i , argMatches , argList = [] ;
				
				if ( fnArgString && ( argMatches = fnArgString.match( /%([+-]?)([0-9]*)[a-zA-Z]/g ) ) )
				{
					//console.log( argMatches ) ;
					//console.log( fnArgString ) ;
					for ( i = 0 ; i < argMatches.length ; i ++ )
					{
						relative = argMatches[ i ][ 1 ] ;
						index = argMatches[ i ][ 2 ] ;
						
						if ( index )
						{
							index = parseInt( index ) ;
							
							if ( relative )
							{
								if ( relative === '+' ) { index = autoIndex + index ; }
								else if ( relative === '-' ) { index = autoIndex - index ; }
							}
						}
						else
						{
							index = autoIndex ;
						}
						
						autoIndex ++ ;
						
						if ( index >= length || index < 1 ) { argList[ i ] = undefined ; }
						else { argList[ i ] = args[ index ] ; }
					}
				}
				
				//console.log( '~F~' ) ;
				if ( typeof self[ fn ] !== 'function' ) { return '' ; }
				return self[ fn ].apply( self , argList ) ;
			}
			
			if ( index )
			{
				index = parseInt( index ) ;
				
				if ( relative )
				{
					if ( relative === '+' ) { index = autoIndex + index ; }
					else if ( relative === '-' ) { index = autoIndex - index ; }
				}
			}
			else
			{
				index = autoIndex ;
			}
			
			autoIndex ++ ;
			
			if ( index >= length || index < 1 ) { arg = undefined ; }
			else { arg = args[ index ] ; }
			
			switch ( mode )
			{
				case 's' :	// string
					if ( arg === null || arg === undefined ) { return '' ; }
					if ( typeof arg === 'string' ) { return arg ; }
					if ( typeof arg === 'number' ) { return '' + arg ; }
					if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
					return '' ;
				case 'f' :	// float
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg !== 'number' ) { arg = 0 ; }
					if ( modeArg !== undefined )
					{
						arg = formatNumber( modeArg , arg ) ;
					}
					return '' + arg ;
				case 'd' :
				case 'i' :	// integer decimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
					return '0' ;
				case 'u' :	// unsigned decimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
					return '0' ;
				case 'U' :	// unsigned positive decimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
					return '1' ;
				case 'x' :	// unsigned hexadecimal, force pair of symbole
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg !== 'number' ) { return '0' ; }
					value = '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ;
					if ( value.length % 2 ) { value = '0' + value ; }
					return value ;
				case 'h' :	// unsigned hexadecimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
					return '0' ;
				case 'o' :	// unsigned octal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
					return '0' ;
				case 'b' :	// unsigned binary
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
					return '0' ;
				case 'J' :
					return JSON.stringify( arg ) ;
				case 'D' :
					return '' ;
				default :
					return '' ;
			}
	} ) ;
	
	for ( ; autoIndex < length ; autoIndex ++ )
	{
		arg = args[ autoIndex ] ;
		if ( arg === null || arg === undefined ) { continue ; }
		else if ( typeof arg === 'string' ) { str += arg ; }
		else if ( typeof arg === 'number' ) { str += arg ; }
		else if ( typeof arg.toString === 'function' ) { str += arg.toString() ; }
	}
	
	return str ;
} ;



// Count the number of parameters needed for this string
exports.format.count = function count( str )
{
	if ( typeof str !== 'string' ) { return 0 ; }
	
	// This regex differs slightly from the main regex: we do not count '%%' and '%['
	var matches = str.match( /%[+-]?[0-9]*[a-zA-Z]/g ) ;
	
	if ( ! matches ) { return 0 ; }
	else { return matches.length ; }
} ;



// Count the number of parameters needed for this string
exports.format.hasFormatting = function hasFormatting( str )
{
	if ( str.search( /%([+-]?[0-9]*[a-zA-Z%]|\[[a-zA-Z0-9_]+(:[^\]]*)?\])/ ) !== -1 ) { return true ; }
	else { return false ; }
} ;



function formatNumber( options , number )
{
	var str , i , format , matches , integer , fraction ;
	
	
	// If 'options' is a format, parse it!
	if ( typeof options === 'string' )
	{
		format = options ;
		options = {} ;
		
		matches = format.match( /([a-zA-Z]*)([0-9]*).([a-zA-Z]*)([0-9]*)/ ) ;
		
		options.integer = {} ;
		for ( i = 0 ; i < matches[ 1 ].length ; i ++ ) { options.integer[ matches[ 1 ][ i ] ] = true ; }
		options.integer.digits = parseInt( matches[ 2 ] ) ;
		
		options.fraction = {} ;
		for ( i = 0 ; i < matches[ 3 ].length ; i ++ ) { options.fraction[ matches[ 3 ][ i ] ] = true ; }
		options.fraction.digits = parseInt( matches[ 4 ] ) ;
	}
	
	if ( ! options || typeof options !== 'object' )
	{
		// Error or not error, that's the question...
		return '' ;
	}
	
	
	
			/* Integer part */
	
	
	integer = Math.round( number ) ;
	
	if ( options.integer.r )
	{
		// round the integer part
		integer = Math.round( integer * Math.pow( 10 , - options.integer.digits ) ) * Math.pow( 10 , options.integer.digits ) ;
	}
	
	integer = integer.toString() ;
	
	if ( options.integer.p )
	{
		// left zero-padding
		for ( i = integer.length ; i < options.integer.digits ; i ++ ) { integer = '0' + integer ; }
	}
	
	
			/* Fraction part */
	
	
	fraction = ( number - Math.floor( number ) ) ;
	
	if ( options.fraction.r )
	{
		// round the fraction part
		fraction = Math.round( fraction * Math.pow( 10 , options.fraction.digits ) ) * Math.pow( 10 , - options.fraction.digits ) ;
	}
	
	fraction = fraction.toString().slice( 2 ) ;
	
	if ( options.fraction.p )
	{
		// right zero-padding
		for ( i = fraction.length ; i < options.fraction.digits ; i ++ ) { fraction += '0' ; }
	}
	
	str = integer + ( fraction ? '.' + fraction : '' ) ;
	
	return str ;
}

exports.format.number = formatNumber ;



