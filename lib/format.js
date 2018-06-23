/*
	String Kit

	Copyright (c) 2014 - 2018 Cédric Ronvel

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
	%z		base64
	%Z		base64url
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

exports.formatMethod = function format( ... args ) {
	var str = args[ 0 ] ;

	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var arg , value ,
		autoIndex = 1 , length = args.length ,
		hasMarkup = false , shift = null , markupStack = [] ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	//str = str.replace( /\^(.?)|%(?:([+-]?)([0-9]*)(?:\/([^\/]*)\/)?([a-zA-Z%])|\[([a-zA-Z0-9_]+)(?::([^\]]*))?\])/g ,
	str = str.replace( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/g ,
		( match , markup , doublePercent , relative , index , modeArg , mode ) => {

			var replacement , i , n , depth , tmp , fn , fnArgString , argMatches , argList = [] ;

			//console.log( 'replaceArgs:' , arguments ) ;
			if ( doublePercent ) { return '%' ; }

			if ( markup ) {
				if ( markup === '^' ) { return '^' ; }

				if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
					shift = this.shiftMarkup[ markup ] ;
					return '' ;
				}

				if ( shift ) {
					if ( ! this.shiftedMarkup || ! this.shiftedMarkup[ shift ] || ! this.shiftedMarkup[ shift ][ markup ] ) {
						return '' ;
					}

					hasMarkup = true ;

					if ( typeof this.shiftedMarkup[ shift ][ markup ] === 'function' ) {
						replacement = this.shiftedMarkup[ shift ][ markup ]( markupStack ) ;
						// method should manage markup stack themselves
					}
					else {
						replacement = this.shiftedMarkup[ shift ][ markup ] ;
						markupStack.push( replacement ) ;
					}

					shift = null ;
				}
				else {
					if ( ! this.markup || ! this.markup[ markup ] ) {
						return '' ;
					}

					hasMarkup = true ;

					if ( typeof this.markup[ markup ] === 'function' ) {
						replacement = this.markup[ markup ]( markupStack ) ;
						// method should manage markup stack themselves
					}
					else {
						replacement = this.markup[ markup ] ;
						markupStack.push( replacement ) ;
					}
				}

				return replacement ;
			}


			if ( index ) {
				index = parseInt( index , 10 ) ;

				if ( relative ) {
					if ( relative === '+' ) { index = autoIndex + index ; }
					else if ( relative === '-' ) { index = autoIndex - index ; }
				}
			}
			else {
				index = autoIndex ;
			}

			autoIndex ++ ;

			if ( index >= length || index < 1 ) { arg = undefined ; }
			else { arg = args[ index ] ; }

			switch ( mode ) {
				case 's' :	// string
					if ( arg === null || arg === undefined ) { return '(' + arg + ')' ; }
					if ( typeof arg === 'string' ) { return arg ; }
					if ( typeof arg === 'number' ) { return '' + arg ; }
					if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
					return '(' + arg + ')' ;
				case 'f' :	// float
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg !== 'number' ) { return '0' ; }
					if ( modeArg !== undefined ) {
						// Use jQuery number format?
						switch ( modeArg[ 0 ] ) {
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
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
					return '0' ;
				case 'k' :	// metric prefixes (like k,M,G, etc)
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg !== 'number' ) { return '0' ; }
					return metricPrefix( arg ) ;
				case 'u' :	// unsigned decimal
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
					return '0' ;
				case 'U' :	// unsigned positive decimal
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
					return '1' ;
				case 'x' :	// unsigned hexadecimal, force pair of symbole
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg !== 'number' ) { return '0' ; }
					value = '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ;
					if ( value.length % 2 ) { value = '0' + value ; }
					return value ;
				case 'h' :	// unsigned hexadecimal
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
					return '0' ;
				case 'o' :	// unsigned octal
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
					return '0' ;
				case 'b' :	// unsigned binary
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
					return '0' ;
				case 'z' :	// base64
					if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
					else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
					return arg.toString( 'base64' ) ;
				case 'Z' :	// base64url
					if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
					else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
					return arg.toString( 'base64' ).replace( /\+/g , '-' ).replace( /\//g , '_' ).replace( /[=]{1,2}$/g , '' ) ;
				case 'I' :
					depth = 3 ;
					if ( modeArg !== undefined ) { depth = parseInt( modeArg , 10 ) ; }
					return inspect( { depth: depth , style: ( this && this.color ? 'color' : 'none' ) } , arg ) ;
				case 'Y' :
					depth = 3 ;
					if ( modeArg !== undefined ) { depth = parseInt( modeArg , 10 ) ; }
					return inspect( {
						depth: depth ,
						style: ( this && this.color ? 'color' : 'none' ) ,
						noFunc: true ,
						enumOnly: true ,
						noDescriptor: true
					} ,
					arg ) ;
				case 'E' :
					return inspectError( { style: ( this && this.color ? 'color' : 'none' ) } , arg ) ;
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

					if ( fnArgString && ( argMatches = fnArgString.match( /%([+-]?)([0-9]*)[a-zA-Z]/g ) ) ) {
						//console.log( argMatches ) ;
						//console.log( fnArgString ) ;
						for ( i = 0 ; i < argMatches.length ; i ++ ) {
							relative = argMatches[ i ][ 1 ] ;
							index = argMatches[ i ][ 2 ] ;

							if ( index ) {
								index = parseInt( index , 10 ) ;

								if ( relative ) {
									if ( relative === '+' ) { index = autoIndex + index ; }		// jshint ignore:line
									else if ( relative === '-' ) { index = autoIndex - index ; }	// jshint ignore:line
								}
							}
							else {
								index = autoIndex ;
							}

							autoIndex ++ ;

							if ( index >= length || index < 1 ) { argList[ i ] = undefined ; }
							else { argList[ i ] = args[ index ] ; }
						}
					}

					if ( ! this || ! this.fn || typeof this.fn[ fn ] !== 'function' ) { return '' ; }
					return this.fn[ fn ].apply( this , argList ) ;

				default :
					return '' ;
			}
		}
	) ;

	if ( hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ;
	}

	if ( this.extraArguments ) {
		for ( ; autoIndex < length ; autoIndex ++ ) {
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
	startingMarkupReset: false ,
	markupReset: ansi.reset ,
	shiftMarkup: {
		'#': 'background'
	} ,
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
	} ,
	shiftedMarkup: {
		background: {
			":": ansi.reset ,
			" ": ansi.reset + " " ,

			"b": ansi.bgBlue ,
			"B": ansi.bgBrightBlue ,
			"c": ansi.bgCyan ,
			"C": ansi.bgBrightCyan ,
			"g": ansi.bgGreen ,
			"G": ansi.bgBrightGreen ,
			"k": ansi.bgBlack ,
			"K": ansi.bgBrightBlack ,
			"m": ansi.bgMagenta ,
			"M": ansi.bgBrightMagenta ,
			"r": ansi.bgRed ,
			"R": ansi.bgBrightRed ,
			"w": ansi.bgWhite ,
			"W": ansi.bgBrightWhite ,
			"y": ansi.bgYellow ,
			"Y": ansi.bgBrightYellow
		}
	}
} ;

exports.format = exports.formatMethod.bind( defaultFormatter ) ;
exports.format.default = defaultFormatter ;



exports.markupMethod = function markup_( str ) {
	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var hasMarkup = false , shift = null , markupStack = [] ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	str = str.replace( /\^(.?)/g , ( match , markup ) => {
		var replacement ;

		if ( markup === '^' ) { return '^' ; }

		if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
			shift = this.shiftMarkup[ markup ] ;
			return '' ;
		}

		if ( shift ) {
			if ( ! this.shiftedMarkup || ! this.shiftedMarkup[ shift ] || ! this.shiftedMarkup[ shift ][ markup ] ) {
				return '' ;
			}

			hasMarkup = true ;

			if ( typeof this.shiftedMarkup[ shift ][ markup ] === 'function' ) {
				replacement = this.shiftedMarkup[ shift ][ markup ]( markupStack ) ;
				// method should manage markup stack themselves
			}
			else {
				replacement = this.shiftedMarkup[ shift ][ markup ] ;
				markupStack.push( replacement ) ;
			}

			shift = null ;
		}
		else {
			if ( ! this.markup || ! this.markup[ markup ] ) {
				return '' ;
			}

			hasMarkup = true ;

			if ( typeof this.markup[ markup ] === 'function' ) {
				replacement = this.markup[ markup ]( markupStack ) ;
				// method should manage markup stack themselves
			}
			else {
				replacement = this.markup[ markup ] ;
				markupStack.push( replacement ) ;
			}
		}

		return replacement ;
	} ) ;

	if ( hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( markupStack ) : this.markupReset ;
	}

	return str ;
} ;



exports.markup = exports.markupMethod.bind( defaultFormatter ) ;



// Count the number of parameters needed for this string
exports.format.count = function formatCount( str ) {
	var match , index , relative , autoIndex = 1 , maxIndex = 0 ;

	if ( typeof str !== 'string' ) { return 0 ; }

	// This regex differs slightly from the main regex: we do not count '%%' and %F is excluded
	var regexp = /%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-EG-Z])/g ;


	while ( ( match = regexp.exec( str ) ) !== null ) {
		//console.log( match ) ;
		relative = match[ 1 ] ;
		index = match[ 2 ] ;

		if ( index ) {
			index = parseInt( index , 10 ) ;

			if ( relative ) {
				if ( relative === '+' ) { index = autoIndex + index ; }
				else if ( relative === '-' ) { index = autoIndex - index ; }
			}
		}
		else {
			index = autoIndex ;
		}

		autoIndex ++ ;

		if ( maxIndex < index ) { maxIndex = index ; }
	}

	return maxIndex ;
} ;



// Tell if this string contains formatter chars
exports.format.hasFormatting = function hasFormatting( str ) {
	if ( str.search( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/ ) !== -1 ) { return true ; }
	return false ;
} ;



// Metric prefix
var mulPrefix = [ '' , 'k' , 'M' , 'G' , 'T' , 'P' , 'E' , 'Z' , 'Y' ] ;
var subMulPrefix = [ '' , 'm' , 'µ' , 'n' , 'p' , 'f' , 'a' , 'z' , 'y' ] ;
var roundStep = [ 100 , 10 , 1 ] ;



function metricPrefix( n ) {
	var log , logDiv3 , logMod , base , prefix ;

	if ( ! n || n === 1 ) { return '' + n ; }
	if ( n < 0 ) { return '-' + metricPrefix( -n ) ; }

	if ( n > 1 ) {
		log = Math.floor( Math.log10( n ) ) ;
		logDiv3 = Math.floor( log / 3 ) ;
		logMod = log % 3 ;
		base = round( n / ( 1000 ** logDiv3 ) , roundStep[ logMod ] ) ;
		prefix = mulPrefix[ logDiv3 ] ;
	}
	else {
		log = Math.floor( Math.log10( n ) ) ;
		logDiv3 = Math.floor( log / 3 ) ;
		logMod = log % 3 ;
		if ( logMod < 0 ) { logMod += 3 ; }
		base = round( n / ( 1000 ** logDiv3 ) , roundStep[ logMod ] ) ;
		prefix = subMulPrefix[ -logDiv3 ] ;
	}

	return '' + base + prefix ;
}



function round( v , step ) {
	return Math.round( ( v + Number.EPSILON ) * step ) / step ;
}

