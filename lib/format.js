/*
	String Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
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



"use strict" ;



// Load modules
//var tree = require( 'tree-kit' ) ;
var inspect = require( './inspect.js' ).inspect ;
var inspectError = require( './inspect.js' ).inspectError ;
var ansi = require( './ansi.js' ) ;



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
	%I		call string-kit's inspect()
	%Y		call string-kit's inspect(), but do not inspect non-enumerable
	%E		call string-kit's inspectError()
	%J		JSON.stringify()
	%D		drop
	%F		filter function existing in the 'this' context, e.g. %[filter:%a%a]F
	%a		argument for a function
	
	Candidate format:
	%A		for automatic type?
	%c		for char? (can receive a string or an integer translated into an UTF8 chars)
	%C		for currency formating?
	%B		for Buffer objects?
	%e		for scientific notation?
*/

exports.formatMethod = function format( str )
{
	if ( typeof str !== 'string' )
	{
		if ( str === null || str === undefined ) { return '' ; }
		else if ( /*str && typeof str === 'object' && */ typeof str.toString === 'function' ) { str = str.toString() ; }
		else { return '' ; }
	}
	
	var self = this , arg , value ,
		autoIndex = 1 , args = arguments , length = arguments.length ,
		hasMarkup = false , markupStack = [] ;
	
	//console.log( 'format args:' , arguments ) ;
	
	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	//str = str.replace( /\^(.?)|%(?:([+-]?)([0-9]*)(?:\/([^\/]*)\/)?([a-zA-Z%])|\[([a-zA-Z0-9_]+)(?::([^\]]*))?\])/g ,
	str = str.replace( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/g ,
		function( match , markup , doublePercent , relative , index , modeArg , mode ) {		// jshint ignore:line
			
			var replacement , i , n , tmp , fn , fnArgString , argMatches , argList = [] ;
			
			//console.log( 'replaceArgs:' , arguments ) ;
			if ( doublePercent ) { return '%'; }
			
			if ( markup )
			{
				if ( markup === '^' ) { return '^' ; }
				if ( ! self.markup || ! self.markup[ markup ] ) { return '' ; }
				hasMarkup = true ;
				
				if ( typeof self.markup[ markup ] === 'function' )
				{
					replacement = self.markup[ markup ]( markupStack ) ;
					// method should manage markup stack themselves
				}
				else
				{
					replacement = self.markup[ markup ] ;
					markupStack.push( replacement ) ;
				}
				
				return replacement ;
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
					if ( typeof arg !== 'number' ) { return '0' ; }
					if ( modeArg !== undefined )
					{
						// Use jQuery number format?
						switch ( modeArg[ 0 ] )
						{
							case 'p' :
								n = parseInt( modeArg.slice( 1 ) , 10 ) ;
								if ( n >= 1 ) { arg = arg.toPrecision( n ) ; }
								break ;
							case 'f' :
								n = parseInt( modeArg.slice( 1 ) , 10 ) ;
								arg = arg.toFixed( n ) ;
								break ;
						}
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
				case 'I' :
					return inspect( { style: ( self && self.color ? 'color' : 'none' ) } , arg ) ;
				case 'Y' :
					return inspect( {
							style: ( self && self.color ? 'color' : 'none' ) ,
							noFunc: true ,
							enumOnly: true ,
							noDescriptor: true
						} ,
						arg ) ;
				case 'E' :
					return inspectError( { style: ( self && self.color ? 'color' : 'none' ) } , arg ) ;
				case 'J' :
					return JSON.stringify( arg ) ;
				case 'D' :
					return '' ;
				case 'F' :	// Function
					
					autoIndex -- ;	// %F does not eat any arg
					
					if ( modeArg === undefined ) { return '' ; }
					tmp = modeArg.split( ':' ) ;
					fn = tmp[ 0 ] ;
					fnArgString = tmp[ 1 ] ;
					if ( ! fn ) { return '' ; }
					
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
								index = parseInt( index , 10 ) ;
								
								if ( relative )
								{
									if ( relative === '+' ) { index = autoIndex + index ; }		// jshint ignore:line
									else if ( relative === '-' ) { index = autoIndex - index ; }	// jshint ignore:line
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
					
					if ( ! self || ! self.fn || typeof self.fn[ fn ] !== 'function' ) { return '' ; }
					return self.fn[ fn ].apply( self , argList ) ;
				
				default :
					return '' ;
			}
	} ) ;
	
	if ( hasMarkup && this.markupReset && this.endingMarkupReset )
	{
		str += typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ;
	}
	
	if ( this.extraArguments )
	{
		for ( ; autoIndex < length ; autoIndex ++ )
		{
			arg = args[ autoIndex ] ;
			if ( arg === null || arg === undefined ) { continue ; }
			else if ( typeof arg === 'string' ) { str += arg ; }
			else if ( typeof arg === 'number' ) { str += arg ; }
			else if ( typeof arg.toString === 'function' ) { str += arg.toString() ; }
		}
	}
	
	return str ;
} ;



var defaultFormatter = {
	extraArguments: true ,
	endingMarkupReset: true ,
	markupReset: ansi.reset ,
	markup: {
		":": ansi.reset ,
		" ": ansi.reset + " " ,
		
		"-": ansi.dim ,
		"+": ansi.bold ,
		"_": ansi.underline ,
		"/": ansi.italic ,
		"!": ansi.inverse ,
		
		"b": ansi.blue ,
		"B": ansi.brightBlue ,
		"c": ansi.cyan ,
		"C": ansi.brightCyan ,
		"g": ansi.green ,
		"G": ansi.brightGreen ,
		"k": ansi.black ,
		"K": ansi.brightBlack ,
		"m": ansi.magenta ,
		"M": ansi.brightMagenta ,
		"r": ansi.red ,
		"R": ansi.brightRed ,
		"w": ansi.white ,
		"W": ansi.brightWhite ,
		"y": ansi.yellow ,
		"Y": ansi.brightYellow
	}
} ;

exports.format = exports.formatMethod.bind( defaultFormatter ) ;
exports.format.default = defaultFormatter ;



exports.markupMethod = function markup( str )
{
	if ( typeof str !== 'string' )
	{
		if ( str === null || str === undefined ) { return '' ; }
		else if ( /*str && typeof str === 'object' && */ typeof str.toString === 'function' ) { str = str.toString() ; }
		else { return '' ; }
	}
	
	var self = this , hasMarkup = false , markupStack = [] ;
	
	//console.log( 'format args:' , arguments ) ;
	
	str = str.replace( /\^(.?)/g , function( match , markup ) {
		var replacement ;
		
		if ( markup === '^' ) { return '^' ; }
		if ( ! self.markup || ! self.markup[ markup ] ) { return '' ; }
		hasMarkup = true ;
		
		if ( typeof self.markup[ markup ] === 'function' )
		{
			replacement = self.markup[ markup ]( markupStack ) ;
			// method should manage markup stack themselves
		}
		else
		{
			replacement = self.markup[ markup ] ;
			markupStack.push( replacement ) ;
		}
		
		return replacement ;
	} ) ;
	
	if ( hasMarkup && this.markupReset && this.endingMarkupReset )
	{
		str += typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ;
	}
	
	return str ;
} ;

exports.markup = exports.markupMethod.bind( defaultFormatter ) ;



// Count the number of parameters needed for this string
exports.format.count = function formatCount( str )
{
	var match , index , relative , autoIndex = 1 , maxIndex = 0 ;
	
	if ( typeof str !== 'string' ) { return 0 ; }
	
	// This regex differs slightly from the main regex: we do not count '%%' and %F is excluded
	var regexp = /%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-EG-Z])/g ;
	
	
	while ( ( match = regexp.exec( str ) ) !== null )
	{
		//console.log( match ) ;
		relative = match[ 1 ] ;
		index = match[ 2 ] ;
		
		if ( index )
		{
			index = parseInt( index , 10 ) ;
			
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
		
		if ( maxIndex < index ) { maxIndex = index ; }
	}
	
	return maxIndex ;
} ;



// Tell if this string contains formatter chars
exports.format.hasFormatting = function hasFormatting( str )
{
	if ( str.search( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/ ) !== -1 ) { return true ; }
	else { return false ; }
} ;


