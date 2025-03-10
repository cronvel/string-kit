(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stringKit = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



/*
	Number formatting class.
	.format() should entirely use it for everything related to number formatting.
	It avoids unsolvable rounding error with epsilon.
	It is dedicated for number display, not for computing.
*/



const NUMERALS = [
	'0' , '1' , '2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' ,
	'a' , 'b' , 'c' , 'd' , 'e' , 'f' ,
	'g' , 'h' , 'i' , 'j' , 'k' , 'l' , 'm' , 'n' , 'o' , 'p' , 'q' , 'r' , 's' , 't' , 'u' , 'v' , 'w' , 'x' , 'y' , 'z'
] ;

//const NUMERAL_MAP = buildNumeralMap( NUMERALS ) ;



function StringNumber( number , options = {} ) {
	this.sign = 1 ;
	this.digits = [] ;
	this.exposant = 0 ;
	this.special = null ;	// It stores special values like NaN, Infinity, etc

	this.decimalSeparator = options.decimalSeparator ?? '.' ;
	this.forceDecimalSeparator = !! options.forceDecimalSeparator ;
	this.groupSeparator = options.groupSeparator ?? '' ;

	this.numerals = options.numerals ?? NUMERALS ;
	this.numeralZero = options.numeralZero ?? null ;	// Special numeral when the result is EXACTLY 0 (used for Roman Numerals)
	this.placeNumerals = options.placeNumerals ?? null ;
	//this.numeralMap = NUMERAL_MAP ;
	//if ( options.numerals ) { this.numeralMap = buildNumeralMap( options.numerals ) ; }

	this.set( number ) ;
}

module.exports = StringNumber ;



/*
function buildNumeralMap( numbers ) {
	var map = new Map() ;

	for ( let i = 0 ; i < numbers.length ; i ++ ) {
		let number = numbers[ i ] ;
		map.set( NUMERALS[ i ] , numbers[ i ] ) ;
	}

	return map ;
}
*/



StringNumber.prototype.set = function( number ) {
	var matches , v , i , iMax , index , hasNonZeroHead , tailIndex ;

	number = + number ;

	// Reset anything, if it was already used...
	this.sign = 1 ;
	this.digits.length = 0 ;
	this.exposant = 0 ;
	this.special = null ;

	if ( ! Number.isFinite( number ) ) {
		this.special = number ;
		return null ;
	}

	number = '' + number ;
	matches = number.match( /(-)?([0-9]+)(?:.([0-9]+))?(?:e([+-][0-9]+))?/ ) ;
	if ( ! matches ) { throw new Error( 'Unexpected error' ) ; }

	this.sign = matches[ 1 ] ? -1 : 1 ;
	this.exposant = matches[ 2 ].length + ( parseInt( matches[ 4 ] , 10 ) || 0 ) ;

	// Copy each digits and cast them back into a number
	index = 0 ;
	hasNonZeroHead = false ;
	tailIndex = 0 ;	// used to cut trailing zero

	for ( i = 0 , iMax = matches[ 2 ].length ; i < iMax ; i ++ ) {
		v = + matches[ 2 ][ i ] ;
		if ( v !== 0 ) {
			hasNonZeroHead = true ;
			this.digits[ index ] = v ;
			index ++ ;
			tailIndex = index ;
		}
		else if ( hasNonZeroHead ) {
			this.digits[ index ] = v ;
			index ++ ;
		}
		else {
			this.exposant -- ;
		}
	}

	if ( matches[ 3 ] ) {
		for ( i = 0 , iMax = matches[ 3 ].length ; i < iMax ; i ++ ) {
			v = + matches[ 3 ][ i ] ;

			if ( v !== 0 ) {
				hasNonZeroHead = true ;
				this.digits[ index ] = v ;
				index ++ ;
				tailIndex = index ;
			}
			else if ( hasNonZeroHead ) {
				this.digits[ index ] = v ;
				index ++ ;
			}
			else {
				this.exposant -- ;
			}
		}
	}

	if ( tailIndex !== index ) {
		this.digits.length = tailIndex ;
	}
} ;



StringNumber.prototype.toNumber = function() {
	// Using a string representation
	if ( this.special !== null ) { return this.special ; }
	return parseFloat( ( this.sign < 0 ? '-' : '' ) + '0.' + this.digits.join( '' ) + 'e' + this.exposant ) ;
} ;



StringNumber.prototype.toString = function( ... args ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( this.exposant > 20 || this.exposant < -20 ) { return this.toScientificString( ... args ) ; }
	return this.toNoExpString( ... args ) ;
} ;



StringNumber.prototype.toExponential =
StringNumber.prototype.toExponentialString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	str += 'e' + ( this.exposant > 0 ? '+' : '' ) + ( this.exposant - 1 ) ;
	return str ;
} ;



const SUPER_NUMBER = [ '⁰' , '¹' , '²' , '³' , '⁴' , '⁵' , '⁶' , '⁷' , '⁸' , '⁹' ] ;
const SUPER_PLUS = '⁺' ;
const SUPER_MINUS = '⁻' ;
const ZERO_CHAR_CODE = '0'.charCodeAt( 0 ) ;

StringNumber.prototype.toScientific =
StringNumber.prototype.toScientificString = function() {
	if ( this.special !== null ) { return '' + this.special ; }

	var str = this.sign < 0 ? '-' : '' ;
	if ( ! this.digits.length ) { return str + '0' ; }

	str += this.digits[ 0 ] ;

	if ( this.digits.length > 1 ) {
		str += this.decimalSeparator + this.digits.join( '' ).slice( 1 ) ;
	}

	var exposantStr =
		( this.exposant <= 0 ? SUPER_MINUS : '' ) +
		( '' + Math.abs( this.exposant - 1 ) ).split( '' ).map( c => SUPER_NUMBER[ c.charCodeAt( 0 ) - ZERO_CHAR_CODE ] )
			.join( '' ) ;

	str += ' × 10' + exposantStr ;
	return str ;
} ;



// leadingZero = minimal number of numbers before the dot, they will be left-padded with zero if needed.
// trailingZero = minimal number of numbers after the dot, they will be right-padded with zero if needed.
// onlyIfDecimal: set it to true if you don't want right padding zero when there is no decimal
StringNumber.prototype.toNoExp =
StringNumber.prototype.toNoExpString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false , exposant = this.exposant ) {
	if ( this.special !== null ) { return '' + this.special ; }

	var integerDigits = [] , decimalDigits = [] ,
		str = this.sign < 0 ? '-' : forcePlusSign ? '+' : '' ;

	if ( ! this.digits.length ) {
		if ( leadingZero > 1 ) {
			this.fillZeroes( integerDigits , leadingZero - 1 , leadingZero ) ;
		}

		integerDigits.push( this.numeralZero ?? this.placeNumerals?.[ 0 ]?.[ 0 ] ?? this.numerals[ 0 ] ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			this.fillZeroes( decimalDigits , trailingZero ) ;
		}
	}
	else if ( exposant <= 0 ) {
		// This number is of type 0.[0...]xyz
		this.fillZeroes( integerDigits , leadingZero ) ;

		this.fillZeroes( decimalDigits , -exposant , trailingZero - this.digits.length ) ;
		this.appendNumerals( decimalDigits , this.digits , undefined , undefined , -exposant - 1 ) ;

		if ( trailingZero && this.digits.length - exposant < trailingZero ) {
			this.fillZeroes( decimalDigits , trailingZero - this.digits.length + exposant ) ;
		}
	}
	else if ( exposant >= this.digits.length ) {
		// This number is of type xyz[0...]
		if ( exposant < leadingZero ) { this.fillZeroes( integerDigits , leadingZero - exposant , exposant - 1 ) ; }
		this.appendNumerals( integerDigits , this.digits , undefined , undefined , exposant - 1 ) ;
		this.fillZeroes( integerDigits , exposant - this.digits.length ) ;

		if ( trailingZero && ! onlyIfDecimal ) {
			this.fillZeroes( decimalDigits , trailingZero ) ;
		}
	}
	else {
		// Here the digits are splitted with a dot in the middle
		if ( exposant < leadingZero ) { this.fillZeroes( integerDigits , leadingZero - exposant ) ; }
		this.appendNumerals( integerDigits , this.digits , 0 , exposant , exposant - 1 ) ;

		this.appendNumerals( decimalDigits , this.digits , exposant , undefined , this.digits.length - exposant ) ;

		if (
			trailingZero && this.digits.length - exposant < trailingZero
			&& ( ! onlyIfDecimal || this.digits.length - exposant > 0 )
		) {
			this.fillZeroes( decimalDigits , trailingZero - this.digits.length + exposant ) ;
		}
	}

	str += this.groupSeparator ?
		this.groupDigits( integerDigits , this.groupSeparator ) :
		integerDigits.join( '' ) ;

	if ( decimalDigits.length ) {
		str += this.decimalSeparator + (
			this.decimalGroupSeparator ?
				this.groupDigits( decimalDigits , this.decimalGroupSeparator ) :
				decimalDigits.join( '' )
		) ;
	}
	else if ( this.forceDecimalSeparator ) {
		str += this.decimalSeparator ;
	}

	return str ;
} ;



// Metric prefix
const MUL_PREFIX = [ '' , 'k' , 'M' , 'G' , 'T' , 'P' , 'E' , 'Z' , 'Y' ] ;
const SUB_MUL_PREFIX = [ '' , 'm' , 'µ' , 'n' , 'p' , 'f' , 'a' , 'z' , 'y' ] ;



StringNumber.prototype.toMetric =
StringNumber.prototype.toMetricString = function( leadingZero = 1 , trailingZero = 0 , onlyIfDecimal = false , forcePlusSign = false ) {
	if ( this.special !== null ) { return '' + this.special ; }
	if ( ! this.digits.length ) { return this.sign > 0 ? '0' : '-0' ; }

	var prefix = '' , fakeExposant ;

	if ( this.exposant > 0 ) {
		fakeExposant = 1 + ( ( this.exposant - 1 ) % 3 ) ;
		prefix = MUL_PREFIX[ Math.floor( ( this.exposant - 1 ) / 3 ) ] ;
		// Fallback to scientific if the number is to big
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}
	else {
		fakeExposant = 3 - ( -this.exposant % 3 ) ;
		prefix = SUB_MUL_PREFIX[ 1 + Math.floor( -this.exposant / 3 ) ] ;
		// Fallback to scientific if the number is to small
		if ( prefix === undefined ) { return this.toScientificString() ; }
	}

	return this.toNoExpString( leadingZero , trailingZero , onlyIfDecimal , forcePlusSign , fakeExposant ) + prefix ;
} ;



/*
	type: 0=round, -1=floor, 1=ceil
	Floor if < .99999
	Ceil if >= .00001
*/
StringNumber.prototype.precision = function( n , type = 0 ) {
	var roundUp ;

	if ( this.special !== null || n >= this.digits.length ) { return this ; }

	if ( n < 0 ) { this.digits.length = 0 ; return this ; }

	type *= this.sign ;

	if ( type < 0 ) {
		roundUp =
			this.digits.length > n + 4
			&& this.digits[ n ] === 9 && this.digits[ n + 1 ] === 9
			&& this.digits[ n + 2 ] === 9 && this.digits[ n + 3 ] === 9 && this.digits[ n + 4 ] === 9 ;
	}
	else if ( type > 0 ) {
		roundUp =
			this.digits[ n ] > 0 || this.digits[ n + 1 ] > 0
			|| this.digits[ n + 2 ] > 0 || this.digits[ n + 3 ] > 0 || this.digits[ n + 4 ] > 0 ;
	}
	else {
		roundUp = this.digits[ n ] >= 5 ;
	}

	if ( roundUp ) {
		let i = n - 1 ,
			done = false ;

		// Cascading increase
		for ( ; i >= 0 ; i -- ) {
			if ( this.digits[ i ] < 9 ) { this.digits[ i ] ++ ; done = true ; break ; }
			else { this.digits[ i ] = 0 ; }
		}

		if ( ! done ) {
			this.exposant ++ ;
			this.digits[ 0 ] = 1 ;
			this.digits.length = 1 ;
		}
		else {
			this.digits.length = i + 1 ;
		}
	}
	else {
		this.digits.length = n ;
		this.removeTrailingZero() ;
	}

	return this ;
} ;



StringNumber.prototype.round = function( decimalPlace = 0 , type = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , type ) ;
} ;



StringNumber.prototype.floor = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , -1 ) ;
} ;



StringNumber.prototype.ceil = function( decimalPlace = 0 ) {
	var n = this.exposant + decimalPlace ;
	return this.precision( n , 1 ) ;
} ;



StringNumber.prototype.removeTrailingZero = function() {
	var i = this.digits.length - 1 ;
	while( i >= 0 && this.digits[ i ] === 0 ) { i -- ; }
	this.digits.length = i + 1 ;
} ;



const GROUP_SIZE = 3 ;

StringNumber.prototype.groupDigits = function( digits , separator , inverseOrder = false ) {
	var str = '' ,
		offset = inverseOrder ? 0 : GROUP_SIZE - ( digits.length % GROUP_SIZE ) ,
		i = 0 ,
		iMax = digits.length ;

	for ( ; i < iMax ; i ++ ) {
		str += i && ( ( i + offset ) % GROUP_SIZE === 0 ) ? separator + digits[ i ] : digits[ i ] ;
	}

	return str ;
} ;



StringNumber.prototype.appendNumerals = function( intoArray , sourceArray , start = 0 , end = sourceArray.length , leftPlace = end ) {
	//console.log( "appendNumerals:" , { intoArray , sourceArray , start , end , leftPlace } ) ;
	for ( let i = start , place = leftPlace ; i < end ; i ++ , place -- ) {
		let numerals = this.placeNumerals?.[ place ] ?? this.numerals ;
		intoArray.push( numerals[ sourceArray[ i ] ] ?? sourceArray[ i ] ) ;
	}

	return intoArray ;
} ;



StringNumber.prototype.fillZeroes = function( intoArray , count , leftPlace = count - 1 ) {
	//console.log( "fillZeroes:" , { intoArray , count , leftPlace } ) ;
	for ( let i = 0 , place = leftPlace ; i < count ; i ++ , place -- ) {
		let numerals = this.placeNumerals?.[ place ] ?? this.numerals ;
		intoArray.push( numerals[ 0 ] ?? 0 ) ;
	}

	return intoArray ;
} ;



const ROMAN_OPTIONS = {
	numeralZero: 'N' ,
	placeNumerals: [
		[ '' , 'I' , 'II' , 'III' , 'IV' , 'V' , 'VI' , 'VII' , 'VIII' , 'IX' ] ,
		[ '' , 'X' , 'XX' , 'XXX' , 'XL' , 'L' , 'LX' , 'LXX' , 'LXXX' , 'XC' ] ,
		[ '' , 'C' , 'CC' , 'CCC' , 'CD' , 'D' , 'DC' , 'DCC' , 'DCCC' , 'CM' ] ,
		[ '' , 'M' , 'MM' , 'MMM' , 'MMMM' , 'ↁ' , 'ↁↀ' , 'ↁↀↀ' , 'ↁↀↀↀ' , 'ↁↀↀↀↀ' ]
	]
} ;

const ADDITIVE_ROMAN_OPTIONS = {
	numeralZero: 'N' ,
	placeNumerals: [
		[ '' , 'I' , 'II' , 'III' , 'IIII' , 'V' , 'VI' , 'VII' , 'VIII' , 'VIIII' ] ,
		[ '' , 'X' , 'XX' , 'XXX' , 'XXXX' , 'L' , 'LX' , 'LXX' , 'LXXX' , 'LXXXX' ] ,
		[ '' , 'C' , 'CC' , 'CCC' , 'CCCC' , 'D' , 'DC' , 'DCC' , 'DCCC' , 'DCCCC' ] ,
		[ '' , 'M' , 'MM' , 'MMM' , 'MMMM' , 'ↁ' , 'ↁↀ' , 'ↁↀↀ' , 'ↁↀↀↀ' , 'ↁↀↀↀↀ' ]
	]
} ;

const APOSTROPHUS_ROMAN_OPTIONS = {
	numeralZero: 'N' ,
	placeNumerals: [
		[ '' , 'I' , 'II' , 'III' , 'IV' , 'V' , 'VI' , 'VII' , 'VIII' , 'IX' ] ,
		[ '' , 'X' , 'XX' , 'XXX' , 'XL' , 'L' , 'LX' , 'LXX' , 'LXXX' , 'XC' ] ,
		[ '' , 'C' , 'CC' , 'CCC' , 'CD' , 'D' , 'DC' , 'DCC' , 'DCCC' , 'CM' ] ,
		[ '' , 'M' , 'MM' , 'MMM' , 'MMMM' , 'IↃↃ' , 'IↃↃCIↃ' , 'IↃↃCIↃCIↃ' , 'IↃↃCIↃCIↃCIↃ' , 'IↃↃCIↃCIↃCIↃCIↃ' ] ,
		[ '' , 'CCIↃↃ' , 'CCIↃↃCCIↃↃ' , 'CCIↃↃCCIↃↃCCIↃↃ' , 'CCIↃↃCCIↃↃCCIↃↃCCIↃↃ' , 'IↃↃↃ' , 'IↃↃↃCCIↃↃ' , 'IↃↃↃCCIↃↃCCIↃↃ' , 'IↃↃↃCCIↃↃCCIↃↃCCIↃↃ' , 'IↃↃↃCCIↃↃCCIↃↃCCIↃↃCCIↃↃ' ] ,
		[ '' , 'CCCIↃↃↃ' , 'CCCIↃↃↃCCCIↃↃↃ' , 'CCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'CCCIↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' , 'IↃↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃCCCIↃↃↃ' ]
	]
} ;

StringNumber.roman = ( number , options ) => {
	options = options ? Object.assign( {} , options , ROMAN_OPTIONS ) : ROMAN_OPTIONS ;
	return new StringNumber( number , options ) ;
} ;

StringNumber.additiveRoman = ( number , options ) => {
	options = options ? Object.assign( {} , options , ADDITIVE_ROMAN_OPTIONS ) : ADDITIVE_ROMAN_OPTIONS ;
	return new StringNumber( number , options ) ;
} ;


},{}],2:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



// To solve dependency hell, we do not rely on terminal-kit anymore.
const ansi = {
	reset: '\x1b[0m' ,
	bold: '\x1b[1m' ,
	dim: '\x1b[2m' ,
	italic: '\x1b[3m' ,
	underline: '\x1b[4m' ,
	inverse: '\x1b[7m' ,

	defaultColor: '\x1b[39m' ,
	black: '\x1b[30m' ,
	red: '\x1b[31m' ,
	green: '\x1b[32m' ,
	yellow: '\x1b[33m' ,
	blue: '\x1b[34m' ,
	magenta: '\x1b[35m' ,
	cyan: '\x1b[36m' ,
	white: '\x1b[37m' ,
	grey: '\x1b[90m' ,
	gray: '\x1b[90m' ,
	brightBlack: '\x1b[90m' ,
	brightRed: '\x1b[91m' ,
	brightGreen: '\x1b[92m' ,
	brightYellow: '\x1b[93m' ,
	brightBlue: '\x1b[94m' ,
	brightMagenta: '\x1b[95m' ,
	brightCyan: '\x1b[96m' ,
	brightWhite: '\x1b[97m' ,

	defaultBgColor: '\x1b[49m' ,
	bgBlack: '\x1b[40m' ,
	bgRed: '\x1b[41m' ,
	bgGreen: '\x1b[42m' ,
	bgYellow: '\x1b[43m' ,
	bgBlue: '\x1b[44m' ,
	bgMagenta: '\x1b[45m' ,
	bgCyan: '\x1b[46m' ,
	bgWhite: '\x1b[47m' ,
	bgGrey: '\x1b[100m' ,
	bgGray: '\x1b[100m' ,
	bgBrightBlack: '\x1b[100m' ,
	bgBrightRed: '\x1b[101m' ,
	bgBrightGreen: '\x1b[102m' ,
	bgBrightYellow: '\x1b[103m' ,
	bgBrightBlue: '\x1b[104m' ,
	bgBrightMagenta: '\x1b[105m' ,
	bgBrightCyan: '\x1b[106m' ,
	bgBrightWhite: '\x1b[107m'
} ;

module.exports = ansi ;



ansi.fgColor = {
	defaultColor: ansi.defaultColor ,
	black: ansi.black ,
	red: ansi.red ,
	green: ansi.green ,
	yellow: ansi.yellow ,
	blue: ansi.blue ,
	magenta: ansi.magenta ,
	cyan: ansi.cyan ,
	white: ansi.white ,
	grey: ansi.grey ,
	gray: ansi.gray ,
	brightBlack: ansi.brightBlack ,
	brightRed: ansi.brightRed ,
	brightGreen: ansi.brightGreen ,
	brightYellow: ansi.brightYellow ,
	brightBlue: ansi.brightBlue ,
	brightMagenta: ansi.brightMagenta ,
	brightCyan: ansi.brightCyan ,
	brightWhite: ansi.brightWhite
} ;



ansi.bgColor = {
	defaultColor: ansi.defaultBgColor ,
	black: ansi.bgBlack ,
	red: ansi.bgRed ,
	green: ansi.bgGreen ,
	yellow: ansi.bgYellow ,
	blue: ansi.bgBlue ,
	magenta: ansi.bgMagenta ,
	cyan: ansi.bgCyan ,
	white: ansi.bgWhite ,
	grey: ansi.bgGrey ,
	gray: ansi.bgGray ,
	brightBlack: ansi.bgBrightBlack ,
	brightRed: ansi.bgBrightRed ,
	brightGreen: ansi.bgBrightGreen ,
	brightYellow: ansi.bgBrightYellow ,
	brightBlue: ansi.bgBrightBlue ,
	brightMagenta: ansi.bgBrightMagenta ,
	brightCyan: ansi.bgBrightCyan ,
	brightWhite: ansi.bgBrightWhite
} ;



ansi.trueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[38;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



ansi.bgTrueColor = ( r , g , b ) => {
	if ( g === undefined && typeof r === 'string' ) {
		let hex = r ;
		if ( hex[ 0 ] === '#' ) { hex = hex.slice( 1 ) ; }	// Strip the # if necessary
		if ( hex.length === 3 ) { hex = hex[ 0 ] + hex[ 0 ] + hex[ 1 ] + hex[ 1 ] + hex[ 2 ] + hex[ 2 ] ; }
		r = parseInt( hex.slice( 0 , 2 ) , 16 ) || 0 ;
		g = parseInt( hex.slice( 2 , 4 ) , 16 ) || 0 ;
		b = parseInt( hex.slice( 4 , 6 ) , 16 ) || 0 ;
	}

	return '\x1b[48;2;' + r + ';' + g + ';' + b + 'm' ;
} ;



const ANSI_CODES = {
	'0': null ,

	'1': { bold: true } ,
	'2': { dim: true } ,
	'22': { bold: false , dim: false } ,
	'3': { italic: true } ,
	'23': { italic: false } ,
	'4': { underline: true } ,
	'24': { underline: false } ,
	'5': { blink: true } ,
	'25': { blink: false } ,
	'7': { inverse: true } ,
	'27': { inverse: false } ,
	'8': { hidden: true } ,
	'28': { hidden: false } ,
	'9': { strike: true } ,
	'29': { strike: false } ,

	'30': { color: 0 } ,
	'31': { color: 1 } ,
	'32': { color: 2 } ,
	'33': { color: 3 } ,
	'34': { color: 4 } ,
	'35': { color: 5 } ,
	'36': { color: 6 } ,
	'37': { color: 7 } ,
	//'39': { defaultColor: true } ,
	'39': { color: 'default' } ,

	'90': { color: 8 } ,
	'91': { color: 9 } ,
	'92': { color: 10 } ,
	'93': { color: 11 } ,
	'94': { color: 12 } ,
	'95': { color: 13 } ,
	'96': { color: 14 } ,
	'97': { color: 15 } ,

	'40': { bgColor: 0 } ,
	'41': { bgColor: 1 } ,
	'42': { bgColor: 2 } ,
	'43': { bgColor: 3 } ,
	'44': { bgColor: 4 } ,
	'45': { bgColor: 5 } ,
	'46': { bgColor: 6 } ,
	'47': { bgColor: 7 } ,
	//'49': { bgDefaultColor: true } ,
	'49': { bgColor: 'default' } ,

	'100': { bgColor: 8 } ,
	'101': { bgColor: 9 } ,
	'102': { bgColor: 10 } ,
	'103': { bgColor: 11 } ,
	'104': { bgColor: 12 } ,
	'105': { bgColor: 13 } ,
	'106': { bgColor: 14 } ,
	'107': { bgColor: 15 }
} ;



// Parse ANSI codes, output is compatible with the markup parser
ansi.parse = str => {
	var ansiCodes , raw , part , style , output = [] ;

	for ( [ , ansiCodes , raw ] of str.matchAll( /\x1b\[([0-9;]+)m|(.[^\x1b]*)/g ) ) {
		if ( raw ) {
			if ( output.length ) { output[ output.length - 1 ].text += raw ; }
			else { output.push( { text: raw } ) ; }
		}
		else {
			ansiCodes.split( ';' ).forEach( ansiCode => {
				style = ANSI_CODES[ ansiCode ] ;
				if ( style === undefined ) { return ; }

				if ( ! output.length || output[ output.length - 1 ].text ) {
					if ( ! style ) {
						part = { text: '' } ;
					}
					else {
						part = Object.assign( {} , part , style ) ;
						part.text = '' ;
					}

					output.push( part ) ;
				}
				else {
					// There is no text, no need to create a new part
					if ( ! style ) {
						// Replace the last part
						output[ output.length - 1 ] = { text: '' } ;
					}
					else {
						// update the last part
						Object.assign( part , style ) ;
					}
				}
			} ) ;
		}
	}

	return output ;
} ;


},{}],3:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



var camel = {} ;
module.exports = camel ;



// Transform alphanum separated by underscore or minus to camel case
camel.toCamelCase = function( str , preserveUpperCase = false , initialUpperCase = false ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	return str.replace(
		/(?:^[\s_-]*|([\s_-]+))(([^\s_-]?)([^\s_-]*))/g ,
		( match , isNotFirstWord , word , firstLetter , endOfWord ) => {
			if ( preserveUpperCase ) {
				if ( ! isNotFirstWord && ! initialUpperCase ) { return word ; }
				if ( ! firstLetter ) { return '' ; }
				return firstLetter.toUpperCase() + endOfWord ;
			}

			if ( ! isNotFirstWord && ! initialUpperCase ) { return word.toLowerCase() ; }
			if ( ! firstLetter ) { return '' ; }
			return firstLetter.toUpperCase() + endOfWord.toLowerCase() ;
		}
	) ;
} ;



camel.camelCaseToSeparated = function( str , separator = ' ' , acronym = true ) {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	if ( ! acronym ) {
		return str.replace( /^([A-Z])|([A-Z])/g , ( match , firstLetter , letter ) => {
			if ( firstLetter ) { return firstLetter.toLowerCase() ; }
			return separator + letter.toLowerCase() ;
		} ) ;
	}

	// (^)? and (^)? does not work, so we have to use (?:(^)|)) and (?:($)|)) to capture end or not
	return str.replace( /(?:(^)|)([A-Z]+)(?:($)|(?=[a-z]))/g , ( match , isStart , letters , isEnd ) => {
		isStart = isStart === '' ;
		isEnd = isEnd === '' ;

		var prefix = isStart ? '' : separator ;

		return letters.length === 1 ? prefix + letters.toLowerCase() :
			isEnd ? prefix + letters :
			letters.length === 2 ? prefix + letters[ 0 ].toLowerCase() + separator + letters[ 1 ].toLowerCase() :
			prefix + letters.slice( 0 , -1 ) + separator + letters.slice( -1 ).toLowerCase() ;
	} ) ;
} ;



// Transform camel case to alphanum separated by minus
camel.camelCaseToDash =
camel.camelCaseToDashed = ( str ) => camel.camelCaseToSeparated( str , '-' , false ) ;


},{}],4:[function(require,module,exports){
/*
	Book Source

	Copyright (c) 2023 Cédric Ronvel

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

"use strict" ;



const latinize = require( './latinize.js' ) ;
const english = require( './english.js' ) ;

const KEYWORD_TO_CHARLIST = require( './json-data/emoji-keyword-to-charlist.json' ) ;
const CHAR_TO_CANONICAL_NAME = require( './json-data/emoji-char-to-canonical-name.json' ) ;



const emoji = {} ;
module.exports = emoji ;



emoji.getCanonicalName = emojiChar => CHAR_TO_CANONICAL_NAME[ emojiChar ] ;



const emojiToKeywordsCache = {} ;

// Return a cached and frozen array
emoji.getKeywords = emojiChar => {
	if ( ! CHAR_TO_CANONICAL_NAME[ emojiChar ] ) { return ; }

	if ( ! emojiToKeywordsCache[ emojiChar ] ) {
		emojiToKeywordsCache[ emojiChar ] = emoji.splitIntoKeywords( CHAR_TO_CANONICAL_NAME[ emojiChar ] ) ;
		Object.freeze( emojiToKeywordsCache[ emojiChar ] ) ;
	}

	return emojiToKeywordsCache[ emojiChar ] ;
} ;



emoji.search = ( name , bestOnly = false ) => {
	var keywords = emoji.splitIntoKeywords( name ) ,
		matches = {} ,
		score ,
		bestScore = 0 ;

	for ( let keyword of keywords ) {
		if ( ! KEYWORD_TO_CHARLIST[ keyword ] ) { continue ; }

		for ( let emojiChar of KEYWORD_TO_CHARLIST[ keyword ] ) {
			if ( ! matches[ emojiChar ] ) {
				score = 1 ;
				matches[ emojiChar ] = {
					emoji: emojiChar ,
					score ,
					canonical: CHAR_TO_CANONICAL_NAME[ emojiChar ] ,
					keywords: emoji.getKeywords( emojiChar )
				} ;
			}
			else {
				score = matches[ emojiChar ].score + 1 ;
				matches[ emojiChar ].score = score ;
			}

			if ( score > bestScore ) { bestScore = score ; }
		}
	}

	var results = [ ... Object.values( matches ) ] ;
	if ( bestOnly ) { results = results.filter( e => e.score === bestScore ) ; }
	results.sort( ( a , b ) => ( b.score - a.score ) || ( a.keywords.length - b.keywords.length ) ) ;
	return results ;
} ;

emoji.searchBest = name => emoji.search( name , true ) ;
emoji.get = name => emoji.search( name , true )[ 0 ]?.emoji ;





// Internal API, exposed because it is used by the builder



emoji.simplifyName = name => {
	name = name.toLowerCase().replace( /[“”().!]/g , '' ).replace( /[ ’',]/g , '-' ).replace( /-+/g , '-' ) ;
	name = latinize( name ) ;
	return name ;
} ;



emoji.simplifyKeyword = inputKeyword => {
	var kw = inputKeyword ;
	kw = english.undoPresentParticiple( kw ) ;

	//if ( kw !== inputKeyword ) { console.log( "Changing KW:" , inputKeyword , "-->" , kw ) ; }
	return kw ;
} ;



const KEYWORD_EXCLUSION = new Set( [ 'with' , 'of' ] ) ;

emoji.splitIntoKeywords = ( name , noSimplify = false ) => {
	if ( ! noSimplify ) { name = emoji.simplifyName( name ) ; }
	var keywords = name.split( /-/g ).filter( keyword => keyword.length >= 2 && ! KEYWORD_EXCLUSION.has( keyword ) ) ;
	keywords = keywords.map( emoji.simplifyKeyword ) ;
	keywords = [ ... new Set( keywords ) ] ;	// Make them unique
	return keywords ;
} ;


},{"./english.js":5,"./json-data/emoji-char-to-canonical-name.json":10,"./json-data/emoji-keyword-to-charlist.json":11,"./latinize.js":14}],5:[function(require,module,exports){
/*
	Book Source

	Copyright (c) 2023 Cédric Ronvel

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

"use strict" ;



const english = {} ;
module.exports = english ;



const VOWELS = new Set( [ 'a' , 'e' , 'i' , 'o' , 'u' , 'y' ] ) ;
const VOWELS_ADDING_E = new Set( [ 'a' , 'i' , 'o' , 'u' ] ) ;
const CONSONANTS_AFTER_VOWEL_ADDING_E = new Set( [ 's' ] ) ;
const CONSONANTS_ADDING_E = new Set( [ 'v' ] ) ;
const CONSONANTS_NOT_ADDING_E = new Set( [ 'w' , 'x' ] ) ;
const DOUBLE_CONSONANTS_ADDING_E = new Set( [ 'cl' , 'dl' , 'gl' , 'kl' , 'nc' , 'pl' , 'tl' ] ) ;
const REDUCING_DOUBLE_CONSONANTS = new Set( [ 'd' , 'g' , 'm' , 'n' , 'p' ] ) ;
const CONSONANTS_AFTER_VOWELS_COMBO_NOT_ADDING_E = new Set( [ 'or' ] ) ;	// Last chance fix

// Remove -ing and transform to a proper verb or noun
english.undoPresentParticiple = word => {
	if ( word.endsWith( 'ing' ) && word.length >= 6 && ! word.endsWith( 'ghtning' ) ) {
		let ingSuffix = 'ing' ;
		//if ( word.endsWith( 'ling' ) ) { ingSuffix = 'ling' ; }

		let ingLen = ingSuffix.length ;

		let before = word[ word.length - ingLen - 1 ] ,
			before2 = word[ word.length - ingLen - 2 ] ,
			before3 = word[ word.length - ingLen - 3 ] ;

		if ( VOWELS.has( before ) ) {
			word = word.slice( 0 , -ingLen ) ;
		}
		else if ( VOWELS.has( before2 ) ) {
			if ( VOWELS.has( before3 ) ) {
				if ( CONSONANTS_AFTER_VOWEL_ADDING_E.has( before ) && ! CONSONANTS_AFTER_VOWELS_COMBO_NOT_ADDING_E.has( before2 + before ) ) {
					word = word.slice( 0 , -ingLen ) + 'e' ;
				}
				else {
					word = word.slice( 0 , -ingLen ) ;
				}
			}
			else if ( VOWELS_ADDING_E.has( before2 ) && ! CONSONANTS_NOT_ADDING_E.has( before ) ) {
				word = word.slice( 0 , -ingLen ) + 'e' ;
			}
			else {
				word = word.slice( 0 , -ingLen ) ;
			}
		}
		else if ( before === before2 && REDUCING_DOUBLE_CONSONANTS.has( before ) ) {
			word = word.slice( 0 , -ingLen - 1 ) ;
		}
		else if ( CONSONANTS_ADDING_E.has( before ) || DOUBLE_CONSONANTS_ADDING_E.has( before2 + before ) ) {
			word = word.slice( 0 , -ingLen ) + 'e' ;
		}
		else {
			word = word.slice( 0 , -ingLen ) ;
		}
	}

	return word ;
} ;


},{}],6:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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
	Escape collection.
*/



"use strict" ;



// From Mozilla Developper Network
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
exports.regExp = exports.regExpPattern = str => str.replace( /([.*+?^${}()|[\]/\\])/g , '\\$1' ) ;

// This replace any single $ by a double $$
exports.regExpReplacement = str => str.replace( /\$/g , '$$$$' ) ;

// Escape for string.format()
// This replace any single % by a double %%
exports.format = str => str.replace( /%/g , '%%' ) ;

exports.jsSingleQuote = str => exports.control( str ).replace( /'/g , "\\'" ) ;
exports.jsDoubleQuote = str => exports.control( str ).replace( /"/g , '\\"' ) ;

exports.shellArg = str => '\'' + str.replace( /'/g , "'\\''" ) + '\'' ;



var escapeControlMap = {
	'\r': '\\r' ,
	'\n': '\\n' ,
	'\t': '\\t' ,
	'\x7f': '\\x7f'
} ;

// Escape \r \n \t so they become readable again, escape all ASCII control character as well, using \x syntaxe
exports.control = ( str , keepNewLineAndTab = false ) => str.replace( /[\x00-\x1f\x7f]/g , match => {
	if ( keepNewLineAndTab && ( match === '\n' || match === '\t' ) ) { return match ; }
	if ( escapeControlMap[ match ] !== undefined ) { return escapeControlMap[ match ] ; }
	var hex = match.charCodeAt( 0 ).toString( 16 ) ;
	if ( hex.length % 2 ) { hex = '0' + hex ; }
	return '\\x' + hex ;
} ) ;



var escapeHtmlMap = {
	'&': '&amp;' ,
	'<': '&lt;' ,
	'>': '&gt;' ,
	'"': '&quot;' ,
	"'": '&#039;'
} ;

// Only escape & < > so this is suited for content outside tags
exports.html = str => str.replace( /[&<>]/g , match => escapeHtmlMap[ match ] ) ;

// Escape & < > " so this is suited for content inside a double-quoted attribute
exports.htmlAttr = str => str.replace( /[&<>"]/g , match => escapeHtmlMap[ match ] ) ;

// Escape all html special characters & < > " '
exports.htmlSpecialChars = str => str.replace( /[&<>"']/g , match => escapeHtmlMap[ match ] ) ;

// Percent-encode all control chars and codepoint greater than 255 using percent encoding
exports.unicodePercentEncode = str => str.replace( /[\x00-\x1f\u0100-\uffff\x7f%]/g , match => {
	try {
		return encodeURI( match ) ;
	}
	catch ( error ) {
		// encodeURI can throw on bad surrogate pairs, but we just strip those characters
		return '' ;
	}
} ) ;

// Encode HTTP header value
exports.httpHeaderValue = str => exports.unicodePercentEncode( str ) ;


},{}],7:[function(require,module,exports){
(function (Buffer){(function (){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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



const inspect = require( './inspect.js' ).inspect ;
const inspectError = require( './inspect.js' ).inspectError ;
const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;
const unicode = require( './unicode.js' ) ;
const naturalSort = require( './naturalSort.js' ) ;
const StringNumber = require( './StringNumber.js' ) ;



/*
	%%		a single %
	%s		string
	%S		string, interpret ^ formatting
	%r		raw string: without sanitizer
	%n		natural: output the most natural representation for this type, object entries are sorted by keys
	%N		even more natural: avoid type hinting marks like bracket for array
	%f		float
	%k		number with metric system prefixes
	%e		for exponential notation (e.g. 1.23e+2)
	%K		for scientific notation (e.g. 1.23 × 10²)
	%i	%d	integer
	%u		unsigned integer
	%U		unsigned positive integer (>0)
	%P		number to (absolute) percent (e.g.: 0.75 -> 75%)
	%p		number to relative percent (e.g.: 1.25 -> +25% ; 0.75 -> -25%)
	%T		date/time display, using ISO date, or Intl module
	%t		time duration, convert ms into h min s, e.g.: 2h14min52s or 2:14:52
	%m		convert degree into degree, minutes and seconds
	%h		hexadecimal (input is a number)
	%x		hexadecimal (input is a number), force pair of symbols (e.g. 'f' -> '0f')
	%o		octal
	%b		binary
	%X		hexadecimal: convert a string into hex charcode, force pair of symbols (e.g. 'f' -> '0f')
	%z		base64
	%Z		base64url
	%I		call string-kit's inspect()
	%Y		call string-kit's inspect(), but do not inspect non-enumerable
	%O		object (like inspect, but with ultra minimal options)
	%E		call string-kit's inspectError()
	%J		JSON.stringify()
	%v		roman numerals, additive variant (e.g. 4 is IIII instead of IV)
	%V		roman numerals
	%D		drop
	%F		filter function existing in the 'this' context, e.g. %[filter:%a%a]F
	%a		argument for a function

	Candidate format:
	%A		for automatic type? probably not good: it's like %n Natural
	%c		for char? (can receive a string or an integer translated into an UTF8 chars)
	%C		for currency formating?
	%B		for Buffer objects?
*/

exports.formatMethod = function( ... args ) {
	var arg ,
		str = args[ 0 ] ,
		autoIndex = 1 ,
		length = args.length ;

	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	//console.log( 'format args:' , arguments ) ;

	// /!\ each changes here should be reported on string.format.count() and string.format.hasFormatting() too /!\
	// Note: the closing bracket is optional to prevent ReDoS
	str = str.replace( /\^\[([^\]]*)]?|\^(.)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/g ,
		( match , complexMarkup , markup , doublePercent , relative , index , modeArg , mode ) => {
			var replacement , i , tmp , fn , fnArgString , argMatches , argList = [] ;

			//console.log( 'replaceArgs:' , arguments ) ;
			if ( doublePercent ) { return '%' ; }

			if ( complexMarkup ) { markup = complexMarkup ; }
			if ( markup ) {
				if ( this.noMarkup ) { return '^' + markup ; }
				return markupReplace.call( this , runtime , match , markup ) ;
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

			if ( modes[ mode ] ) {
				replacement = modes[ mode ]( arg , modeArg , this ) ;
				if ( this.argumentSanitizer && ! modes[ mode ].noSanitize ) { replacement = this.argumentSanitizer( replacement ) ; }
				if ( this.escapeMarkup && ! modes[ mode ].noEscapeMarkup ) { replacement = exports.escapeMarkup( replacement ) ; }
				if ( modeArg && ! modes[ mode ].noCommonModeArg ) { replacement = commonModeArg( replacement , modeArg ) ; }
				return replacement ;
			}

			// Function mode
			if ( mode === 'F' ) {
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
			}

			return '' ;
		}
	) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
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



exports.markupMethod = function( str ) {
	if ( typeof str !== 'string' ) {
		if ( ! str ) { str = '' ; }
		else if ( typeof str.toString === 'function' ) { str = str.toString() ; }
		else { str = '' ; }
	}

	var runtime = {
		hasMarkup: false ,
		shift: null ,
		markupStack: []
	} ;

	if ( this.parse ) {
		let markupObjects , markupObject , match , complexMarkup , markup , raw , lastChunk ,
			output = [] ;

		// Note: the closing bracket is optional to prevent ReDoS
		for ( [ match , complexMarkup , markup , raw ] of str.matchAll( /\^\[([^\]]*)]?|\^(.)|([^^]+)/g ) ) {
			if ( raw ) {
				if ( output.length ) { output[ output.length - 1 ].text += raw ; }
				else { output.push( { text: raw } ) ; }
				continue ;
			}

			if ( complexMarkup ) { markup = complexMarkup ; }
			markupObjects = markupReplace.call( this , runtime , match , markup ) ;

			if ( ! Array.isArray( markupObjects ) ) { markupObjects = [ markupObjects ] ; }

			for ( markupObject of markupObjects ) {
				lastChunk = output.length ? output[ output.length - 1 ] : null ;
				if ( typeof markupObject === 'string' ) {
					// This markup is actually a text to add to the last chunk (e.g. "^^" markup is converted to a single "^")
					if ( lastChunk ) { lastChunk.text += markupObject ; }
					else { output.push( { text: markupObject } ) ; }
				}
				else if ( ! markupObject ) {
					// Null is for a markup's style reset
					if ( lastChunk && lastChunk.text.length && Object.keys( lastChunk ).length > 1 ) {
						// If there was style and text on the last chunk, then this means that the new markup starts a new chunk
						// markupObject can be null for markup reset function, but we have to create a new chunk
						output.push( { text: '' } ) ;
					}
				}
				else {
					if ( lastChunk && lastChunk.text.length ) {
						// If there was text on the last chunk, then this means that the new markup starts a new chunk
						output.push( Object.assign( { text: '' } , ... runtime.markupStack ) ) ;
					}
					else {
						// There wasn't any text added, so append the current markup style to the current chunk
						if ( lastChunk ) { Object.assign( lastChunk , markupObject ) ; }
						else { output.push( Object.assign( { text: '' } , markupObject ) ) ; }
					}
				}
			}
		}

		return output ;
	}

	if ( this.markupReset && this.startingMarkupReset ) {
		str = ( typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ) + str ;
	}

	str = str.replace( /\^\[([^\]]*)]?|\^(.)/g , ( match , complexMarkup , markup ) => markupReplace.call( this , runtime , match , complexMarkup || markup ) ) ;

	if ( runtime.hasMarkup && this.markupReset && this.endingMarkupReset ) {
		str += typeof this.markupReset === 'function' ? this.markupReset( runtime.markupStack ) : this.markupReset ;
	}

	return str ;
} ;



// Used by both formatMethod and markupMethod
function markupReplace( runtime , match , markup ) {
	var markupTarget , key , value , replacement , colonIndex ;

	if ( markup === '^' ) { return '^' ; }

	if ( this.shiftMarkup && this.shiftMarkup[ markup ] ) {
		runtime.shift = this.shiftMarkup[ markup ] ;
		return '' ;
	}

	if ( markup.length > 1 && this.dataMarkup && ( colonIndex = markup.indexOf( ':' ) ) !== -1 ) {
		key = markup.slice( 0 , colonIndex ) ;
		markupTarget = this.dataMarkup[ key ] ;

		if ( markupTarget === undefined ) {
			if ( this.markupCatchAll === undefined ) { return '' ; }
			markupTarget = this.markupCatchAll ;
		}

		runtime.hasMarkup = true ;
		value = markup.slice( colonIndex + 1 ) ;

		if ( typeof markupTarget === 'function' ) {
			replacement = markupTarget( runtime.markupStack , key , value ) ;
			// method should manage markup stack themselves
		}
		else {
			replacement = { [ markupTarget ]: value } ;
			stackMarkup( runtime , replacement ) ;
		}

		return replacement ;
	}

	if ( runtime.shift ) {
		markupTarget = this.shiftedMarkup?.[ runtime.shift ]?.[ markup ] ;
		runtime.shift = null ;
	}
	else {
		markupTarget = this.markup?.[ markup ] ;
	}

	if ( markupTarget === undefined ) {
		if ( this.markupCatchAll === undefined ) { return '' ; }
		markupTarget = this.markupCatchAll ;
	}

	runtime.hasMarkup = true ;

	if ( typeof markupTarget === 'function' ) {
		replacement = markupTarget( runtime.markupStack , markup ) ;
		// method should manage markup stack themselves
	}
	else {
		replacement = markupTarget ;
		stackMarkup( runtime , replacement ) ;
	}

	return replacement ;
}



// internal method for markupReplace()
function stackMarkup( runtime , replacement ) {
	if ( Array.isArray( replacement ) ) {
		for ( let item of replacement ) {
			if ( item === null ) { runtime.markupStack.length = 0 ; }
			else { runtime.markupStack.push( item ) ; }
		}
	}
	else {
		if ( replacement === null ) { runtime.markupStack.length = 0 ; }
		else { runtime.markupStack.push( replacement ) ; }
	}
}



// Note: the closing bracket is optional to prevent ReDoS
exports.stripMarkup = str => str.replace( /\^\[[^\]]*]?|\^./g , match =>
	match === '^^' ? '^' :
	match === '^ ' ? ' ' :
	''
) ;

exports.escapeMarkup = str => str.replace( /\^/g , '^^' ) ;



const DEFAULT_FORMATTER = {
	argumentSanitizer: str => escape.control( str , true ) ,
	extraArguments: true ,
	color: false ,
	noMarkup: false ,
	escapeMarkup: false ,
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
	} ,
	dataMarkup: {
		fg: ( markupStack , key , value ) => {
			var str = ansi.fgColor[ value ] || ansi.trueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		} ,
		bg: ( markupStack , key , value ) => {
			var str = ansi.bgColor[ value ] || ansi.bgTrueColor( value ) ;
			markupStack.push( str ) ;
			return str ;
		}
	} ,
	markupCatchAll: ( markupStack , key , value ) => {
		var str = '' ;

		if ( value === undefined ) {
			if ( key[ 0 ] === '#' ) {
				str = ansi.trueColor( key ) ;
			}
			else if ( typeof ansi[ key ] === 'string' ) {
				str = ansi[ key ] ;
			}
		}

		markupStack.push( str ) ;
		return str ;
	}
} ;

// Aliases
DEFAULT_FORMATTER.dataMarkup.color = DEFAULT_FORMATTER.dataMarkup.c = DEFAULT_FORMATTER.dataMarkup.fgColor = DEFAULT_FORMATTER.dataMarkup.fg ;
DEFAULT_FORMATTER.dataMarkup.bgColor = DEFAULT_FORMATTER.dataMarkup.bg ;



exports.createFormatter = ( options ) => exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.format = exports.formatMethod.bind( DEFAULT_FORMATTER ) ;
exports.format.default = DEFAULT_FORMATTER ;

exports.formatNoMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true } ) ) ;
// For passing string to Terminal-Kit, it will interpret markup on its own
exports.formatThirdPartyMarkup = exports.formatMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , { noMarkup: true , escapeMarkup: true } ) ) ;

exports.createMarkup = ( options ) => exports.markupMethod.bind( Object.assign( {} , DEFAULT_FORMATTER , options ) ) ;
exports.markup = exports.markupMethod.bind( DEFAULT_FORMATTER ) ;



// Count the number of parameters needed for this string
exports.format.count = function( str , noMarkup = false ) {
	var markup , index , relative , autoIndex = 1 , maxIndex = 0 ;

	if ( typeof str !== 'string' ) { return 0 ; }

	// This regex differs slightly from the main regex: we do not count '%%' and %F is excluded
	// Note: the closing bracket is optional to prevent ReDoS
	var regexp = noMarkup ?
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]/g :
		/%([+-]?)([0-9]*)(?:\[[^\]]*\])?[a-zA-EG-Z]|(\^\[[^\]]*]?|\^.)/g ;

	for ( [ , relative , index , markup ] of str.matchAll( regexp ) ) {
		if ( markup ) { continue ; }

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
exports.format.hasFormatting = function( str ) {
	if ( str.search( /\^(.?)|(%%)|%([+-]?)([0-9]*)(?:\[([^\]]*)\])?([a-zA-Z])/ ) !== -1 ) { return true ; }
	return false ;
} ;



// --- Format MODES ---

const modes = {} ;
exports.format.modes = modes ;	// <-- expose modes, used by Babel-Tower for String Kit interop'



// string
modes.s = ( arg , modeArg ) => {
	var subModes = stringModeArg( modeArg ) ;

	if ( typeof arg === 'string' ) { return arg ; }
	if ( arg === null || arg === undefined || arg === false ) { return subModes.empty ? '' : '(' + arg + ')' ; }
	if ( arg === true ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
	return '(' + arg + ')' ;
} ;

modes.r = arg => modes.s( arg ) ;
modes.r.noSanitize = true ;



// string, interpret ^ formatting
modes.S = ( arg , modeArg , options ) => {
	var subModes = stringModeArg( modeArg ) ;

	// We do the sanitizing part on our own
	var interpret = options.escapeMarkup ? str => ( options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) :
		str => exports.markupMethod.call( options , options.argumentSanitizer ? options.argumentSanitizer( str ) : str ) ;

	if ( typeof arg === 'string' ) { return interpret( arg ) ; }
	if ( arg === null || arg === undefined || arg === false ) { return subModes.empty ? '' : '(' + arg + ')' ; }
	if ( arg === true ) { return '(' + arg + ')' ; }
	if ( typeof arg === 'number' ) { return '' + arg ; }
	if ( typeof arg.toString === 'function' ) { return interpret( arg.toString() ) ; }
	return interpret( '(' + arg + ')' ) ;
} ;

modes.S.noSanitize = true ;
modes.S.noEscapeMarkup = true ;
modes.S.noCommonModeArg = true ;



// natural (WIP)
modes.N = ( arg , modeArg ) => genericNaturalMode( arg , modeArg , false ) ;
modes.n = ( arg , modeArg ) => genericNaturalMode( arg , modeArg , true ) ;



// float
modes.f = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.f.noSanitize = true ;



// roman numeral, additive variant
modes.v = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = StringNumber.additiveRoman( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.v.noSanitize = true ;



// roman numeral
modes.V = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = StringNumber.roman( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.V.noSanitize = true ;



// absolute percent
modes.P = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg *= 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) + '%' ;
} ;

modes.P.noSanitize = true ;



// relative percent
modes.p = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	arg = ( arg - 1 ) * 100 ;

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	// Force rounding to zero by default
	if ( subModes.rounding !== null || ! subModes.precision ) { sn.round( subModes.rounding || 0 ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	// 4th argument force a '+' sign
	return sn.toNoExpString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal , true ) + '%' ;
} ;

modes.p.noSanitize = true ;



// metric system
modes.k = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '0' ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	// Default to 3 numbers precision
	if ( subModes.precision || subModes.rounding === null ) { sn.precision( subModes.precision || 3 ) ; }

	return sn.toMetricString( subModes.leftPadding , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
} ;

modes.k.noSanitize = true ;



// exponential notation, a.k.a. "E notation" (e.g. 1.23e+2)
modes.e = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toExponential() ;
} ;

modes.e.noSanitize = true ;



// scientific notation (e.g. 1.23 × 10²)
modes.K = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { arg = 0 ; }

	var subModes = floatModeArg( modeArg ) ,
		sn = new StringNumber( arg , { decimalSeparator: '.' , groupSeparator: subModes.groupSeparator } ) ;

	if ( subModes.rounding !== null ) { sn.round( subModes.rounding ) ; }
	if ( subModes.precision ) { sn.precision( subModes.precision ) ; }

	return sn.toScientific() ;
} ;

modes.K.noSanitize = true ;



// integer
modes.d = modes.i = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
	return '0' ;
} ;

modes.i.noSanitize = true ;



// unsigned integer
modes.u = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
	return '0' ;
} ;

modes.u.noSanitize = true ;



// unsigned positive integer
modes.U = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
	return '1' ;
} ;

modes.U.noSanitize = true ;



// /!\ Should use StringNumber???
// Degree, minutes and seconds.
// Unlike %t which receive ms, here the input is in degree.
modes.m = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var minus = '' ;
	if ( arg < 0 ) { minus = '-' ; arg = -arg ; }

	var degrees = epsilonFloor( arg ) ,
		frac = arg - degrees ;

	if ( ! frac ) { return minus + degrees + '°' ; }

	var minutes = epsilonFloor( frac * 60 ) ,
		seconds = epsilonFloor( frac * 3600 - minutes * 60 ) ;

	if ( seconds ) {
		return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' + ( '' + seconds ).padStart( 2 , '0' ) + '″' ;
	}

	return minus + degrees + '°' + ( '' + minutes ).padStart( 2 , '0' ) + '′' ;

} ;

modes.m.noSanitize = true ;



// Date/time
// Minimal Date formating, only support sort of ISO ATM.
// It will be improved later.
modes.T = ( arg , modeArg ) => {
	// Always get a copy of the arg
	try {
		arg = new Date( arg ) ;
	}
	catch ( error ) {
		return '(invalid)' ;
	}

	if ( Number.isNaN( arg.getTime() ) ) {
		return '(invalid)' ;
	}

	var datePart = '' ,
		timePart = '' ,
		str = '' ,
		subModes = dateTimeModeArg( modeArg ) ,
		roundingType = subModes.roundingType ,
		forceDecimalSeparator = subModes.useAbbreviation ;

	// For instance, we only support the ISO-like type

	if ( subModes.years ) {
		if ( datePart ) { datePart += '-' ; }
		datePart += arg.getFullYear() ;
	}

	if ( subModes.months ) {
		if ( datePart ) { datePart += '-' ; }
		datePart += ( '' + ( arg.getMonth() + 1 ) ).padStart( 2 , '0' ) ;
	}

	if ( subModes.days ) {
		if ( datePart ) { datePart += '-' ; }
		datePart += ( '' + arg.getDate() ).padStart( 2 , '0' ) ;
	}

	if ( subModes.hours ) {
		if ( timePart && ! subModes.useAbbreviation ) { timePart += ':' ; }
		timePart += ( '' + arg.getHours() ).padStart( 2 , '0' ) ;
		if ( subModes.useAbbreviation ) { timePart += 'h' ; }
	}

	if ( subModes.minutes ) {
		if ( timePart && ! subModes.useAbbreviation ) { timePart += ':' ; }
		timePart += ( '' + arg.getMinutes() ).padStart( 2 , '0' ) ;
		if ( subModes.useAbbreviation ) { timePart += 'min' ; }
	}

	if ( subModes.seconds ) {
		if ( timePart && ! subModes.useAbbreviation ) { timePart += ':' ; }
		timePart += ( '' + arg.getSeconds() ).padStart( 2 , '0' ) ;
		if ( subModes.useAbbreviation ) { timePart += 's' ; }
	}

	if ( datePart ) {
		if ( str ) { str += ' ' ; }
		str += datePart ;
	}

	if ( timePart ) {
		if ( str ) { str += ' ' ; }
		str += timePart ;
	}

	return str ;
} ;

modes.T.noSanitize = true ;



// Time duration, transform ms into H:min:s
modes.t = ( arg , modeArg ) => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '(NaN)' ; }

	var h , min , s , sn , sStr ,
		sign = '' ,
		subModes = timeDurationModeArg( modeArg ) ,
		roundingType = subModes.roundingType ,
		hSeparator = subModes.useAbbreviation ? 'h' : ':' ,
		minSeparator = subModes.useAbbreviation ? 'min' : ':' ,
		sSeparator = subModes.useAbbreviation ? 's' : '.' ,
		forceDecimalSeparator = subModes.useAbbreviation ;

	s = arg / 1000 ;

	if ( s < 0 ) {
		s = -s ;
		roundingType *= -1 ;
		sign = '-' ;
	}

	if ( s < 60 && ! subModes.forceMinutes ) {
		sn = new StringNumber( s , { decimalSeparator: sSeparator , forceDecimalSeparator } ) ;
		sn.round( subModes.rounding , roundingType ) ;

		// Check if rounding has made it reach 60
		if ( sn.toNumber() < 60 ) {
			sStr = sn.toString( 1 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
			return sign + sStr ;
		}

		s = 60 ;

	}

	min = Math.floor( s / 60 ) ;
	s = s % 60 ;

	sn = new StringNumber( s , { decimalSeparator: sSeparator , forceDecimalSeparator } ) ;
	sn.round( subModes.rounding , roundingType ) ;

	// Check if rounding has made it reach 60
	if ( sn.toNumber() < 60 ) {
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}
	else {
		min ++ ;
		s = 0 ;
		sn.set( s ) ;
		sStr = sn.toString( 2 , subModes.rightPadding , subModes.rightPaddingOnlyIfDecimal ) ;
	}

	if ( min < 60 && ! subModes.forceHours ) {
		return sign + min + minSeparator + sStr ;
	}

	h = Math.floor( min / 60 ) ;
	min = min % 60 ;

	return sign + h + hSeparator + ( '' + min ).padStart( 2 , '0' ) + minSeparator + sStr ;
} ;

modes.t.noSanitize = true ;



// unsigned hexadecimal
modes.h = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
	return '0' ;
} ;

modes.h.noSanitize = true ;



// unsigned hexadecimal, force pair of symboles
modes.x = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg !== 'number' ) { return '00' ; }

	var value = '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ;

	if ( value.length % 2 ) { value = '0' + value ; }
	return value ;
} ;

modes.x.noSanitize = true ;



// unsigned octal
modes.o = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
	return '0' ;
} ;

modes.o.noSanitize = true ;



// unsigned binary
modes.b = arg => {
	if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
	if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
	return '0' ;
} ;

modes.b.noSanitize = true ;



// String to hexadecimal, force pair of symboles
modes.X = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'hex' ) ;
} ;

modes.X.noSanitize = true ;



// base64
modes.z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ) ;
} ;



// base64url
modes.Z = arg => {
	if ( typeof arg === 'string' ) { arg = Buffer.from( arg ) ; }
	else if ( ! Buffer.isBuffer( arg ) ) { return '' ; }
	return arg.toString( 'base64' ).replace( /\+/g , '-' )
		.replace( /\//g , '_' )
		.replace( /[=]{1,2}$/g , '' ) ;
} ;



// Inspect
const I_OPTIONS = {} ;
modes.I = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , I_OPTIONS ) ;
modes.I.noSanitize = true ;



// More minimalist inspect
const Y_OPTIONS = {
	noFunc: true ,
	enumOnly: true ,
	noDescriptor: true ,
	useInspect: true ,
	useInspectPropertyBlackList: true
} ;
modes.Y = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , Y_OPTIONS ) ;
modes.Y.noSanitize = true ;



// Even more minimalist inspect
const O_OPTIONS = { minimal: true , bulletIndex: true , noMarkup: true } ;
modes.O = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , O_OPTIONS ) ;
modes.O.noSanitize = true ;



// Inspect error
const E_OPTIONS = {} ;
modes.E = ( arg , modeArg , options ) => genericInspectMode( arg , modeArg , options , E_OPTIONS , true ) ;
modes.E.noSanitize = true ;



// JSON
modes.J = arg => arg === undefined ? 'null' : JSON.stringify( arg ) ;



// drop
modes.D = () => '' ;
modes.D.noSanitize = true ;



// ModeArg formats

// The format for commonModeArg
const COMMON_MODE_ARG_FORMAT_REGEX = /([a-zA-Z])(.[^a-zA-Z]*)/g ;

// The format for specific mode arg
const MODE_ARG_FORMAT_REGEX = /([a-zA-Z]|^)([^a-zA-Z]*)/g ;



// Called when there is a modeArg and the mode allow common mode arg
// CONVENTION: reserve upper-cased letters for common mode arg
function commonModeArg( str , modeArg ) {
	for ( let [ , k , v ] of modeArg.matchAll( COMMON_MODE_ARG_FORMAT_REGEX ) ) {
		if ( k === 'L' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = ' '.repeat( v - width ) + str ; }
		}
		else if ( k === 'R' ) {
			let width = unicode.width( str ) ;
			v = + v || 1 ;

			if ( width > v ) {
				str = unicode.truncateWidth( str , v - 1 ).trim() + '…' ;
				width = unicode.width( str ) ;
			}

			if ( width < v ) { str = str + ' '.repeat( v - width ) ; }
		}
	}

	return str ;
}



const FLOAT_MODES = {
	leftPadding: 1 ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: null ,
	precision: null ,
	groupSeparator: ''
} ;

// Generic number modes
function floatModeArg( modeArg ) {
	FLOAT_MODES.leftPadding = 1 ;
	FLOAT_MODES.rightPadding = 0 ;
	FLOAT_MODES.rightPaddingOnlyIfDecimal = false ;
	FLOAT_MODES.rounding = null ;
	FLOAT_MODES.precision = null ;
	FLOAT_MODES.groupSeparator = '' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'z' ) {
				// Zero-left padding
				FLOAT_MODES.leftPadding = + v ;
			}
			else if ( k === 'g' ) {
				// Group separator
				FLOAT_MODES.groupSeparator = v || ' ' ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						FLOAT_MODES.rounding = FLOAT_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						FLOAT_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						FLOAT_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
				else if ( v[ v.length - 1 ] === '.' ) {
					// Rounding before the decimal
					FLOAT_MODES.rounding = -parseInt( v.slice( 0 , -1 ) , 10 ) || 0 ;
				}
				else {
					// Precision, but only if integer
					FLOAT_MODES.precision = parseInt( v , 10 ) || null ;
				}
			}
		}
	}

	return FLOAT_MODES ;
}



const STRING_MODES = {
	empty: false
} ;

// Generic number modes
function stringModeArg( modeArg ) {
	STRING_MODES.empty = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'e' ) {
				// Empty mode:
				STRING_MODES.empty = true ;
			}
		}
	}

	return STRING_MODES ;
}



const DATE_TIME_MODES = {
	useAbbreviation: false ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	years: true ,
	months: true ,
	days: true ,
	hours: true ,
	minutes: true ,
	seconds: true
} ;

// Generic number modes
function dateTimeModeArg( modeArg ) {
	DATE_TIME_MODES.rightPadding = 0 ;
	DATE_TIME_MODES.rightPaddingOnlyIfDecimal = false ;
	DATE_TIME_MODES.rounding = 0 ;
	DATE_TIME_MODES.roundingType = -1 ;
	DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = false ;
	DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = false ;
	DATE_TIME_MODES.useAbbreviation = false ;

	var hasSelector = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'T' ) {
				DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = false ;
				DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = true ;
				hasSelector = true ;
			}
			else if ( k === 'D' ) {
				DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = true ;
				DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = false ;
				hasSelector = true ;
			}
			else if ( k === 'Y' ) {
				DATE_TIME_MODES.years = true ;
				hasSelector = true ;
			}
			else if ( k === 'M' ) {
				DATE_TIME_MODES.months = true ;
				hasSelector = true ;
			}
			else if ( k === 'd' ) {
				DATE_TIME_MODES.days = true ;
				hasSelector = true ;
			}
			else if ( k === 'h' ) {
				DATE_TIME_MODES.hours = true ;
				hasSelector = true ;
			}
			else if ( k === 'm' ) {
				DATE_TIME_MODES.minutes = true ;
				hasSelector = true ;
			}
			else if ( k === 's' ) {
				DATE_TIME_MODES.seconds = true ;
				hasSelector = true ;
			}
			else if ( k === 'r' ) {
				DATE_TIME_MODES.roundingType = 0 ;
			}
			else if ( k === 'f' ) {
				DATE_TIME_MODES.roundingType = -1 ;
			}
			else if ( k === 'c' ) {
				DATE_TIME_MODES.roundingType = 1 ;
			}
			else if ( k === 'a' ) {
				DATE_TIME_MODES.useAbbreviation = true ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						DATE_TIME_MODES.rounding = DATE_TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						DATE_TIME_MODES.rounding = DATE_TIME_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						DATE_TIME_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						DATE_TIME_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
			}
		}
	}

	if ( ! hasSelector ) {
		DATE_TIME_MODES.years = DATE_TIME_MODES.months = DATE_TIME_MODES.days = true ;
		DATE_TIME_MODES.hours = DATE_TIME_MODES.minutes = DATE_TIME_MODES.seconds = true ;
	}

	return DATE_TIME_MODES ;
}



const TIME_DURATION_MODES = {
	useAbbreviation: false ,
	rightPadding: 0 ,
	rightPaddingOnlyIfDecimal: false ,
	rounding: 0 ,
	roundingType: -1 ,	// -1: floor, 0: round, 1: ceil
	forceHours: false ,
	forceMinutes: false
} ;

// Generic number modes
function timeDurationModeArg( modeArg ) {
	TIME_DURATION_MODES.rightPadding = 0 ;
	TIME_DURATION_MODES.rightPaddingOnlyIfDecimal = false ;
	TIME_DURATION_MODES.rounding = 0 ;
	TIME_DURATION_MODES.roundingType = -1 ;
	TIME_DURATION_MODES.useAbbreviation = TIME_DURATION_MODES.forceHours = TIME_DURATION_MODES.forceMinutes = false ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'h' ) {
				TIME_DURATION_MODES.forceHours = TIME_DURATION_MODES.forceMinutes = true ;
			}
			else if ( k === 'm' ) {
				TIME_DURATION_MODES.forceMinutes = true ;
			}
			else if ( k === 'r' ) {
				TIME_DURATION_MODES.roundingType = 0 ;
			}
			else if ( k === 'f' ) {
				TIME_DURATION_MODES.roundingType = -1 ;
			}
			else if ( k === 'c' ) {
				TIME_DURATION_MODES.roundingType = 1 ;
			}
			else if ( k === 'a' ) {
				TIME_DURATION_MODES.useAbbreviation = true ;
			}
			else if ( ! k ) {
				if ( v[ 0 ] === '.' ) {
					// Rounding after the decimal
					let lv = v[ v.length - 1 ] ;

					// Zero-right padding?
					if ( lv === '!' ) {
						TIME_DURATION_MODES.rounding = TIME_DURATION_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
					}
					else if ( lv === '?' ) {
						TIME_DURATION_MODES.rounding = TIME_DURATION_MODES.rightPadding = parseInt( v.slice( 1 , -1 ) , 10 ) || 0 ;
						TIME_DURATION_MODES.rightPaddingOnlyIfDecimal = true ;
					}
					else {
						TIME_DURATION_MODES.rounding = parseInt( v.slice( 1 ) , 10 ) || 0 ;
					}
				}
			}
		}
	}

	return TIME_DURATION_MODES ;
}



// Generic Natural Mode
function genericNaturalMode( arg , modeArg , delimiters ) {
	var depthLimit = 2 ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( ! k ) {
				depthLimit = parseInt( v , 10 ) || 1 ;
			}
		}
	}

	return genericNaturalModeRecursive( arg , delimiters , depthLimit , 0 ) ;
}

function genericNaturalModeRecursive( arg , delimiters , depthLimit , depth ) {
	if ( typeof arg === 'string' ) { return arg ; }

	if ( arg === null || arg === undefined || arg === true || arg === false ) {
		return '' + arg ;
	}

	if ( typeof arg === 'number' ) {
		return modes.f( arg , '.3g ' ) ;
	}

	if ( arg instanceof Set ) { arg = [ ... arg ] ; }

	if ( Array.isArray( arg ) ) {
		if ( depth >= depthLimit ) { return '[...]' ; }

		arg = arg.map( e => genericNaturalModeRecursive( e , true , depthLimit , depth + 1 ) ) ;

		if ( delimiters ) { return '[' + arg.join( ',' ) + ']' ; }
		return arg.join( ', ' ) ;
	}

	if ( Buffer.isBuffer( arg ) ) {
		arg = [ ... arg ].map( e => {
			e = e.toString( 16 ) ;
			if ( e.length === 1 ) { e = '0' + e ; }
			return e ;
		} ) ;
		return '<' + arg.join( ' ' ) + '>' ;
	}

	var proto = Object.getPrototypeOf( arg ) ;

	if ( proto === null || proto === Object.prototype ) {
		// Plain objects
		if ( depth >= depthLimit ) { return '{...}' ; }

		arg = Object.entries( arg ).sort( naturalSort )
			.map( e => e[ 0 ] + ': ' + genericNaturalModeRecursive( e[ 1 ] , true , depthLimit , depth + 1 ) ) ;

		if ( delimiters ) { return '{' + arg.join( ', ' ) + '}' ; }
		return arg.join( ', ' ) ;
	}

	if ( typeof arg.inspect === 'function' ) { return arg.inspect() ; }
	if ( typeof arg.toString === 'function' ) { return arg.toString() ; }

	return '(' + arg + ')' ;
}



// Generic inspect
function genericInspectMode( arg , modeArg , options , modeOptions , isInspectError = false ) {
	var outputMaxLength ,
		maxLength ,
		depth = 3 ,
		style = options && options.color ? 'color' : 'none' ;

	if ( modeArg ) {
		for ( let [ , k , v ] of modeArg.matchAll( MODE_ARG_FORMAT_REGEX ) ) {
			if ( k === 'c' ) {
				if ( v === '+' ) { style = 'color' ; }
				else if ( v === '-' ) { style = 'none' ; }
			}
			else if ( k === 'i' ) {
				style = 'inline' ;
			}
			else if ( k === 'l' ) {
				// total output max length
				outputMaxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( k === 's' ) {
				// string max length
				maxLength = parseInt( v , 10 ) || undefined ;
			}
			else if ( ! k ) {
				depth = parseInt( v , 10 ) || 1 ;
			}
		}
	}

	if ( isInspectError ) {
		return inspectError( Object.assign( {
			depth , style , outputMaxLength , maxLength
		} , modeOptions ) , arg ) ;
	}

	return inspect( Object.assign( {
		depth , style , outputMaxLength , maxLength
	} , modeOptions ) , arg ) ;
}



// From math-kit module
// /!\ Should be updated with the new way the math-kit module do it!!! /!\
const EPSILON = 0.0000000001 ;
const INVERSE_EPSILON = Math.round( 1 / EPSILON ) ;

function epsilonRound( v ) {
	return Math.round( v * INVERSE_EPSILON ) / INVERSE_EPSILON ;
}

function epsilonFloor( v ) {
	return Math.floor( v + EPSILON ) ;
}

// Round with precision
function round( v , step ) {
	// use: v * ( 1 / step )
	// not: v / step
	// reason: epsilon rounding errors
	return epsilonRound( step * Math.round( v * ( 1 / step ) ) ) ;
}


}).call(this)}).call(this,require("buffer").Buffer)
},{"./StringNumber.js":1,"./ansi.js":2,"./escape.js":6,"./inspect.js":9,"./naturalSort.js":16,"./unicode.js":20,"buffer":22}],8:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;


const fuzzy = {} ;
module.exports = fuzzy ;



fuzzy.score = ( input , pattern ) => {
	if ( input === pattern ) { return 1 ; }
	if ( input.length === 0 || pattern.length === 0 ) { return 0 ; }
	//return 1 - fuzzy.levenshtein( input , pattern ) / ( pattern.length >= input.length ? pattern.length : input.length ) ;
	return Math.max( 0 , 1 - fuzzy.levenshtein( input , pattern ) / pattern.length ) ;
} ;



const DEFAULT_SCORE_LIMIT = 0 ;
const DEFAULT_TOKEN_DISPARITY_PENALTY = 0.88 ;
// deltaRate should be just above tokenDisparityPenalty
const DEFAULT_DELTA_RATE = 0.9 ;



fuzzy.bestMatch = ( input , patterns , options = {} ) => {
	var bestScore = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		i , iMax , currentScore , currentPattern ,
		bestIndex = -1 ,
		bestPattern = null ;

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentScore = fuzzy.score( input , currentPattern ) ;
		if ( currentScore === 1 ) { return options.indexOf ? i : currentPattern ; }
		if ( currentScore > bestScore ) {
			bestScore = currentScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



fuzzy.topMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , patternScores ;

	patternScores = patterns.map( ( pattern , index ) => ( { pattern , index , score: fuzzy.score( input , pattern ) } ) ) ;
	patternScores.sort( ( a , b ) => b.score - a.score ) ;

	//console.log( patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



const englishBlackList = new Set( [
	'a' , 'an' , 'the' , 'this' , 'that' , 'those' , 'some' ,
	'of' , 'in' , 'on' , 'at' ,
	'my' , 'your' , 'her' , 'his' , 'its' , 'our' , 'their'
] ) ;

function tokenize( str , blackList = englishBlackList ) {
	return str.split( /[ '"/|,:_-]+/g ).filter( s => s && ! blackList.has( s ) ) ;
}



// This is almost the same code than .topTokenMatch(): both must be in sync
fuzzy.bestTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		bestPatternScore = scoreLimit ,
		//currentPatternScores = [] ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		bestIndex = -1 ,
		bestPattern = null ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return options.indexOf ? bestIndex : bestPattern ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		//console.log( currentPattern + ': ' + currentPatternScore ) ;
		if ( currentPatternScore > bestPatternScore ) {
			bestPatternScore = currentPatternScore ;
			bestPattern = currentPattern ;
			bestIndex = i ;
		}
	}

	return options.indexOf ? bestIndex : bestPattern ;
} ;



// This is almost the same code than .bestTokenMatch(): both must be in sync
// deltaRate should be just above tokenDisparityPenalty
fuzzy.topTokenMatch = ( input , patterns , options = {} ) => {
	var scoreLimit = options.scoreLimit || DEFAULT_SCORE_LIMIT ,
		tokenDisparityPenalty = options.tokenDisparityPenalty || DEFAULT_TOKEN_DISPARITY_PENALTY ,
		deltaRate = options.deltaRate || DEFAULT_DELTA_RATE ,
		i , iMax , j , jMax , z , zMax ,
		currentPattern , currentPatternTokens , currentPatternToken , currentPatternScore ,
		currentInputToken , currentScore ,
		inputTokens = tokenize( input ) ,
		bestScore ,
		patternScores = [] ;

	//console.log( inputTokens ) ;
	if ( ! inputTokens.length || ! patterns.length ) { return [] ; }

	for ( i = 0 , iMax = patterns.length ; i < iMax ; i ++ ) {
		currentPattern = patterns[ i ] ;
		currentPatternTokens = tokenize( currentPattern ) ;
		//currentPatternScores.length = 0 ;
		currentPatternScore = 0 ;

		for ( j = 0 , jMax = inputTokens.length ; j < jMax ; j ++ ) {
			currentInputToken = inputTokens[ j ] ;
			bestScore = 0 ;

			for ( z = 0 , zMax = currentPatternTokens.length ; z < zMax ; z ++ ) {
				currentPatternToken = currentPatternTokens[ z ] ;
				currentScore = fuzzy.score( currentInputToken , currentPatternToken ) ;

				if ( currentScore > bestScore ) {
					bestScore = currentScore ;
					if ( currentScore === 1 ) { break ; }
				}
			}

			//currentPatternScores[ j ] = bestScore ;
			currentPatternScore += bestScore ;
		}

		//currentPatternScore = Math.hypot( ... currentPatternScores ) ;
		currentPatternScore /= inputTokens.length ;

		// Apply a small penalty if there isn't enough tokens
		if ( inputTokens.length !== currentPatternTokens.length ) {
			currentPatternScore *= tokenDisparityPenalty ** Math.abs( currentPatternTokens.length - inputTokens.length ) ;
		}

		patternScores.push( { pattern: currentPattern , index: i , score: currentPatternScore } ) ;
	}

	patternScores.sort( ( a , b ) => b.score - a.score ) ;
	//console.log( "Before truncating:" , patternScores ) ;

	if ( patternScores[ 0 ].score <= scoreLimit ) { return [] ; }
	scoreLimit = Math.max( scoreLimit , patternScores[ 0 ].score * deltaRate ) ;

	for ( i = 1 , iMax = patternScores.length ; i < iMax ; i ++ ) {
		if ( patternScores[ i ].score < scoreLimit ) {
			patternScores.length = i ;
			break ;
		}
	}

	//console.log( "After truncating:" , patternScores ) ;

	return options.indexOf ?
		patternScores.map( e => e.index ) :
		patternScores.map( e => e.pattern ) ;
} ;



// The .levenshtein() function is derivated from https://github.com/sindresorhus/leven by Sindre Sorhus (MIT License)
const _tracker = [] ;
const _leftCharCodeCache = [] ;

fuzzy.levenshtein = ( left , right ) => {
	if ( left === right ) { return 0 ; }

	// Swapping the strings if `a` is longer than `b` so we know which one is the
	// shortest & which one is the longest
	if ( left.length > right.length ) {
		let swap = left ;
		left = right ;
		right = swap ;
	}

	let leftLength = left.length ;
	let rightLength = right.length ;

	// Performing suffix trimming:
	// We can linearly drop suffix common to both strings since they
	// don't increase distance at all
	while ( leftLength > 0 && ( left.charCodeAt( leftLength - 1 ) === right.charCodeAt( rightLength - 1 ) ) ) {
		leftLength -- ;
		rightLength -- ;
	}

	// Performing prefix trimming
	// We can linearly drop prefix common to both strings since they
	// don't increase distance at all
	let start = 0 ;

	while ( start < leftLength && ( left.charCodeAt( start ) === right.charCodeAt( start ) ) ) {
		start ++ ;
	}

	leftLength -= start ;
	rightLength -= start ;

	if ( leftLength === 0 ) { return rightLength ; }

	let rightCharCode ;
	let result ;
	let temp ;
	let temp2 ;
	let i = 0 ;
	let j = 0 ;

	while ( i < leftLength ) {
		_leftCharCodeCache[ i ] = left.charCodeAt( start + i ) ;
		_tracker[ i ] = ++ i ;
	}

	while ( j < rightLength ) {
		rightCharCode = right.charCodeAt( start + j ) ;
		temp = j ++ ;
		result = j ;

		for ( i = 0 ; i < leftLength ; i ++ ) {
			temp2 = rightCharCode === _leftCharCodeCache[ i ] ? temp : temp + 1 ;
			temp = _tracker[ i ] ;
			// eslint-disable-next-line no-nested-ternary
			result = _tracker[ i ] = temp > result   ?   temp2 > result ? result + 1 : temp2   :   temp2 > temp ? temp + 1 : temp2 ;
		}
	}

	return result ;
} ;


},{}],9:[function(require,module,exports){
(function (Buffer,process){(function (){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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
	Variable inspector.
*/

"use strict" ;



const escape = require( './escape.js' ) ;
const ansi = require( './ansi.js' ) ;

const EMPTY = {} ;
const TRIVIAL_CONSTRUCTOR = new Set( [ Object , Array ] ) ;



/*
	Inspect a variable, return a string ready to be displayed with console.log(), or even as an HTML output.

	Options:
		* style:
			* 'none': (default) normal output suitable for console.log() or writing in a file
			* 'inline': like 'none', but without newlines
			* 'color': colorful output suitable for terminal
			* 'html': html output
			* any object: full controle, inheriting from 'none'
		* tab: `string` override the tab of the style
		* depth: depth limit, default: 3
		* maxLength: length limit for strings, default: 250
		* outputMaxLength: length limit for the inspect output string, default: 5000
		* noFunc: do not display functions
		* noDescriptor: do not display descriptor information
		* noArrayProperty: do not display array properties
		* noIndex: do not display array indexes
		* bulletIndex: do not display array indexes, instead display a bullet: *
		* noType: do not display type and constructor
		* noTypeButConstructor: do not display type, display non-trivial constructor (not Object or Array, but all others)
		* enumOnly: only display enumerable properties
		* funcDetails: display function's details
		* proto: display object's prototype
		* sort: sort the keys
		* noMarkup: don't add Javascript/JSON markup: {}[],"
		* minimal: imply noFunc: true, noDescriptor: true, noType: true, noArrayProperty: true, enumOnly: true, proto: false and funcDetails: false.
		  Display a minimal JSON-like output
		* minimalPlusConstructor: like minimal, but output non-trivial constructor
		* protoBlackList: `Set` of blacklisted object prototype (will not recurse inside it)
		* propertyBlackList: `Set` of blacklisted property names (will not even display it)
		* useInspect: use .inspect() method when available on an object (default to false)
		* useInspectPropertyBlackList: if set and if the object to be inspected has an 'inspectPropertyBlackList' property which value is a `Set`,
		  use it like the 'propertyBlackList' option
*/

function inspect( options , variable ) {
	if ( arguments.length < 2 ) { variable = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	var runtime = { depth: 0 , ancestors: [] } ;

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }
	// Too slow:
	//else { options.style = Object.assign( {} , inspectStyle.none , options.style ) ; }

	if ( options.depth === undefined ) { options.depth = 3 ; }
	if ( options.maxLength === undefined ) { options.maxLength = 250 ; }
	if ( options.outputMaxLength === undefined ) { options.outputMaxLength = 5000 ; }

	// /!\ nofunc is deprecated
	if ( options.nofunc ) { options.noFunc = true ; }

	if ( options.minimal ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noType = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	if ( options.minimalPlusConstructor ) {
		options.noFunc = true ;
		options.noDescriptor = true ;
		options.noTypeButConstructor = true ;
		options.noArrayProperty = true ;
		options.enumOnly = true ;
		options.proto = false ;
		options.funcDetails = false ;
	}

	var str = inspect_( runtime , options , variable ) ;

	if ( str.length > options.outputMaxLength ) {
		str = options.style.truncate( str , options.outputMaxLength ) ;
	}

	return str ;
}

exports.inspect = inspect ;



function inspect_( runtime , options , variable ) {
	var i , funcName , length , proto , propertyList , isTrivialConstructor , constructor , keyIsProperty ,
		type , pre , isArray , isFunc , specialObject ,
		str = '' , key = '' , descriptorStr = '' , indent = '' ,
		descriptor , nextAncestors ;

	// Prepare things (indentation, key, descriptor, ... )

	type = typeof variable ;

	if ( runtime.depth ) {
		indent = ( options.tab ?? options.style.tab ).repeat( options.noMarkup ? runtime.depth - 1 : runtime.depth ) ;
	}

	if ( type === 'function' && options.noFunc ) { return '' ; }

	if ( runtime.key !== undefined ) {
		if ( runtime.descriptor ) {
			descriptorStr = [] ;

			if ( runtime.descriptor.error ) {
				descriptorStr = '[' + runtime.descriptor.error + ']' ;
			}
			else {
				if ( ! runtime.descriptor.configurable ) { descriptorStr.push( '-conf' ) ; }
				if ( ! runtime.descriptor.enumerable ) { descriptorStr.push( '-enum' ) ; }

				// Already displayed by runtime.forceType
				//if ( runtime.descriptor.get || runtime.descriptor.set ) { descriptorStr.push( 'getter/setter' ) ; } else
				if ( ! runtime.descriptor.writable ) { descriptorStr.push( '-w' ) ; }

				//if ( descriptorStr.length ) { descriptorStr = '(' + descriptorStr.join( ' ' ) + ')' ; }
				if ( descriptorStr.length ) { descriptorStr = descriptorStr.join( ' ' ) ; }
				else { descriptorStr = '' ; }
			}
		}

		if ( runtime.keyIsProperty ) {
			if ( ! options.noMarkup && keyNeedingQuotes( runtime.key ) ) {
				key = '"' + options.style.key( runtime.key ) + '": ' ;
			}
			else {
				key = options.style.key( runtime.key ) + ': ' ;
			}
		}
		else if ( options.bulletIndex ) {
			key = ( typeof options.bulletIndex === 'string' ? options.bulletIndex : '*' ) + ' ' ;
		}
		else if ( ! options.noIndex ) {
			key = options.style.index( runtime.key ) ;
		}

		if ( descriptorStr ) { descriptorStr = ' ' + options.style.type( descriptorStr ) ; }
	}

	pre = runtime.noPre ? '' : indent + key ;


	// Describe the current variable

	if ( variable === undefined ) {
		str += pre + options.style.constant( 'undefined' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === EMPTY ) {
		str += pre + options.style.constant( '[empty]' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === null ) {
		str += pre + options.style.constant( 'null' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === false ) {
		str += pre + options.style.constant( 'false' ) + descriptorStr + options.style.newline ;
	}
	else if ( variable === true ) {
		str += pre + options.style.constant( 'true' ) + descriptorStr + options.style.newline ;
	}
	else if ( type === 'number' ) {
		str += pre + options.style.number( variable.toString() ) +
			( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'number' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'string' ) {
		if ( variable.length > options.maxLength ) {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable.slice( 0 , options.maxLength - 1 ) ) ) + '…' + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ' - TRUNCATED)' ) ) +
				descriptorStr + options.style.newline ;
		}
		else {
			str += pre + ( options.noMarkup ? '' : '"' ) + options.style.string( escape.control( variable ) ) + ( options.noMarkup ? '' : '"' ) +
				( options.noType || options.noTypeButConstructor ? '' : ' ' + options.style.type( 'string' ) + options.style.length( '(' + variable.length + ')' ) ) +
				descriptorStr + options.style.newline ;
		}
	}
	else if ( Buffer.isBuffer( variable ) ) {
		str += pre + options.style.inspect( variable.inspect() ) +
			( options.noType ? '' : ' ' + options.style.type( 'Buffer' ) + options.style.length( '(' + variable.length + ')' ) ) +
			descriptorStr + options.style.newline ;
	}
	else if ( type === 'object' || type === 'function' ) {
		funcName = length = '' ;
		isFunc = false ;

		if ( type === 'function' ) {
			isFunc = true ;
			funcName = ' ' + options.style.funcName( ( variable.name ? variable.name : '(anonymous)' ) ) ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		isArray = false ;

		if ( Array.isArray( variable ) ) {
			isArray = true ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}

		if ( ! variable.constructor ) { constructor = '(no constructor)' ; }
		else if ( ! variable.constructor.name ) { constructor = '(anonymous)' ; }
		else { constructor = variable.constructor.name ; }

		isTrivialConstructor = ! variable.constructor || TRIVIAL_CONSTRUCTOR.has( variable.constructor ) ;

		constructor = options.style.constructorName( constructor ) ;
		proto = Object.getPrototypeOf( variable ) ;

		str += pre ;

		if ( ! options.noType && ( ! options.noTypeButConstructor || ! isTrivialConstructor ) ) {
			if ( runtime.forceType && ! options.noType && ! options.noTypeButConstructor ) {
				str += options.style.type( runtime.forceType ) ;
			}
			else if ( options.noTypeButConstructor ) {
				str += constructor ;
			}
			else {
				str += constructor + funcName + length + ' ' + options.style.type( type ) + descriptorStr ;
			}

			if ( ! isFunc || options.funcDetails ) { str += ' ' ; }	// if no funcDetails imply no space here
		}

		if ( isArray && options.noArrayProperty ) {
			propertyList = [ ... Array( variable.length ).keys() ] ;
		}
		else {
			propertyList = Object.getOwnPropertyNames( variable ) ;
		}

		if ( options.sort ) { propertyList.sort() ; }

		// Special Objects
		specialObject = specialObjectSubstitution( variable , runtime , options ) ;

		if ( options.protoBlackList && options.protoBlackList.has( proto ) ) {
			str += options.style.limit( '[skip]' ) + options.style.newline ;
		}
		else if ( specialObject !== undefined ) {
			if ( typeof specialObject === 'string' ) {
				str += '=> ' + specialObject + options.style.newline ;
			}
			else {
				str += '=> ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					specialObject
				) ;
			}
		}
		else if ( isFunc && ! options.funcDetails ) {
			str += options.style.newline ;
		}
		else if ( ! propertyList.length && ! options.proto ) {
			str += ( options.noMarkup ? '' : isArray ? '[]' : '{}' ) + options.style.newline ;
		}
		else if ( runtime.depth >= options.depth ) {
			str += options.style.limit( '[depth limit]' ) + options.style.newline ;
		}
		else if ( runtime.ancestors.indexOf( variable ) !== -1 ) {
			str += options.style.limit( '[circular]' ) + options.style.newline ;
		}
		else {
			/*
			str +=
				options.noMarkup ? ( isArray && options.noIndex && ! runtime.keyIsProperty ? '' : options.style.newline ) :
				( isArray ? '[' : '{' ) + options.style.newline ;
			//*/
			//*
			str += ( options.noMarkup ? '' : isArray ? '[' : '{'  ) + options.style.newline ;
			//*/

			// Do not use .concat() here, it doesn't works as expected with arrays...
			nextAncestors = runtime.ancestors.slice() ;
			nextAncestors.push( variable ) ;

			for ( i = 0 ; i < propertyList.length && str.length < options.outputMaxLength ; i ++ ) {
				if ( ! isArray && (
					( options.propertyBlackList && options.propertyBlackList.has( propertyList[ i ] ) )
					|| ( options.useInspectPropertyBlackList && ( variable.inspectPropertyBlackList instanceof Set ) && variable.inspectPropertyBlackList.has( propertyList[ i ] ) )
				) ) {
					//str += options.style.limit( '[skip]' ) + options.style.newline ;
					continue ;
				}

				if ( isArray && options.noArrayProperty && ! ( propertyList[ i ] in variable ) ) {
					// Hole in the array (sparse array, item deleted, ...)
					str += inspect_(
						{
							depth: runtime.depth + 1 ,
							ancestors: nextAncestors ,
							key: propertyList[ i ] ,
							keyIsProperty: false
						} ,
						options ,
						EMPTY
					) ;
				}
				else {
					try {
						descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
						// Note: descriptor can be undefined, this happens when the object is a Proxy with a bad implementation:
						// it reports that key (Object.keys()) but doesn't give the descriptor for it.

						if ( descriptor && ! descriptor.enumerable && options.enumOnly ) { continue ; }
						keyIsProperty = ! isArray || ! descriptor.enumerable || isNaN( propertyList[ i ] ) ;

						if ( ! options.noDescriptor && descriptor && ( descriptor.get || descriptor.set ) ) {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: descriptor ,
									forceType: 'getter/setter'
								} ,
								options ,
								{ get: descriptor.get , set: descriptor.set }
							) ;
						}
						else {
							str += inspect_(
								{
									depth: runtime.depth + 1 ,
									ancestors: nextAncestors ,
									key: propertyList[ i ] ,
									keyIsProperty: keyIsProperty ,
									descriptor: options.noDescriptor ? undefined : descriptor || { error: "Bad Proxy Descriptor" }
								} ,
								options ,
								variable[ propertyList[ i ] ]
							) ;
						}
					}
					catch ( error ) {
						str += inspect_(
							{
								depth: runtime.depth + 1 ,
								ancestors: nextAncestors ,
								key: propertyList[ i ] ,
								keyIsProperty: keyIsProperty ,
								descriptor: options.noDescriptor ? undefined : descriptor
							} ,
							options ,
							error
						) ;
					}
				}

				if ( i < propertyList.length - 1 ) { str += options.style.comma ; }
			}

			if ( options.proto ) {
				str += inspect_(
					{
						depth: runtime.depth + 1 ,
						ancestors: nextAncestors ,
						key: '__proto__' ,
						keyIsProperty: true
					} ,
					options ,
					proto
				) ;
			}

			str += options.noMarkup ? '' : indent + ( isArray ? ']' : '}' ) + options.style.newline ;
		}
	}


	// Finalizing


	if ( runtime.depth === 0 ) {
		if ( options.style.trim ) { str = str.trim() ; }
		if ( options.style === 'html' ) { str = escape.html( str ) ; }
	}

	return str ;
}



function keyNeedingQuotes( key ) {
	if ( ! key.length ) { return true ; }
	return false ;
}



var promiseStates = [ 'pending' , 'fulfilled' , 'rejected' ] ;



// Some special object are better written down when substituted by something else
function specialObjectSubstitution( object , runtime , options ) {
	if ( typeof object.constructor !== 'function' ) {
		// Some objects have no constructor, e.g.: Object.create(null)
		//console.error( object ) ;
		return ;
	}

	if ( object instanceof String ) {
		return object.toString() ;
	}

	if ( object instanceof RegExp ) {
		return object.toString() ;
	}

	if ( object instanceof Date ) {
		return object.toString() + ' [' + object.getTime() + ']' ;
	}

	if ( typeof Set === 'function' && object instanceof Set ) {
		// This is an ES6 'Set' Object
		return Array.from( object ) ;
	}

	if ( typeof Map === 'function' && object instanceof Map ) {
		// This is an ES6 'Map' Object
		return Array.from( object ) ;
	}

	if ( object instanceof Promise ) {
		if ( process && process.binding && process.binding( 'util' ) && process.binding( 'util' ).getPromiseDetails ) {
			let details = process.binding( 'util' ).getPromiseDetails( object ) ;
			let state =  promiseStates[ details[ 0 ] ] ;
			let str = 'Promise <' + state + '>' ;

			if ( state === 'fulfilled' ) {
				str += ' ' + inspect_(
					{
						depth: runtime.depth ,
						ancestors: runtime.ancestors ,
						noPre: true
					} ,
					options ,
					details[ 1 ]
				) ;
			}
			else if ( state === 'rejected' ) {
				if ( details[ 1 ] instanceof Error ) {
					str += ' ' + inspectError(
						{
							style: options.style ,
							noErrorStack: true
						} ,
						details[ 1 ]
					) ;
				}
				else {
					str += ' ' + inspect_(
						{
							depth: runtime.depth ,
							ancestors: runtime.ancestors ,
							noPre: true
						} ,
						options ,
						details[ 1 ]
					) ;
				}
			}

			return str ;
		}
	}

	if ( object._bsontype ) {
		// This is a MongoDB ObjectID, rather boring to display in its original form
		// due to esoteric characters that confuse both the user and the terminal displaying it.
		// Substitute it to its string representation
		return object.toString() ;
	}

	if ( options.useInspect && typeof object.inspect === 'function' ) {
		return object.inspect() ;
	}

	return ;
}



/*
	Options:
		noErrorStack: set to true if the stack should not be displayed
*/
function inspectError( options , error ) {
	var str = '' , stack , type , code ;

	if ( arguments.length < 2 ) { error = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! ( error instanceof Error ) ) {
		str += '[not an Error] ' ;

		if ( typeof error === 'string' ) {
			let maxLength = 5000 ;

			if ( error.length > maxLength ) {
				str += options.style.errorMessage( escape.control( error.slice( 0 , maxLength - 1 ) , true ) ) + '…'
					+ options.style.length( '(' + error.length + ' - TRUNCATED)' )
					+ options.style.newline ;
			}
			else {
				str += options.style.errorMessage( escape.control( error , true ) )
					+ options.style.newline ;
			}

			return str ;
		}
		else if ( ! error || typeof error !== 'object' || ! error.name || typeof error.name !== 'string' || ! error.message || typeof error.message !== 'string' ) {
			str += inspect( options , error ) ;
			return str ;
		}

		// It's an object, but it's compatible with Error, so we can move on...
	}

	if ( error.stack && ! options.noErrorStack ) { stack = inspectStack( options , error.stack ) ; }

	type = error.type || error.constructor.name ;
	code = error.code || error.name || error.errno || error.number ;

	str += options.style.errorType( type ) +
		( code ? ' [' + options.style.errorType( code ) + ']' : '' ) + ': ' ;
	str += options.style.errorMessage( error.message ) + '\n' ;

	if ( stack ) { str += options.style.errorStack( stack ) + '\n' ; }

	if ( error.from ) {
		str += options.style.newline + options.style.errorFromMessage( 'From error:' ) + options.style.newline + inspectError( options , error.from ) ;
	}

	return str ;
}

exports.inspectError = inspectError ;



function inspectStack( options , stack ) {
	if ( arguments.length < 2 ) { stack = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }

	if ( ! options.style ) { options.style = inspectStyle.none ; }
	else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }

	if ( ! stack ) { return ; }

	if ( ( options.browser || process.browser ) && stack.indexOf( '@' ) !== -1 ) {
		// Assume a Firefox-compatible stack-trace here...
		stack = stack
			.replace( /[</]*(?=@)/g , '' )	// Firefox output some WTF </</</</< stuff in its stack trace -- removing that
			.replace(
				/^\s*([^@]*)\s*@\s*([^\n]*)(?::([0-9]+):([0-9]+))?$/mg ,
				( matches , method , file , line , column ) => {
					return options.style.errorStack( '    at ' ) +
						( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
						options.style.errorStack( '(' ) +
						( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
						( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
						( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
						options.style.errorStack( ')' ) ;
				}
			) ;
	}
	else {
		stack = stack.replace( /^[^\n]*\n/ , '' ) ;
		stack = stack.replace(
			/^\s*(at)\s+(?:(?:(async|new)\s+)?([^\s:()[\]\n]+(?:\([^)]+\))?)\s)?(?:\[as ([^\s:()[\]\n]+)\]\s)?(?:\(?([^:()[\]\n]+):([0-9]+):([0-9]+)\)?)?$/mg ,
			( matches , at , keyword , method , as , file , line , column ) => {
				return options.style.errorStack( '    at ' ) +
					( keyword ? options.style.errorStackKeyword( keyword ) + ' ' : '' ) +
					( method ? options.style.errorStackMethod( method ) + ' ' : '' ) +
					( as ? options.style.errorStack( '[as ' ) + options.style.errorStackMethodAs( as ) + options.style.errorStack( '] ' ) : '' ) +
					options.style.errorStack( '(' ) +
					( file ? options.style.errorStackFile( file ) : options.style.errorStack( 'unknown' ) ) +
					( line ? options.style.errorStack( ':' ) + options.style.errorStackLine( line ) : '' ) +
					( column ? options.style.errorStack( ':' ) + options.style.errorStackColumn( column ) : '' ) +
					options.style.errorStack( ')' ) ;
			}
		) ;
	}

	return stack ;
}

exports.inspectStack = inspectStack ;



// Inspect's styles

var inspectStyle = {} ;

var inspectStyleNoop = str => str ;



inspectStyle.none = {
	trim: false ,
	tab: '    ' ,
	newline: '\n' ,
	comma: '' ,
	limit: inspectStyleNoop ,
	type: str => '<' + str + '>' ,
	constant: inspectStyleNoop ,
	funcName: inspectStyleNoop ,
	constructorName: str => '<' + str + '>' ,
	length: inspectStyleNoop ,
	key: inspectStyleNoop ,
	index: str => '[' + str + '] ' ,
	number: inspectStyleNoop ,
	inspect: inspectStyleNoop ,
	string: inspectStyleNoop ,
	errorType: inspectStyleNoop ,
	errorMessage: inspectStyleNoop ,
	errorStack: inspectStyleNoop ,
	errorStackKeyword: inspectStyleNoop ,
	errorStackMethod: inspectStyleNoop ,
	errorStackMethodAs: inspectStyleNoop ,
	errorStackFile: inspectStyleNoop ,
	errorStackLine: inspectStyleNoop ,
	errorStackColumn: inspectStyleNoop ,
	errorFromMessage: inspectStyleNoop ,
	truncate: ( str , maxLength ) => str.slice( 0 , maxLength - 1 ) + '…'
} ;



inspectStyle.inline = Object.assign( {} , inspectStyle.none , {
	trim: true ,
	tab: '' ,
	newline: ' ' ,
	comma: ', ' ,
	length: () => '' ,
	index: () => ''
	//type: () => '' ,
} ) ;



inspectStyle.color = Object.assign( {} , inspectStyle.none , {
	limit: str => ansi.bold + ansi.brightRed + str + ansi.reset ,
	type: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	constant: str => ansi.cyan + str + ansi.reset ,
	funcName: str => ansi.italic + ansi.magenta + str + ansi.reset ,
	constructorName: str => ansi.magenta + str + ansi.reset ,
	length: str => ansi.italic + ansi.brightBlack + str + ansi.reset ,
	key: str => ansi.green + str + ansi.reset ,
	index: str => ansi.blue + '[' + str + ']' + ansi.reset + ' ' ,
	number: str => ansi.cyan + str + ansi.reset ,
	inspect: str => ansi.cyan + str + ansi.reset ,
	string: str => ansi.blue + str + ansi.reset ,
	errorType: str => ansi.red + ansi.bold + str + ansi.reset ,
	errorMessage: str => ansi.red + ansi.italic + str + ansi.reset ,
	errorStack: str => ansi.brightBlack + str + ansi.reset ,
	errorStackKeyword: str => ansi.italic + ansi.bold + str + ansi.reset ,
	errorStackMethod: str => ansi.brightYellow + str + ansi.reset ,
	errorStackMethodAs: str => ansi.yellow + str + ansi.reset ,
	errorStackFile: str => ansi.brightCyan + str + ansi.reset ,
	errorStackLine: str => ansi.blue + str + ansi.reset ,
	errorStackColumn: str => ansi.magenta + str + ansi.reset ,
	errorFromMessage: str => ansi.yellow + ansi.underline + str + ansi.reset ,
	truncate: ( str , maxLength ) => {
		var trail = ansi.gray + '…' + ansi.reset ;
		str = str.slice( 0 , maxLength - trail.length ) ;

		// Search for an ansi escape sequence at the end, that could be truncated.
		// The longest one is '\x1b[107m': 6 characters.
		var lastEscape = str.lastIndexOf( '\x1b' ) ;
		if ( lastEscape >= str.length - 6 ) { str = str.slice( 0 , lastEscape ) ; }

		return str + trail ;
	}
} ) ;



inspectStyle.html = Object.assign( {} , inspectStyle.none , {
	tab: '&nbsp;&nbsp;&nbsp;&nbsp;' ,
	newline: '<br />' ,
	limit: str => '<span style="color:red">' + str + '</span>' ,
	type: str => '<i style="color:gray">' + str + '</i>' ,
	constant: str => '<span style="color:cyan">' + str + '</span>' ,
	funcName: str => '<i style="color:magenta">' + str + '</i>' ,
	constructorName: str => '<span style="color:magenta">' + str + '</span>' ,
	length: str => '<i style="color:gray">' + str + '</i>' ,
	key: str => '<span style="color:green">' + str + '</span>' ,
	index: str => '<span style="color:blue">[' + str + ']</span> ' ,
	number: str => '<span style="color:cyan">' + str + '</span>' ,
	inspect: str => '<span style="color:cyan">' + str + '</span>' ,
	string: str => '<span style="color:blue">' + str + '</span>' ,
	errorType: str => '<span style="color:red">' + str + '</span>' ,
	errorMessage: str => '<span style="color:red">' + str + '</span>' ,
	errorStack: str => '<span style="color:gray">' + str + '</span>' ,
	errorStackKeyword: str => '<i>' + str + '</i>' ,
	errorStackMethod: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackMethodAs: str => '<span style="color:yellow">' + str + '</span>' ,
	errorStackFile: str => '<span style="color:cyan">' + str + '</span>' ,
	errorStackLine: str => '<span style="color:blue">' + str + '</span>' ,
	errorStackColumn: str => '<span style="color:gray">' + str + '</span>' ,
	errorFromMessage: str => '<span style="color:yellow">' + str + '</span>'
} ) ;


}).call(this)}).call(this,{"isBuffer":require("../../../../../../opt/node-v20.11.0/lib/node_modules/browserify/node_modules/is-buffer/index.js")},require('_process'))
},{"../../../../../../opt/node-v20.11.0/lib/node_modules/browserify/node_modules/is-buffer/index.js":23,"./ansi.js":2,"./escape.js":6,"_process":24}],10:[function(require,module,exports){
module.exports={"😀":"grinning-face","😃":"grinning-face-with-big-eyes","😄":"grinning-face-with-smiling-eyes","😁":"beaming-face-with-smiling-eyes","😆":"grinning-squinting-face","😅":"grinning-face-with-sweat","🤣":"rolling-on-the-floor-laughing","😂":"face-with-tears-of-joy","🙂":"slightly-smiling-face","🙃":"upside-down-face","🫠":"melting-face","😉":"winking-face","😊":"smiling-face-with-smiling-eyes","😇":"smiling-face-with-halo","🥰":"smiling-face-with-hearts","😍":"smiling-face-with-heart-eyes","🤩":"star-struck","😘":"face-blowing-a-kiss","😗":"kissing-face","☺️":"smiling-face","😚":"kissing-face-with-closed-eyes","😙":"kissing-face-with-smiling-eyes","🥲":"smiling-face-with-tear","😋":"face-savoring-food","😛":"face-with-tongue","😜":"winking-face-with-tongue","🤪":"zany-face","😝":"squinting-face-with-tongue","🤑":"money-mouth-face","🤗":"smiling-face-with-open-hands","🤭":"face-with-hand-over-mouth","🫢":"face-with-open-eyes-and-hand-over-mouth","🫣":"face-with-peeking-eye","🤫":"shushing-face","🤔":"thinking-face","🫡":"saluting-face","🤐":"zipper-mouth-face","🤨":"face-with-raised-eyebrow","😐":"neutral-face","😑":"expressionless-face","😶":"face-without-mouth","🫥":"dotted-line-face","😶‍🌫️":"face-in-clouds","😏":"smirking-face","😒":"unamused-face","🙄":"face-with-rolling-eyes","😬":"grimacing-face","😮‍💨":"face-exhaling","🤥":"lying-face","🫨":"shaking-face","😌":"relieved-face","😔":"pensive-face","😪":"sleepy-face","🤤":"drooling-face","😴":"sleeping-face","😷":"face-with-medical-mask","🤒":"face-with-thermometer","🤕":"face-with-head-bandage","🤢":"nauseated-face","🤮":"face-vomiting","🤧":"sneezing-face","🥵":"hot-face","🥶":"cold-face","🥴":"woozy-face","😵":"face-with-crossed-out-eyes","😵‍💫":"face-with-spiral-eyes","🤯":"exploding-head","🤠":"cowboy-hat-face","🥳":"partying-face","🥸":"disguised-face","😎":"smiling-face-with-sunglasses","🤓":"nerd-face","🧐":"face-with-monocle","😕":"confused-face","🫤":"face-with-diagonal-mouth","😟":"worried-face","🙁":"slightly-frowning-face","☹️":"frowning-face","😮":"face-with-open-mouth","😯":"hushed-face","😲":"astonished-face","😳":"flushed-face","🥺":"pleading-face","🥹":"face-holding-back-tears","😦":"frowning-face-with-open-mouth","😧":"anguished-face","😨":"fearful-face","😰":"anxious-face-with-sweat","😥":"sad-but-relieved-face","😢":"crying-face","😭":"loudly-crying-face","😱":"face-screaming-in-fear","😖":"confounded-face","😣":"persevering-face","😞":"disappointed-face","😓":"downcast-face-with-sweat","😩":"weary-face","😫":"tired-face","🥱":"yawning-face","😤":"face-with-steam-from-nose","😡":"enraged-face","😠":"angry-face","🤬":"face-with-symbols-on-mouth","😈":"smiling-face-with-horns","👿":"angry-face-with-horns","💀":"skull","☠️":"skull-and-crossbones","💩":"pile-of-poo","🤡":"clown-face","👹":"ogre","👺":"goblin","👻":"ghost","👽":"alien","👾":"alien-monster","🤖":"robot","😺":"grinning-cat","😸":"grinning-cat-with-smiling-eyes","😹":"cat-with-tears-of-joy","😻":"smiling-cat-with-heart-eyes","😼":"cat-with-wry-smile","😽":"kissing-cat","🙀":"weary-cat","😿":"crying-cat","😾":"pouting-cat","🙈":"see-no-evil-monkey","🙉":"hear-no-evil-monkey","🙊":"speak-no-evil-monkey","💌":"love-letter","💘":"heart-with-arrow","💝":"heart-with-ribbon","💖":"sparkling-heart","💗":"growing-heart","💓":"beating-heart","💞":"revolving-hearts","💕":"two-hearts","💟":"heart-decoration","❣️":"heart-exclamation","💔":"broken-heart","❤️‍🔥":"heart-on-fire","❤️‍🩹":"mending-heart","❤️":"red-heart","🩷":"pink-heart","🧡":"orange-heart","💛":"yellow-heart","💚":"green-heart","💙":"blue-heart","🩵":"light-blue-heart","💜":"purple-heart","🤎":"brown-heart","🖤":"black-heart","🩶":"grey-heart","🤍":"white-heart","💋":"kiss-mark","💯":"hundred-points","💢":"anger-symbol","💥":"collision","💫":"dizzy","💦":"sweat-droplets","💨":"dashing-away","🕳️":"hole","💬":"speech-balloon","👁️‍🗨️":"eye-in-speech-bubble","🗨️":"left-speech-bubble","🗯️":"right-anger-bubble","💭":"thought-balloon","💤":"zzz","👋":"waving-hand","🤚":"raised-back-of-hand","🖐️":"hand-with-fingers-splayed","✋":"raised-hand","🖖":"vulcan-salute","🫱":"rightwards-hand","🫲":"leftwards-hand","🫳":"palm-down-hand","🫴":"palm-up-hand","🫷":"leftwards-pushing-hand","🫸":"rightwards-pushing-hand","👌":"ok-hand","🤌":"pinched-fingers","🤏":"pinching-hand","✌️":"victory-hand","🤞":"crossed-fingers","🫰":"hand-with-index-finger-and-thumb-crossed","🤟":"love-you-gesture","🤘":"sign-of-the-horns","🤙":"call-me-hand","👈":"backhand-index-pointing-left","👉":"backhand-index-pointing-right","👆":"backhand-index-pointing-up","🖕":"middle-finger","👇":"backhand-index-pointing-down","☝️":"index-pointing-up","🫵":"index-pointing-at-the-viewer","👍":"thumbs-up","👎":"thumbs-down","✊":"raised-fist","👊":"oncoming-fist","🤛":"left-facing-fist","🤜":"right-facing-fist","👏":"clapping-hands","🙌":"raising-hands","🫶":"heart-hands","👐":"open-hands","🤲":"palms-up-together","🤝":"handshake","🙏":"folded-hands","✍️":"writing-hand","💅":"nail-polish","🤳":"selfie","💪":"flexed-biceps","🦾":"mechanical-arm","🦿":"mechanical-leg","🦵":"leg","🦶":"foot","👂":"ear","🦻":"ear-with-hearing-aid","👃":"nose","🧠":"brain","🫀":"anatomical-heart","🫁":"lungs","🦷":"tooth","🦴":"bone","👀":"eyes","👁️":"eye","👅":"tongue","👄":"mouth","🫦":"biting-lip","👶":"baby","🧒":"child","👦":"boy","👧":"girl","🧑":"person","👱":"person-blond-hair","👨":"man","🧔":"person-beard","🧔‍♂️":"man-beard","🧔‍♀️":"woman-beard","👨‍🦰":"man-red-hair","👨‍🦱":"man-curly-hair","👨‍🦳":"man-white-hair","👨‍🦲":"man-bald","👩":"woman","👩‍🦰":"woman-red-hair","🧑‍🦰":"person-red-hair","👩‍🦱":"woman-curly-hair","🧑‍🦱":"person-curly-hair","👩‍🦳":"woman-white-hair","🧑‍🦳":"person-white-hair","👩‍🦲":"woman-bald","🧑‍🦲":"person-bald","👱‍♀️":"woman-blond-hair","👱‍♂️":"man-blond-hair","🧓":"older-person","👴":"old-man","👵":"old-woman","🙍":"person-frowning","🙍‍♂️":"man-frowning","🙍‍♀️":"woman-frowning","🙎":"person-pouting","🙎‍♂️":"man-pouting","🙎‍♀️":"woman-pouting","🙅":"person-gesturing-no","🙅‍♂️":"man-gesturing-no","🙅‍♀️":"woman-gesturing-no","🙆":"person-gesturing-ok","🙆‍♂️":"man-gesturing-ok","🙆‍♀️":"woman-gesturing-ok","💁":"person-tipping-hand","💁‍♂️":"man-tipping-hand","💁‍♀️":"woman-tipping-hand","🙋":"person-raising-hand","🙋‍♂️":"man-raising-hand","🙋‍♀️":"woman-raising-hand","🧏":"deaf-person","🧏‍♂️":"deaf-man","🧏‍♀️":"deaf-woman","🙇":"person-bowing","🙇‍♂️":"man-bowing","🙇‍♀️":"woman-bowing","🤦":"person-facepalming","🤦‍♂️":"man-facepalming","🤦‍♀️":"woman-facepalming","🤷":"person-shrugging","🤷‍♂️":"man-shrugging","🤷‍♀️":"woman-shrugging","🧑‍⚕️":"health-worker","👨‍⚕️":"man-health-worker","👩‍⚕️":"woman-health-worker","🧑‍🎓":"student","👨‍🎓":"man-student","👩‍🎓":"woman-student","🧑‍🏫":"teacher","👨‍🏫":"man-teacher","👩‍🏫":"woman-teacher","🧑‍⚖️":"judge","👨‍⚖️":"man-judge","👩‍⚖️":"woman-judge","🧑‍🌾":"farmer","👨‍🌾":"man-farmer","👩‍🌾":"woman-farmer","🧑‍🍳":"cook","👨‍🍳":"man-cook","👩‍🍳":"woman-cook","🧑‍🔧":"mechanic","👨‍🔧":"man-mechanic","👩‍🔧":"woman-mechanic","🧑‍🏭":"factory-worker","👨‍🏭":"man-factory-worker","👩‍🏭":"woman-factory-worker","🧑‍💼":"office-worker","👨‍💼":"man-office-worker","👩‍💼":"woman-office-worker","🧑‍🔬":"scientist","👨‍🔬":"man-scientist","👩‍🔬":"woman-scientist","🧑‍💻":"technologist","👨‍💻":"man-technologist","👩‍💻":"woman-technologist","🧑‍🎤":"singer","👨‍🎤":"man-singer","👩‍🎤":"woman-singer","🧑‍🎨":"artist","👨‍🎨":"man-artist","👩‍🎨":"woman-artist","🧑‍✈️":"pilot","👨‍✈️":"man-pilot","👩‍✈️":"woman-pilot","🧑‍🚀":"astronaut","👨‍🚀":"man-astronaut","👩‍🚀":"woman-astronaut","🧑‍🚒":"firefighter","👨‍🚒":"man-firefighter","👩‍🚒":"woman-firefighter","👮":"police-officer","👮‍♂️":"man-police-officer","👮‍♀️":"woman-police-officer","🕵️":"detective","🕵️‍♂️":"man-detective","🕵️‍♀️":"woman-detective","💂":"guard","💂‍♂️":"man-guard","💂‍♀️":"woman-guard","🥷":"ninja","👷":"construction-worker","👷‍♂️":"man-construction-worker","👷‍♀️":"woman-construction-worker","🫅":"person-with-crown","🤴":"prince","👸":"princess","👳":"person-wearing-turban","👳‍♂️":"man-wearing-turban","👳‍♀️":"woman-wearing-turban","👲":"person-with-skullcap","🧕":"woman-with-headscarf","🤵":"person-in-tuxedo","🤵‍♂️":"man-in-tuxedo","🤵‍♀️":"woman-in-tuxedo","👰":"person-with-veil","👰‍♂️":"man-with-veil","👰‍♀️":"woman-with-veil","🤰":"pregnant-woman","🫃":"pregnant-man","🫄":"pregnant-person","🤱":"breast-feeding","👩‍🍼":"woman-feeding-baby","👨‍🍼":"man-feeding-baby","🧑‍🍼":"person-feeding-baby","👼":"baby-angel","🎅":"santa-claus","🤶":"mrs-claus","🧑‍🎄":"mx-claus","🦸":"superhero","🦸‍♂️":"man-superhero","🦸‍♀️":"woman-superhero","🦹":"supervillain","🦹‍♂️":"man-supervillain","🦹‍♀️":"woman-supervillain","🧙":"mage","🧙‍♂️":"man-mage","🧙‍♀️":"woman-mage","🧚":"fairy","🧚‍♂️":"man-fairy","🧚‍♀️":"woman-fairy","🧛":"vampire","🧛‍♂️":"man-vampire","🧛‍♀️":"woman-vampire","🧜":"merperson","🧜‍♂️":"merman","🧜‍♀️":"mermaid","🧝":"elf","🧝‍♂️":"man-elf","🧝‍♀️":"woman-elf","🧞":"genie","🧞‍♂️":"man-genie","🧞‍♀️":"woman-genie","🧟":"zombie","🧟‍♂️":"man-zombie","🧟‍♀️":"woman-zombie","🧌":"troll","💆":"person-getting-massage","💆‍♂️":"man-getting-massage","💆‍♀️":"woman-getting-massage","💇":"person-getting-haircut","💇‍♂️":"man-getting-haircut","💇‍♀️":"woman-getting-haircut","🚶":"person-walking","🚶‍♂️":"man-walking","🚶‍♀️":"woman-walking","🧍":"person-standing","🧍‍♂️":"man-standing","🧍‍♀️":"woman-standing","🧎":"person-kneeling","🧎‍♂️":"man-kneeling","🧎‍♀️":"woman-kneeling","🧑‍🦯":"person-with-white-cane","👨‍🦯":"man-with-white-cane","👩‍🦯":"woman-with-white-cane","🧑‍🦼":"person-in-motorized-wheelchair","👨‍🦼":"man-in-motorized-wheelchair","👩‍🦼":"woman-in-motorized-wheelchair","🧑‍🦽":"person-in-manual-wheelchair","👨‍🦽":"man-in-manual-wheelchair","👩‍🦽":"woman-in-manual-wheelchair","🏃":"person-running","🏃‍♂️":"man-running","🏃‍♀️":"woman-running","💃":"woman-dancing","🕺":"man-dancing","🕴️":"person-in-suit-levitating","👯":"people-with-bunny-ears","👯‍♂️":"men-with-bunny-ears","👯‍♀️":"women-with-bunny-ears","🧖":"person-in-steamy-room","🧖‍♂️":"man-in-steamy-room","🧖‍♀️":"woman-in-steamy-room","🧗":"person-climbing","🧗‍♂️":"man-climbing","🧗‍♀️":"woman-climbing","🤺":"person-fencing","🏇":"horse-racing","⛷️":"skier","🏂":"snowboarder","🏌️":"person-golfing","🏌️‍♂️":"man-golfing","🏌️‍♀️":"woman-golfing","🏄":"person-surfing","🏄‍♂️":"man-surfing","🏄‍♀️":"woman-surfing","🚣":"person-rowing-boat","🚣‍♂️":"man-rowing-boat","🚣‍♀️":"woman-rowing-boat","🏊":"person-swimming","🏊‍♂️":"man-swimming","🏊‍♀️":"woman-swimming","⛹️":"person-bouncing-ball","⛹️‍♂️":"man-bouncing-ball","⛹️‍♀️":"woman-bouncing-ball","🏋️":"person-lifting-weights","🏋️‍♂️":"man-lifting-weights","🏋️‍♀️":"woman-lifting-weights","🚴":"person-biking","🚴‍♂️":"man-biking","🚴‍♀️":"woman-biking","🚵":"person-mountain-biking","🚵‍♂️":"man-mountain-biking","🚵‍♀️":"woman-mountain-biking","🤸":"person-cartwheeling","🤸‍♂️":"man-cartwheeling","🤸‍♀️":"woman-cartwheeling","🤼":"people-wrestling","🤼‍♂️":"men-wrestling","🤼‍♀️":"women-wrestling","🤽":"person-playing-water-polo","🤽‍♂️":"man-playing-water-polo","🤽‍♀️":"woman-playing-water-polo","🤾":"person-playing-handball","🤾‍♂️":"man-playing-handball","🤾‍♀️":"woman-playing-handball","🤹":"person-juggling","🤹‍♂️":"man-juggling","🤹‍♀️":"woman-juggling","🧘":"person-in-lotus-position","🧘‍♂️":"man-in-lotus-position","🧘‍♀️":"woman-in-lotus-position","🛀":"person-taking-bath","🛌":"person-in-bed","🧑‍🤝‍🧑":"people-holding-hands","👭":"women-holding-hands","👫":"woman-and-man-holding-hands","👬":"men-holding-hands","💏":"kiss","👩‍❤️‍💋‍👨":"kiss-woman-man","👨‍❤️‍💋‍👨":"kiss-man-man","👩‍❤️‍💋‍👩":"kiss-woman-woman","💑":"couple-with-heart","👩‍❤️‍👨":"couple-with-heart-woman-man","👨‍❤️‍👨":"couple-with-heart-man-man","👩‍❤️‍👩":"couple-with-heart-woman-woman","👪":"family","👨‍👩‍👦":"family-man-woman-boy","👨‍👩‍👧":"family-man-woman-girl","👨‍👩‍👧‍👦":"family-man-woman-girl-boy","👨‍👩‍👦‍👦":"family-man-woman-boy-boy","👨‍👩‍👧‍👧":"family-man-woman-girl-girl","👨‍👨‍👦":"family-man-man-boy","👨‍👨‍👧":"family-man-man-girl","👨‍👨‍👧‍👦":"family-man-man-girl-boy","👨‍👨‍👦‍👦":"family-man-man-boy-boy","👨‍👨‍👧‍👧":"family-man-man-girl-girl","👩‍👩‍👦":"family-woman-woman-boy","👩‍👩‍👧":"family-woman-woman-girl","👩‍👩‍👧‍👦":"family-woman-woman-girl-boy","👩‍👩‍👦‍👦":"family-woman-woman-boy-boy","👩‍👩‍👧‍👧":"family-woman-woman-girl-girl","👨‍👦":"family-man-boy","👨‍👦‍👦":"family-man-boy-boy","👨‍👧":"family-man-girl","👨‍👧‍👦":"family-man-girl-boy","👨‍👧‍👧":"family-man-girl-girl","👩‍👦":"family-woman-boy","👩‍👦‍👦":"family-woman-boy-boy","👩‍👧":"family-woman-girl","👩‍👧‍👦":"family-woman-girl-boy","👩‍👧‍👧":"family-woman-girl-girl","🗣️":"speaking-head","👤":"bust-in-silhouette","👥":"busts-in-silhouette","🫂":"people-hugging","👣":"footprints","🐵":"monkey-face","🐒":"monkey","🦍":"gorilla","🦧":"orangutan","🐶":"dog-face","🐕":"dog","🦮":"guide-dog","🐕‍🦺":"service-dog","🐩":"poodle","🐺":"wolf","🦊":"fox","🦝":"raccoon","🐱":"cat-face","🐈":"cat","🐈‍⬛":"black-cat","🦁":"lion","🐯":"tiger-face","🐅":"tiger","🐆":"leopard","🐴":"horse-face","🫎":"moose","🫏":"donkey","🐎":"horse","🦄":"unicorn","🦓":"zebra","🦌":"deer","🦬":"bison","🐮":"cow-face","🐂":"ox","🐃":"water-buffalo","🐄":"cow","🐷":"pig-face","🐖":"pig","🐗":"boar","🐽":"pig-nose","🐏":"ram","🐑":"ewe","🐐":"goat","🐪":"camel","🐫":"two-hump-camel","🦙":"llama","🦒":"giraffe","🐘":"elephant","🦣":"mammoth","🦏":"rhinoceros","🦛":"hippopotamus","🐭":"mouse-face","🐁":"mouse","🐀":"rat","🐹":"hamster","🐰":"rabbit-face","🐇":"rabbit","🐿️":"chipmunk","🦫":"beaver","🦔":"hedgehog","🦇":"bat","🐻":"bear","🐻‍❄️":"polar-bear","🐨":"koala","🐼":"panda","🦥":"sloth","🦦":"otter","🦨":"skunk","🦘":"kangaroo","🦡":"badger","🐾":"paw-prints","🦃":"turkey","🐔":"chicken","🐓":"rooster","🐣":"hatching-chick","🐤":"baby-chick","🐥":"front-facing-baby-chick","🐦":"bird","🐧":"penguin","🕊️":"dove","🦅":"eagle","🦆":"duck","🦢":"swan","🦉":"owl","🦤":"dodo","🪶":"feather","🦩":"flamingo","🦚":"peacock","🦜":"parrot","🪽":"wing","🐦‍⬛":"black-bird","🪿":"goose","🐸":"frog","🐊":"crocodile","🐢":"turtle","🦎":"lizard","🐍":"snake","🐲":"dragon-face","🐉":"dragon","🦕":"sauropod","🦖":"t-rex","🐳":"spouting-whale","🐋":"whale","🐬":"dolphin","🦭":"seal","🐟":"fish","🐠":"tropical-fish","🐡":"blowfish","🦈":"shark","🐙":"octopus","🐚":"spiral-shell","🪸":"coral","🪼":"jellyfish","🐌":"snail","🦋":"butterfly","🐛":"bug","🐜":"ant","🐝":"honeybee","🪲":"beetle","🐞":"lady-beetle","🦗":"cricket","🪳":"cockroach","🕷️":"spider","🕸️":"spider-web","🦂":"scorpion","🦟":"mosquito","🪰":"fly","🪱":"worm","🦠":"microbe","💐":"bouquet","🌸":"cherry-blossom","💮":"white-flower","🪷":"lotus","🏵️":"rosette","🌹":"rose","🥀":"wilted-flower","🌺":"hibiscus","🌻":"sunflower","🌼":"blossom","🌷":"tulip","🪻":"hyacinth","🌱":"seedling","🪴":"potted-plant","🌲":"evergreen-tree","🌳":"deciduous-tree","🌴":"palm-tree","🌵":"cactus","🌾":"sheaf-of-rice","🌿":"herb","☘️":"shamrock","🍀":"four-leaf-clover","🍁":"maple-leaf","🍂":"fallen-leaf","🍃":"leaf-fluttering-in-wind","🪹":"empty-nest","🪺":"nest-with-eggs","🍄":"mushroom","🍇":"grapes","🍈":"melon","🍉":"watermelon","🍊":"tangerine","🍋":"lemon","🍌":"banana","🍍":"pineapple","🥭":"mango","🍎":"red-apple","🍏":"green-apple","🍐":"pear","🍑":"peach","🍒":"cherries","🍓":"strawberry","🫐":"blueberries","🥝":"kiwi-fruit","🍅":"tomato","🫒":"olive","🥥":"coconut","🥑":"avocado","🍆":"eggplant","🥔":"potato","🥕":"carrot","🌽":"ear-of-corn","🌶️":"hot-pepper","🫑":"bell-pepper","🥒":"cucumber","🥬":"leafy-green","🥦":"broccoli","🧄":"garlic","🧅":"onion","🥜":"peanuts","🫘":"beans","🌰":"chestnut","🫚":"ginger-root","🫛":"pea-pod","🍞":"bread","🥐":"croissant","🥖":"baguette-bread","🫓":"flatbread","🥨":"pretzel","🥯":"bagel","🥞":"pancakes","🧇":"waffle","🧀":"cheese-wedge","🍖":"meat-on-bone","🍗":"poultry-leg","🥩":"cut-of-meat","🥓":"bacon","🍔":"hamburger","🍟":"french-fries","🍕":"pizza","🌭":"hot-dog","🥪":"sandwich","🌮":"taco","🌯":"burrito","🫔":"tamale","🥙":"stuffed-flatbread","🧆":"falafel","🥚":"egg","🍳":"cooking","🥘":"shallow-pan-of-food","🍲":"pot-of-food","🫕":"fondue","🥣":"bowl-with-spoon","🥗":"green-salad","🍿":"popcorn","🧈":"butter","🧂":"salt","🥫":"canned-food","🍱":"bento-box","🍘":"rice-cracker","🍙":"rice-ball","🍚":"cooked-rice","🍛":"curry-rice","🍜":"steaming-bowl","🍝":"spaghetti","🍠":"roasted-sweet-potato","🍢":"oden","🍣":"sushi","🍤":"fried-shrimp","🍥":"fish-cake-with-swirl","🥮":"moon-cake","🍡":"dango","🥟":"dumpling","🥠":"fortune-cookie","🥡":"takeout-box","🦀":"crab","🦞":"lobster","🦐":"shrimp","🦑":"squid","🦪":"oyster","🍦":"soft-ice-cream","🍧":"shaved-ice","🍨":"ice-cream","🍩":"doughnut","🍪":"cookie","🎂":"birthday-cake","🍰":"shortcake","🧁":"cupcake","🥧":"pie","🍫":"chocolate-bar","🍬":"candy","🍭":"lollipop","🍮":"custard","🍯":"honey-pot","🍼":"baby-bottle","🥛":"glass-of-milk","☕":"hot-beverage","🫖":"teapot","🍵":"teacup-without-handle","🍶":"sake","🍾":"bottle-with-popping-cork","🍷":"wine-glass","🍸":"cocktail-glass","🍹":"tropical-drink","🍺":"beer-mug","🍻":"clinking-beer-mugs","🥂":"clinking-glasses","🥃":"tumbler-glass","🫗":"pouring-liquid","🥤":"cup-with-straw","🧋":"bubble-tea","🧃":"beverage-box","🧉":"mate","🧊":"ice","🥢":"chopsticks","🍽️":"fork-and-knife-with-plate","🍴":"fork-and-knife","🥄":"spoon","🔪":"kitchen-knife","🫙":"jar","🏺":"amphora","🌍":"globe-showing-europe-africa","🌎":"globe-showing-americas","🌏":"globe-showing-asia-australia","🌐":"globe-with-meridians","🗺️":"world-map","🗾":"map-of-japan","🧭":"compass","🏔️":"snow-capped-mountain","⛰️":"mountain","🌋":"volcano","🗻":"mount-fuji","🏕️":"camping","🏖️":"beach-with-umbrella","🏜️":"desert","🏝️":"desert-island","🏞️":"national-park","🏟️":"stadium","🏛️":"classical-building","🏗️":"building-construction","🧱":"brick","🪨":"rock","🪵":"wood","🛖":"hut","🏘️":"houses","🏚️":"derelict-house","🏠":"house","🏡":"house-with-garden","🏢":"office-building","🏣":"japanese-post-office","🏤":"post-office","🏥":"hospital","🏦":"bank","🏨":"hotel","🏩":"love-hotel","🏪":"convenience-store","🏫":"school","🏬":"department-store","🏭":"factory","🏯":"japanese-castle","🏰":"castle","💒":"wedding","🗼":"tokyo-tower","🗽":"statue-of-liberty","⛪":"church","🕌":"mosque","🛕":"hindu-temple","🕍":"synagogue","⛩️":"shinto-shrine","🕋":"kaaba","⛲":"fountain","⛺":"tent","🌁":"foggy","🌃":"night-with-stars","🏙️":"cityscape","🌄":"sunrise-over-mountains","🌅":"sunrise","🌆":"cityscape-at-dusk","🌇":"sunset","🌉":"bridge-at-night","♨️":"hot-springs","🎠":"carousel-horse","🛝":"playground-slide","🎡":"ferris-wheel","🎢":"roller-coaster","💈":"barber-pole","🎪":"circus-tent","🚂":"locomotive","🚃":"railway-car","🚄":"high-speed-train","🚅":"bullet-train","🚆":"train","🚇":"metro","🚈":"light-rail","🚉":"station","🚊":"tram","🚝":"monorail","🚞":"mountain-railway","🚋":"tram-car","🚌":"bus","🚍":"oncoming-bus","🚎":"trolleybus","🚐":"minibus","🚑":"ambulance","🚒":"fire-engine","🚓":"police-car","🚔":"oncoming-police-car","🚕":"taxi","🚖":"oncoming-taxi","🚗":"automobile","🚘":"oncoming-automobile","🚙":"sport-utility-vehicle","🛻":"pickup-truck","🚚":"delivery-truck","🚛":"articulated-lorry","🚜":"tractor","🏎️":"racing-car","🏍️":"motorcycle","🛵":"motor-scooter","🦽":"manual-wheelchair","🦼":"motorized-wheelchair","🛺":"auto-rickshaw","🚲":"bicycle","🛴":"kick-scooter","🛹":"skateboard","🛼":"roller-skate","🚏":"bus-stop","🛣️":"motorway","🛤️":"railway-track","🛢️":"oil-drum","⛽":"fuel-pump","🛞":"wheel","🚨":"police-car-light","🚥":"horizontal-traffic-light","🚦":"vertical-traffic-light","🛑":"stop-sign","🚧":"construction","⚓":"anchor","🛟":"ring-buoy","⛵":"sailboat","🛶":"canoe","🚤":"speedboat","🛳️":"passenger-ship","⛴️":"ferry","🛥️":"motor-boat","🚢":"ship","✈️":"airplane","🛩️":"small-airplane","🛫":"airplane-departure","🛬":"airplane-arrival","🪂":"parachute","💺":"seat","🚁":"helicopter","🚟":"suspension-railway","🚠":"mountain-cableway","🚡":"aerial-tramway","🛰️":"satellite","🚀":"rocket","🛸":"flying-saucer","🛎️":"bellhop-bell","🧳":"luggage","⌛":"hourglass-done","⏳":"hourglass-not-done","⌚":"watch","⏰":"alarm-clock","⏱️":"stopwatch","⏲️":"timer-clock","🕰️":"mantelpiece-clock","🕛":"twelve-o-clock","🕧":"twelve-thirty","🕐":"one-o-clock","🕜":"one-thirty","🕑":"two-o-clock","🕝":"two-thirty","🕒":"three-o-clock","🕞":"three-thirty","🕓":"four-o-clock","🕟":"four-thirty","🕔":"five-o-clock","🕠":"five-thirty","🕕":"six-o-clock","🕡":"six-thirty","🕖":"seven-o-clock","🕢":"seven-thirty","🕗":"eight-o-clock","🕣":"eight-thirty","🕘":"nine-o-clock","🕤":"nine-thirty","🕙":"ten-o-clock","🕥":"ten-thirty","🕚":"eleven-o-clock","🕦":"eleven-thirty","🌑":"new-moon","🌒":"waxing-crescent-moon","🌓":"first-quarter-moon","🌔":"waxing-gibbous-moon","🌕":"full-moon","🌖":"waning-gibbous-moon","🌗":"last-quarter-moon","🌘":"waning-crescent-moon","🌙":"crescent-moon","🌚":"new-moon-face","🌛":"first-quarter-moon-face","🌜":"last-quarter-moon-face","🌡️":"thermometer","☀️":"sun","🌝":"full-moon-face","🌞":"sun-with-face","🪐":"ringed-planet","⭐":"star","🌟":"glowing-star","🌠":"shooting-star","🌌":"milky-way","☁️":"cloud","⛅":"sun-behind-cloud","⛈️":"cloud-with-lightning-and-rain","🌤️":"sun-behind-small-cloud","🌥️":"sun-behind-large-cloud","🌦️":"sun-behind-rain-cloud","🌧️":"cloud-with-rain","🌨️":"cloud-with-snow","🌩️":"cloud-with-lightning","🌪️":"tornado","🌫️":"fog","🌬️":"wind-face","🌀":"cyclone","🌈":"rainbow","🌂":"closed-umbrella","☂️":"umbrella","☔":"umbrella-with-rain-drops","⛱️":"umbrella-on-ground","⚡":"high-voltage","❄️":"snowflake","☃️":"snowman","⛄":"snowman-without-snow","☄️":"comet","🔥":"fire","💧":"droplet","🌊":"water-wave","🎃":"jack-o-lantern","🎄":"christmas-tree","🎆":"fireworks","🎇":"sparkler","🧨":"firecracker","✨":"sparkles","🎈":"balloon","🎉":"party-popper","🎊":"confetti-ball","🎋":"tanabata-tree","🎍":"pine-decoration","🎎":"japanese-dolls","🎏":"carp-streamer","🎐":"wind-chime","🎑":"moon-viewing-ceremony","🧧":"red-envelope","🎀":"ribbon","🎁":"wrapped-gift","🎗️":"reminder-ribbon","🎟️":"admission-tickets","🎫":"ticket","🎖️":"military-medal","🏆":"trophy","🏅":"sports-medal","🥇":"1st-place-medal","🥈":"2nd-place-medal","🥉":"3rd-place-medal","⚽":"soccer-ball","⚾":"baseball","🥎":"softball","🏀":"basketball","🏐":"volleyball","🏈":"american-football","🏉":"rugby-football","🎾":"tennis","🥏":"flying-disc","🎳":"bowling","🏏":"cricket-game","🏑":"field-hockey","🏒":"ice-hockey","🥍":"lacrosse","🏓":"ping-pong","🏸":"badminton","🥊":"boxing-glove","🥋":"martial-arts-uniform","🥅":"goal-net","⛳":"flag-in-hole","⛸️":"ice-skate","🎣":"fishing-pole","🤿":"diving-mask","🎽":"running-shirt","🎿":"skis","🛷":"sled","🥌":"curling-stone","🎯":"bullseye","🪀":"yo-yo","🪁":"kite","🔫":"water-pistol","🎱":"pool-8-ball","🔮":"crystal-ball","🪄":"magic-wand","🎮":"video-game","🕹️":"joystick","🎰":"slot-machine","🎲":"game-die","🧩":"puzzle-piece","🧸":"teddy-bear","🪅":"pinata","🪩":"mirror-ball","🪆":"nesting-dolls","♠️":"spade-suit","♥️":"heart-suit","♦️":"diamond-suit","♣️":"club-suit","♟️":"chess-pawn","🃏":"joker","🀄":"mahjong-red-dragon","🎴":"flower-playing-cards","🎭":"performing-arts","🖼️":"framed-picture","🎨":"artist-palette","🧵":"thread","🪡":"sewing-needle","🧶":"yarn","🪢":"knot","👓":"glasses","🕶️":"sunglasses","🥽":"goggles","🥼":"lab-coat","🦺":"safety-vest","👔":"necktie","👕":"t-shirt","👖":"jeans","🧣":"scarf","🧤":"gloves","🧥":"coat","🧦":"socks","👗":"dress","👘":"kimono","🥻":"sari","🩱":"one-piece-swimsuit","🩲":"briefs","🩳":"shorts","👙":"bikini","👚":"woman-s-clothes","🪭":"folding-hand-fan","👛":"purse","👜":"handbag","👝":"clutch-bag","🛍️":"shopping-bags","🎒":"backpack","🩴":"thong-sandal","👞":"man-s-shoe","👟":"running-shoe","🥾":"hiking-boot","🥿":"flat-shoe","👠":"high-heeled-shoe","👡":"woman-s-sandal","🩰":"ballet-shoes","👢":"woman-s-boot","🪮":"hair-pick","👑":"crown","👒":"woman-s-hat","🎩":"top-hat","🎓":"graduation-cap","🧢":"billed-cap","🪖":"military-helmet","⛑️":"rescue-worker-s-helmet","📿":"prayer-beads","💄":"lipstick","💍":"ring","💎":"gem-stone","🔇":"muted-speaker","🔈":"speaker-low-volume","🔉":"speaker-medium-volume","🔊":"speaker-high-volume","📢":"loudspeaker","📣":"megaphone","📯":"postal-horn","🔔":"bell","🔕":"bell-with-slash","🎼":"musical-score","🎵":"musical-note","🎶":"musical-notes","🎙️":"studio-microphone","🎚️":"level-slider","🎛️":"control-knobs","🎤":"microphone","🎧":"headphone","📻":"radio","🎷":"saxophone","🪗":"accordion","🎸":"guitar","🎹":"musical-keyboard","🎺":"trumpet","🎻":"violin","🪕":"banjo","🥁":"drum","🪘":"long-drum","🪇":"maracas","🪈":"flute","📱":"mobile-phone","📲":"mobile-phone-with-arrow","☎️":"telephone","📞":"telephone-receiver","📟":"pager","📠":"fax-machine","🔋":"battery","🪫":"low-battery","🔌":"electric-plug","💻":"laptop","🖥️":"desktop-computer","🖨️":"printer","⌨️":"keyboard","🖱️":"computer-mouse","🖲️":"trackball","💽":"computer-disk","💾":"floppy-disk","💿":"optical-disk","📀":"dvd","🧮":"abacus","🎥":"movie-camera","🎞️":"film-frames","📽️":"film-projector","🎬":"clapper-board","📺":"television","📷":"camera","📸":"camera-with-flash","📹":"video-camera","📼":"videocassette","🔍":"magnifying-glass-tilted-left","🔎":"magnifying-glass-tilted-right","🕯️":"candle","💡":"light-bulb","🔦":"flashlight","🏮":"red-paper-lantern","🪔":"diya-lamp","📔":"notebook-with-decorative-cover","📕":"closed-book","📖":"open-book","📗":"green-book","📘":"blue-book","📙":"orange-book","📚":"books","📓":"notebook","📒":"ledger","📃":"page-with-curl","📜":"scroll","📄":"page-facing-up","📰":"newspaper","🗞️":"rolled-up-newspaper","📑":"bookmark-tabs","🔖":"bookmark","🏷️":"label","💰":"money-bag","🪙":"coin","💴":"yen-banknote","💵":"dollar-banknote","💶":"euro-banknote","💷":"pound-banknote","💸":"money-with-wings","💳":"credit-card","🧾":"receipt","💹":"chart-increasing-with-yen","✉️":"envelope","📧":"e-mail","📨":"incoming-envelope","📩":"envelope-with-arrow","📤":"outbox-tray","📥":"inbox-tray","📦":"package","📫":"closed-mailbox-with-raised-flag","📪":"closed-mailbox-with-lowered-flag","📬":"open-mailbox-with-raised-flag","📭":"open-mailbox-with-lowered-flag","📮":"postbox","🗳️":"ballot-box-with-ballot","✏️":"pencil","✒️":"black-nib","🖋️":"fountain-pen","🖊️":"pen","🖌️":"paintbrush","🖍️":"crayon","📝":"memo","💼":"briefcase","📁":"file-folder","📂":"open-file-folder","🗂️":"card-index-dividers","📅":"calendar","📆":"tear-off-calendar","🗒️":"spiral-notepad","🗓️":"spiral-calendar","📇":"card-index","📈":"chart-increasing","📉":"chart-decreasing","📊":"bar-chart","📋":"clipboard","📌":"pushpin","📍":"round-pushpin","📎":"paperclip","🖇️":"linked-paperclips","📏":"straight-ruler","📐":"triangular-ruler","✂️":"scissors","🗃️":"card-file-box","🗄️":"file-cabinet","🗑️":"wastebasket","🔒":"locked","🔓":"unlocked","🔏":"locked-with-pen","🔐":"locked-with-key","🔑":"key","🗝️":"old-key","🔨":"hammer","🪓":"axe","⛏️":"pick","⚒️":"hammer-and-pick","🛠️":"hammer-and-wrench","🗡️":"dagger","⚔️":"crossed-swords","💣":"bomb","🪃":"boomerang","🏹":"bow-and-arrow","🛡️":"shield","🪚":"carpentry-saw","🔧":"wrench","🪛":"screwdriver","🔩":"nut-and-bolt","⚙️":"gear","🗜️":"clamp","⚖️":"balance-scale","🦯":"white-cane","🔗":"link","⛓️":"chains","🪝":"hook","🧰":"toolbox","🧲":"magnet","🪜":"ladder","⚗️":"alembic","🧪":"test-tube","🧫":"petri-dish","🧬":"dna","🔬":"microscope","🔭":"telescope","📡":"satellite-antenna","💉":"syringe","🩸":"drop-of-blood","💊":"pill","🩹":"adhesive-bandage","🩼":"crutch","🩺":"stethoscope","🩻":"x-ray","🚪":"door","🛗":"elevator","🪞":"mirror","🪟":"window","🛏️":"bed","🛋️":"couch-and-lamp","🪑":"chair","🚽":"toilet","🪠":"plunger","🚿":"shower","🛁":"bathtub","🪤":"mouse-trap","🪒":"razor","🧴":"lotion-bottle","🧷":"safety-pin","🧹":"broom","🧺":"basket","🧻":"roll-of-paper","🪣":"bucket","🧼":"soap","🫧":"bubbles","🪥":"toothbrush","🧽":"sponge","🧯":"fire-extinguisher","🛒":"shopping-cart","🚬":"cigarette","⚰️":"coffin","🪦":"headstone","⚱️":"funeral-urn","🧿":"nazar-amulet","🪬":"hamsa","🗿":"moai","🪧":"placard","🪪":"identification-card","🏧":"atm-sign","🚮":"litter-in-bin-sign","🚰":"potable-water","♿":"wheelchair-symbol","🚹":"men-s-room","🚺":"women-s-room","🚻":"restroom","🚼":"baby-symbol","🚾":"water-closet","🛂":"passport-control","🛃":"customs","🛄":"baggage-claim","🛅":"left-luggage","⚠️":"warning","🚸":"children-crossing","⛔":"no-entry","🚫":"prohibited","🚳":"no-bicycles","🚭":"no-smoking","🚯":"no-littering","🚱":"non-potable-water","🚷":"no-pedestrians","📵":"no-mobile-phones","🔞":"no-one-under-eighteen","☢️":"radioactive","☣️":"biohazard","⬆️":"up-arrow","↗️":"up-right-arrow","➡️":"right-arrow","↘️":"down-right-arrow","⬇️":"down-arrow","↙️":"down-left-arrow","⬅️":"left-arrow","↖️":"up-left-arrow","↕️":"up-down-arrow","↔️":"left-right-arrow","↩️":"right-arrow-curving-left","↪️":"left-arrow-curving-right","⤴️":"right-arrow-curving-up","⤵️":"right-arrow-curving-down","🔃":"clockwise-vertical-arrows","🔄":"counterclockwise-arrows-button","🔙":"back-arrow","🔚":"end-arrow","🔛":"on-arrow","🔜":"soon-arrow","🔝":"top-arrow","🛐":"place-of-worship","⚛️":"atom-symbol","🕉️":"om","✡️":"star-of-david","☸️":"wheel-of-dharma","☯️":"yin-yang","✝️":"latin-cross","☦️":"orthodox-cross","☪️":"star-and-crescent","☮️":"peace-symbol","🕎":"menorah","🔯":"dotted-six-pointed-star","🪯":"khanda","♈":"aries","♉":"taurus","♊":"gemini","♋":"cancer","♌":"leo","♍":"virgo","♎":"libra","♏":"scorpio","♐":"sagittarius","♑":"capricorn","♒":"aquarius","♓":"pisces","⛎":"ophiuchus","🔀":"shuffle-tracks-button","🔁":"repeat-button","🔂":"repeat-single-button","▶️":"play-button","⏩":"fast-forward-button","⏭️":"next-track-button","⏯️":"play-or-pause-button","◀️":"reverse-button","⏪":"fast-reverse-button","⏮️":"last-track-button","🔼":"upwards-button","⏫":"fast-up-button","🔽":"downwards-button","⏬":"fast-down-button","⏸️":"pause-button","⏹️":"stop-button","⏺️":"record-button","⏏️":"eject-button","🎦":"cinema","🔅":"dim-button","🔆":"bright-button","📶":"antenna-bars","🛜":"wireless","📳":"vibration-mode","📴":"mobile-phone-off","♀️":"female-sign","♂️":"male-sign","⚧️":"transgender-symbol","✖️":"multiply","➕":"plus","➖":"minus","➗":"divide","🟰":"heavy-equals-sign","♾️":"infinity","‼️":"double-exclamation-mark","⁉️":"exclamation-question-mark","❓":"red-question-mark","❔":"white-question-mark","❕":"white-exclamation-mark","❗":"red-exclamation-mark","〰️":"wavy-dash","💱":"currency-exchange","💲":"heavy-dollar-sign","⚕️":"medical-symbol","♻️":"recycling-symbol","⚜️":"fleur-de-lis","🔱":"trident-emblem","📛":"name-badge","🔰":"japanese-symbol-for-beginner","⭕":"hollow-red-circle","✅":"check-mark-button","☑️":"check-box-with-check","✔️":"check-mark","❌":"cross-mark","❎":"cross-mark-button","➰":"curly-loop","➿":"double-curly-loop","〽️":"part-alternation-mark","✳️":"eight-spoked-asterisk","✴️":"eight-pointed-star","❇️":"sparkle","©️":"copyright","®️":"registered","™️":"trade-mark","#️⃣":"keycap-#","*️⃣":"keycap-*","0️⃣":"keycap-0","1️⃣":"keycap-1","2️⃣":"keycap-2","3️⃣":"keycap-3","4️⃣":"keycap-4","5️⃣":"keycap-5","6️⃣":"keycap-6","7️⃣":"keycap-7","8️⃣":"keycap-8","9️⃣":"keycap-9","🔟":"keycap-10","🔠":"input-latin-uppercase","🔡":"input-latin-lowercase","🔢":"input-numbers","🔣":"input-symbols","🔤":"input-latin-letters","🅰️":"a-button-blood-type","🆎":"ab-button-blood-type","🅱️":"b-button-blood-type","🆑":"cl-button","🆒":"cool-button","🆓":"free-button","ℹ️":"information","🆔":"id-button","Ⓜ️":"circled-m","🆕":"new-button","🆖":"ng-button","🅾️":"o-button-blood-type","🆗":"ok-button","🅿️":"p-button","🆘":"sos-button","🆙":"up-button","🆚":"vs-button","🈁":"japanese-here-button","🈂️":"japanese-service-charge-button","🈷️":"japanese-monthly-amount-button","🈶":"japanese-not-free-of-charge-button","🈯":"japanese-reserved-button","🉐":"japanese-bargain-button","🈹":"japanese-discount-button","🈚":"japanese-free-of-charge-button","🈲":"japanese-prohibited-button","🉑":"japanese-acceptable-button","🈸":"japanese-application-button","🈴":"japanese-passing-grade-button","🈳":"japanese-vacancy-button","㊗️":"japanese-congratulations-button","㊙️":"japanese-secret-button","🈺":"japanese-open-for-business-button","🈵":"japanese-no-vacancy-button","🔴":"red-circle","🟠":"orange-circle","🟡":"yellow-circle","🟢":"green-circle","🔵":"blue-circle","🟣":"purple-circle","🟤":"brown-circle","⚫":"black-circle","⚪":"white-circle","🟥":"red-square","🟧":"orange-square","🟨":"yellow-square","🟩":"green-square","🟦":"blue-square","🟪":"purple-square","🟫":"brown-square","⬛":"black-large-square","⬜":"white-large-square","◼️":"black-medium-square","◻️":"white-medium-square","◾":"black-medium-small-square","◽":"white-medium-small-square","▪️":"black-small-square","▫️":"white-small-square","🔶":"large-orange-diamond","🔷":"large-blue-diamond","🔸":"small-orange-diamond","🔹":"small-blue-diamond","🔺":"red-triangle-pointed-up","🔻":"red-triangle-pointed-down","💠":"diamond-with-a-dot","🔘":"radio-button","🔳":"white-square-button","🔲":"black-square-button","🏁":"chequered-flag","🚩":"triangular-flag","🎌":"crossed-flags","🏴":"black-flag","🏳️":"white-flag","🏳️‍🌈":"rainbow-flag","🏳️‍⚧️":"transgender-flag","🏴‍☠️":"pirate-flag","🇦🇨":"flag-ascension-island","🇦🇩":"flag-andorra","🇦🇪":"flag-united-arab-emirates","🇦🇫":"flag-afghanistan","🇦🇬":"flag-antigua-&-barbuda","🇦🇮":"flag-anguilla","🇦🇱":"flag-albania","🇦🇲":"flag-armenia","🇦🇴":"flag-angola","🇦🇶":"flag-antarctica","🇦🇷":"flag-argentina","🇦🇸":"flag-american-samoa","🇦🇹":"flag-austria","🇦🇺":"flag-australia","🇦🇼":"flag-aruba","🇦🇽":"flag-aland-islands","🇦🇿":"flag-azerbaijan","🇧🇦":"flag-bosnia-&-herzegovina","🇧🇧":"flag-barbados","🇧🇩":"flag-bangladesh","🇧🇪":"flag-belgium","🇧🇫":"flag-burkina-faso","🇧🇬":"flag-bulgaria","🇧🇭":"flag-bahrain","🇧🇮":"flag-burundi","🇧🇯":"flag-benin","🇧🇱":"flag-st-barthelemy","🇧🇲":"flag-bermuda","🇧🇳":"flag-brunei","🇧🇴":"flag-bolivia","🇧🇶":"flag-caribbean-netherlands","🇧🇷":"flag-brazil","🇧🇸":"flag-bahamas","🇧🇹":"flag-bhutan","🇧🇻":"flag-bouvet-island","🇧🇼":"flag-botswana","🇧🇾":"flag-belarus","🇧🇿":"flag-belize","🇨🇦":"flag-canada","🇨🇨":"flag-cocos-keeling-islands","🇨🇩":"flag-congo-kinshasa","🇨🇫":"flag-central-african-republic","🇨🇬":"flag-congo-brazzaville","🇨🇭":"flag-switzerland","🇨🇮":"flag-cote-d-ivoire","🇨🇰":"flag-cook-islands","🇨🇱":"flag-chile","🇨🇲":"flag-cameroon","🇨🇳":"flag-china","🇨🇴":"flag-colombia","🇨🇵":"flag-clipperton-island","🇨🇷":"flag-costa-rica","🇨🇺":"flag-cuba","🇨🇻":"flag-cape-verde","🇨🇼":"flag-curacao","🇨🇽":"flag-christmas-island","🇨🇾":"flag-cyprus","🇨🇿":"flag-czechia","🇩🇪":"flag-germany","🇩🇬":"flag-diego-garcia","🇩🇯":"flag-djibouti","🇩🇰":"flag-denmark","🇩🇲":"flag-dominica","🇩🇴":"flag-dominican-republic","🇩🇿":"flag-algeria","🇪🇦":"flag-ceuta-&-melilla","🇪🇨":"flag-ecuador","🇪🇪":"flag-estonia","🇪🇬":"flag-egypt","🇪🇭":"flag-western-sahara","🇪🇷":"flag-eritrea","🇪🇸":"flag-spain","🇪🇹":"flag-ethiopia","🇪🇺":"flag-european-union","🇫🇮":"flag-finland","🇫🇯":"flag-fiji","🇫🇰":"flag-falkland-islands","🇫🇲":"flag-micronesia","🇫🇴":"flag-faroe-islands","🇫🇷":"flag-france","🇬🇦":"flag-gabon","🇬🇧":"flag-united-kingdom","🇬🇩":"flag-grenada","🇬🇪":"flag-georgia","🇬🇫":"flag-french-guiana","🇬🇬":"flag-guernsey","🇬🇭":"flag-ghana","🇬🇮":"flag-gibraltar","🇬🇱":"flag-greenland","🇬🇲":"flag-gambia","🇬🇳":"flag-guinea","🇬🇵":"flag-guadeloupe","🇬🇶":"flag-equatorial-guinea","🇬🇷":"flag-greece","🇬🇸":"flag-south-georgia-&-south-sandwich-islands","🇬🇹":"flag-guatemala","🇬🇺":"flag-guam","🇬🇼":"flag-guinea-bissau","🇬🇾":"flag-guyana","🇭🇰":"flag-hong-kong-sar-china","🇭🇲":"flag-heard-&-mcdonald-islands","🇭🇳":"flag-honduras","🇭🇷":"flag-croatia","🇭🇹":"flag-haiti","🇭🇺":"flag-hungary","🇮🇨":"flag-canary-islands","🇮🇩":"flag-indonesia","🇮🇪":"flag-ireland","🇮🇱":"flag-israel","🇮🇲":"flag-isle-of-man","🇮🇳":"flag-india","🇮🇴":"flag-british-indian-ocean-territory","🇮🇶":"flag-iraq","🇮🇷":"flag-iran","🇮🇸":"flag-iceland","🇮🇹":"flag-italy","🇯🇪":"flag-jersey","🇯🇲":"flag-jamaica","🇯🇴":"flag-jordan","🇯🇵":"flag-japan","🇰🇪":"flag-kenya","🇰🇬":"flag-kyrgyzstan","🇰🇭":"flag-cambodia","🇰🇮":"flag-kiribati","🇰🇲":"flag-comoros","🇰🇳":"flag-st-kitts-&-nevis","🇰🇵":"flag-north-korea","🇰🇷":"flag-south-korea","🇰🇼":"flag-kuwait","🇰🇾":"flag-cayman-islands","🇰🇿":"flag-kazakhstan","🇱🇦":"flag-laos","🇱🇧":"flag-lebanon","🇱🇨":"flag-st-lucia","🇱🇮":"flag-liechtenstein","🇱🇰":"flag-sri-lanka","🇱🇷":"flag-liberia","🇱🇸":"flag-lesotho","🇱🇹":"flag-lithuania","🇱🇺":"flag-luxembourg","🇱🇻":"flag-latvia","🇱🇾":"flag-libya","🇲🇦":"flag-morocco","🇲🇨":"flag-monaco","🇲🇩":"flag-moldova","🇲🇪":"flag-montenegro","🇲🇫":"flag-st-martin","🇲🇬":"flag-madagascar","🇲🇭":"flag-marshall-islands","🇲🇰":"flag-north-macedonia","🇲🇱":"flag-mali","🇲🇲":"flag-myanmar-burma","🇲🇳":"flag-mongolia","🇲🇴":"flag-macao-sar-china","🇲🇵":"flag-northern-mariana-islands","🇲🇶":"flag-martinique","🇲🇷":"flag-mauritania","🇲🇸":"flag-montserrat","🇲🇹":"flag-malta","🇲🇺":"flag-mauritius","🇲🇻":"flag-maldives","🇲🇼":"flag-malawi","🇲🇽":"flag-mexico","🇲🇾":"flag-malaysia","🇲🇿":"flag-mozambique","🇳🇦":"flag-namibia","🇳🇨":"flag-new-caledonia","🇳🇪":"flag-niger","🇳🇫":"flag-norfolk-island","🇳🇬":"flag-nigeria","🇳🇮":"flag-nicaragua","🇳🇱":"flag-netherlands","🇳🇴":"flag-norway","🇳🇵":"flag-nepal","🇳🇷":"flag-nauru","🇳🇺":"flag-niue","🇳🇿":"flag-new-zealand","🇴🇲":"flag-oman","🇵🇦":"flag-panama","🇵🇪":"flag-peru","🇵🇫":"flag-french-polynesia","🇵🇬":"flag-papua-new-guinea","🇵🇭":"flag-philippines","🇵🇰":"flag-pakistan","🇵🇱":"flag-poland","🇵🇲":"flag-st-pierre-&-miquelon","🇵🇳":"flag-pitcairn-islands","🇵🇷":"flag-puerto-rico","🇵🇸":"flag-palestinian-territories","🇵🇹":"flag-portugal","🇵🇼":"flag-palau","🇵🇾":"flag-paraguay","🇶🇦":"flag-qatar","🇷🇪":"flag-reunion","🇷🇴":"flag-romania","🇷🇸":"flag-serbia","🇷🇺":"flag-russia","🇷🇼":"flag-rwanda","🇸🇦":"flag-saudi-arabia","🇸🇧":"flag-solomon-islands","🇸🇨":"flag-seychelles","🇸🇩":"flag-sudan","🇸🇪":"flag-sweden","🇸🇬":"flag-singapore","🇸🇭":"flag-st-helena","🇸🇮":"flag-slovenia","🇸🇯":"flag-svalbard-&-jan-mayen","🇸🇰":"flag-slovakia","🇸🇱":"flag-sierra-leone","🇸🇲":"flag-san-marino","🇸🇳":"flag-senegal","🇸🇴":"flag-somalia","🇸🇷":"flag-suriname","🇸🇸":"flag-south-sudan","🇸🇹":"flag-sao-tome-&-principe","🇸🇻":"flag-el-salvador","🇸🇽":"flag-sint-maarten","🇸🇾":"flag-syria","🇸🇿":"flag-eswatini","🇹🇦":"flag-tristan-da-cunha","🇹🇨":"flag-turks-&-caicos-islands","🇹🇩":"flag-chad","🇹🇫":"flag-french-southern-territories","🇹🇬":"flag-togo","🇹🇭":"flag-thailand","🇹🇯":"flag-tajikistan","🇹🇰":"flag-tokelau","🇹🇱":"flag-timor-leste","🇹🇲":"flag-turkmenistan","🇹🇳":"flag-tunisia","🇹🇴":"flag-tonga","🇹🇷":"flag-turkey","🇹🇹":"flag-trinidad-&-tobago","🇹🇻":"flag-tuvalu","🇹🇼":"flag-taiwan","🇹🇿":"flag-tanzania","🇺🇦":"flag-ukraine","🇺🇬":"flag-uganda","🇺🇲":"flag-us-outlying-islands","🇺🇳":"flag-united-nations","🇺🇸":"flag-united-states","🇺🇾":"flag-uruguay","🇺🇿":"flag-uzbekistan","🇻🇦":"flag-vatican-city","🇻🇨":"flag-st-vincent-&-grenadines","🇻🇪":"flag-venezuela","🇻🇬":"flag-british-virgin-islands","🇻🇮":"flag-us-virgin-islands","🇻🇳":"flag-vietnam","🇻🇺":"flag-vanuatu","🇼🇫":"flag-wallis-&-futuna","🇼🇸":"flag-samoa","🇽🇰":"flag-kosovo","🇾🇪":"flag-yemen","🇾🇹":"flag-mayotte","🇿🇦":"flag-south-africa","🇿🇲":"flag-zambia","🇿🇼":"flag-zimbabwe","🏴󠁧󠁢󠁥󠁮󠁧󠁿":"flag-england","🏴󠁧󠁢󠁳󠁣󠁴󠁿":"flag-scotland","🏴󠁧󠁢󠁷󠁬󠁳󠁿":"flag-wales"}
},{}],11:[function(require,module,exports){
module.exports={"10":["🔟"],"grin":["😀","😃","😄","😆","😅","😺","😸"],"face":["😀","😃","😄","😁","😆","😅","😂","🙂","🙃","🫠","😉","😊","😇","🥰","😍","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🫣","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😶‍🌫️","😏","😒","🙄","😬","😮‍💨","🤥","🫨","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","😵‍💫","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","☹️","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","🤡","🤛","🤜","🐵","🐶","🐱","🐯","🐴","🐮","🐷","🐭","🐰","🐥","🐲","🌚","🌛","🌜","🌝","🌞","🌬️","📄"],"big":["😃"],"eyes":["😃","😄","😁","😊","😍","😚","😙","🫢","🙄","😵","😵‍💫","😸","😻","👀"],"smile":["😄","😁","🙂","😊","😇","🥰","😍","☺️","😙","🥲","🤗","😎","😈","😸","😻","😼"],"beam":["😁"],"squint":["😆","😝"],"sweat":["😅","😰","😓","💦"],"roll":["🤣","🙄","🧻"],"on":["🤣","🤬","❤️‍🔥","🍖","⛱️","🔛"],"the":["🤣","🤘","🫵"],"floor":["🤣"],"laugh":["🤣"],"tears":["😂","🥹","😹"],"joy":["😂","😹"],"slightly":["🙂","🙁"],"upside":["🙃"],"down":["🙃","🫳","👇","👎","↘️","⬇️","↙️","↕️","⤵️","⏬","🔻"],"melt":["🫠"],"wink":["😉","😜"],"halo":["😇"],"hearts":["🥰","💞","💕"],"heart":["😍","😻","💘","💝","💖","💗","💓","💟","❣️","💔","❤️‍🔥","❤️‍🩹","❤️","🩷","🧡","💛","💚","💙","🩵","💜","🤎","🖤","🩶","🤍","🫶","🫀","💑","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩","♥️"],"star":["🤩","⭐","🌟","🌠","✡️","☪️","🔯","✴️"],"struck":["🤩"],"blow":["😘"],"kiss":["😘","😗","😚","😙","😽","💋","💏","👩‍❤️‍💋‍👨","👨‍❤️‍💋‍👨","👩‍❤️‍💋‍👩"],"closed":["😚","🌂","📕","📫","📪"],"tear":["🥲","📆"],"savore":["😋"],"food":["😋","🥘","🍲","🥫"],"tongue":["😛","😜","😝","👅"],"zany":["🤪"],"money":["🤑","💰","💸"],"mouth":["🤑","🤭","🫢","🤐","😶","🫤","😮","😦","🤬","👄"],"open":["🤗","🫢","😮","😦","👐","📖","📬","📭","📂","🈺"],"hands":["🤗","👏","🙌","🫶","👐","🙏","🧑‍🤝‍🧑","👭","👫","👬"],"hand":["🤭","🫢","👋","🤚","🖐️","✋","🫱","🫲","🫳","🫴","🫷","🫸","👌","🤏","✌️","🫰","🤙","✍️","💁","💁‍♂️","💁‍♀️","🙋","🙋‍♂️","🙋‍♀️","🪭"],"over":["🤭","🫢","🌄"],"and":["🫢","☠️","🫰","👫","🍽️","🍴","⛈️","⚒️","🛠️","🏹","🔩","🛋️","☪️"],"peek":["🫣"],"eye":["🫣","👁️‍🗨️","👁️"],"shush":["🤫"],"think":["🤔"],"salute":["🫡","🖖"],"zipper":["🤐"],"raised":["🤨","🤚","✋","✊","📫","📬"],"eyebrow":["🤨"],"neutral":["😐"],"expressionless":["😑"],"without":["😶","🍵","⛄"],"dotted":["🫥","🔯"],"line":["🫥"],"in":["😶‍🌫️","😱","👁️‍🗨️","🤵","🤵‍♂️","🤵‍♀️","🧑‍🦼","👨‍🦼","👩‍🦼","🧑‍🦽","👨‍🦽","👩‍🦽","🕴️","🧖","🧖‍♂️","🧖‍♀️","🧘","🧘‍♂️","🧘‍♀️","🛌","👤","👥","🍃","⛳","🚮"],"clouds":["😶‍🌫️"],"smirk":["😏"],"unamused":["😒"],"grimace":["😬"],"exhale":["😮‍💨"],"lying":["🤥"],"shake":["🫨"],"relieved":["😌","😥"],"pensive":["😔"],"sleepy":["😪"],"drool":["🤤"],"sleep":["😴"],"medical":["😷","⚕️"],"mask":["😷","🤿"],"thermometer":["🤒","🌡️"],"head":["🤕","🤯","🗣️"],"bandage":["🤕","🩹"],"nauseated":["🤢"],"vomite":["🤮"],"sneez":["🤧"],"hot":["🥵","🌶️","🌭","☕","♨️"],"cold":["🥶"],"woozy":["🥴"],"crossed":["😵","🤞","🫰","⚔️","🎌"],"out":["😵"],"spiral":["😵‍💫","🐚","🗒️","🗓️"],"explode":["🤯"],"cowboy":["🤠"],"hat":["🤠","👒","🎩"],"party":["🥳","🎉"],"disguised":["🥸"],"sunglasses":["😎","🕶️"],"nerd":["🤓"],"monocle":["🧐"],"confused":["😕"],"diagonal":["🫤"],"worried":["😟"],"frown":["🙁","☹️","😦","🙍","🙍‍♂️","🙍‍♀️"],"hushed":["😯"],"astonished":["😲"],"flushed":["😳"],"plead":["🥺"],"hold":["🥹","🧑‍🤝‍🧑","👭","👫","👬"],"back":["🥹","🤚","🔙"],"anguished":["😧"],"fearful":["😨"],"anxious":["😰"],"sad":["😥"],"but":["😥"],"cry":["😢","😭","😿"],"loudly":["😭"],"scream":["😱"],"fear":["😱"],"confounded":["😖"],"persever":["😣"],"disappointed":["😞"],"downcast":["😓"],"weary":["😩","🙀"],"tired":["😫"],"yawn":["🥱"],"steam":["😤","🍜"],"from":["😤"],"nose":["😤","👃","🐽"],"enraged":["😡"],"angry":["😠","👿"],"symbols":["🤬","🔣"],"horns":["😈","👿","🤘"],"skull":["💀","☠️"],"crossbones":["☠️"],"pile":["💩"],"poo":["💩"],"clown":["🤡"],"ogre":["👹"],"goblin":["👺"],"ghost":["👻"],"alien":["👽","👾"],"monster":["👾"],"robot":["🤖"],"cat":["😺","😸","😹","😻","😼","😽","🙀","😿","😾","🐱","🐈","🐈‍⬛"],"wry":["😼"],"pout":["😾","🙎","🙎‍♂️","🙎‍♀️"],"see":["🙈"],"no":["🙈","🙉","🙊","🙅","🙅‍♂️","🙅‍♀️","⛔","🚳","🚭","🚯","🚷","📵","🔞","🈵"],"evil":["🙈","🙉","🙊"],"monkey":["🙈","🙉","🙊","🐵","🐒"],"hear":["🙉","🦻"],"speak":["🙊","🗣️"],"love":["💌","🤟","🏩"],"letter":["💌"],"arrow":["💘","📲","📩","🏹","⬆️","↗️","➡️","↘️","⬇️","↙️","⬅️","↖️","↕️","↔️","↩️","↪️","⤴️","⤵️","🔙","🔚","🔛","🔜","🔝"],"ribbon":["💝","🎀","🎗️"],"sparkle":["💖","❇️"],"grow":["💗"],"beat":["💓"],"revolve":["💞"],"two":["💕","🐫","🕑","🕝"],"decoration":["💟","🎍"],"exclamation":["❣️","‼️","⁉️","❕","❗"],"broken":["💔"],"fire":["❤️‍🔥","🚒","🔥","🧯"],"mend":["❤️‍🩹"],"red":["❤️","👨‍🦰","👩‍🦰","🧑‍🦰","🍎","🧧","🀄","🏮","❓","❗","⭕","🔴","🟥","🔺","🔻"],"pink":["🩷"],"orange":["🧡","📙","🟠","🟧","🔶","🔸"],"yellow":["💛","🟡","🟨"],"green":["💚","🍏","🥬","🥗","📗","🟢","🟩"],"blue":["💙","🩵","📘","🔵","🟦","🔷","🔹"],"light":["🩵","🚈","🚨","🚥","🚦","💡"],"purple":["💜","🟣","🟪"],"brown":["🤎","🟤","🟫"],"black":["🖤","🐈‍⬛","🐦‍⬛","✒️","⚫","⬛","◼️","◾","▪️","🔲","🏴"],"grey":["🩶"],"white":["🤍","👨‍🦳","👩‍🦳","🧑‍🦳","🧑‍🦯","👨‍🦯","👩‍🦯","💮","🦯","❔","❕","⚪","⬜","◻️","◽","▫️","🔳","🏳️"],"mark":["💋","‼️","⁉️","❓","❔","❕","❗","✅","✔️","❌","❎","〽️","™️"],"hundred":["💯"],"points":["💯"],"anger":["💢","🗯️"],"symbol":["💢","♿","🚼","⚛️","☮️","⚧️","⚕️","♻️","🔰"],"collision":["💥"],"dizzy":["💫"],"droplets":["💦"],"dash":["💨","〰️"],"away":["💨"],"hole":["🕳️","⛳"],"speech":["💬","👁️‍🗨️","🗨️"],"balloon":["💬","💭","🎈"],"bubble":["👁️‍🗨️","🗨️","🗯️","🧋"],"left":["🗨️","👈","🤛","🔍","🛅","↙️","⬅️","↖️","↔️","↩️","↪️"],"right":["🗯️","👉","🤜","🔎","↗️","➡️","↘️","↔️","↩️","↪️","⤴️","⤵️"],"thought":["💭"],"zzz":["💤"],"wave":["👋","🌊"],"fingers":["🖐️","🤌","🤞"],"splayed":["🖐️"],"vulcan":["🖖"],"rightwards":["🫱","🫸"],"leftwards":["🫲","🫷"],"palm":["🫳","🫴","🌴"],"up":["🫴","👆","☝️","👍","🤲","📄","🗞️","⬆️","↗️","↖️","↕️","⤴️","⏫","🆙","🔺"],"push":["🫷","🫸"],"ok":["👌","🙆","🙆‍♂️","🙆‍♀️","🆗"],"pinched":["🤌"],"pinch":["🤏"],"victory":["✌️"],"index":["🫰","👈","👉","👆","👇","☝️","🫵","🗂️","📇"],"finger":["🫰","🖕"],"thumb":["🫰"],"you":["🤟"],"gesture":["🤟","🙅","🙅‍♂️","🙅‍♀️","🙆","🙆‍♂️","🙆‍♀️"],"sign":["🤘","🛑","🏧","🚮","♀️","♂️","🟰","💲"],"call":["🤙"],"me":["🤙"],"backhand":["👈","👉","👆","👇"],"point":["👈","👉","👆","👇","☝️","🫵"],"middle":["🖕"],"at":["🫵","🌆","🌉"],"viewer":["🫵"],"thumbs":["👍","👎"],"fist":["✊","👊","🤛","🤜"],"oncome":["👊","🚍","🚔","🚖","🚘"],"clap":["👏"],"raise":["🙌","🙋","🙋‍♂️","🙋‍♀️"],"palms":["🤲"],"together":["🤲"],"handshake":["🤝"],"folded":["🙏"],"write":["✍️"],"nail":["💅"],"polish":["💅"],"selfie":["🤳"],"flexed":["💪"],"biceps":["💪"],"mechanical":["🦾","🦿"],"arm":["🦾"],"leg":["🦿","🦵","🍗"],"foot":["🦶"],"ear":["👂","🦻","🌽"],"aid":["🦻"],"brain":["🧠"],"anatomical":["🫀"],"lungs":["🫁"],"tooth":["🦷"],"bone":["🦴","🍖"],"bite":["🫦"],"lip":["🫦"],"baby":["👶","👩‍🍼","👨‍🍼","🧑‍🍼","👼","🐤","🐥","🍼","🚼"],"child":["🧒"],"boy":["👦","👨‍👩‍👦","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👨‍👦","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👩‍👩‍👦","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👨‍👦","👨‍👦‍👦","👨‍👧‍👦","👩‍👦","👩‍👦‍👦","👩‍👧‍👦"],"girl":["👧","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👧‍👧","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👧‍👧","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👧‍👧","👨‍👧","👨‍👧‍👦","👨‍👧‍👧","👩‍👧","👩‍👧‍👦","👩‍👧‍👧"],"person":["🧑","👱","🧔","🧑‍🦰","🧑‍🦱","🧑‍🦳","🧑‍🦲","🧓","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷","🫅","👳","👲","🤵","👰","🫄","🧑‍🍼","💆","💇","🚶","🧍","🧎","🧑‍🦯","🧑‍🦼","🧑‍🦽","🏃","🕴️","🧖","🧗","🤺","🏌️","🏄","🚣","🏊","⛹️","🏋️","🚴","🚵","🤸","🤽","🤾","🤹","🧘","🛀","🛌"],"blond":["👱","👱‍♀️","👱‍♂️"],"hair":["👱","👨‍🦰","👨‍🦱","👨‍🦳","👩‍🦰","🧑‍🦰","👩‍🦱","🧑‍🦱","👩‍🦳","🧑‍🦳","👱‍♀️","👱‍♂️","🪮"],"man":["👨","🧔‍♂️","👨‍🦰","👨‍🦱","👨‍🦳","👨‍🦲","👱‍♂️","👴","🙍‍♂️","🙎‍♂️","🙅‍♂️","🙆‍♂️","💁‍♂️","🙋‍♂️","🧏‍♂️","🙇‍♂️","🤦‍♂️","🤷‍♂️","👨‍⚕️","👨‍🎓","👨‍🏫","👨‍⚖️","👨‍🌾","👨‍🍳","👨‍🔧","👨‍🏭","👨‍💼","👨‍🔬","👨‍💻","👨‍🎤","👨‍🎨","👨‍✈️","👨‍🚀","👨‍🚒","👮‍♂️","🕵️‍♂️","💂‍♂️","👷‍♂️","👳‍♂️","🤵‍♂️","👰‍♂️","🫃","👨‍🍼","🦸‍♂️","🦹‍♂️","🧙‍♂️","🧚‍♂️","🧛‍♂️","🧝‍♂️","🧞‍♂️","🧟‍♂️","💆‍♂️","💇‍♂️","🚶‍♂️","🧍‍♂️","🧎‍♂️","👨‍🦯","👨‍🦼","👨‍🦽","🏃‍♂️","🕺","🧖‍♂️","🧗‍♂️","🏌️‍♂️","🏄‍♂️","🚣‍♂️","🏊‍♂️","⛹️‍♂️","🏋️‍♂️","🚴‍♂️","🚵‍♂️","🤸‍♂️","🤽‍♂️","🤾‍♂️","🤹‍♂️","🧘‍♂️","👫","👩‍❤️‍💋‍👨","👨‍❤️‍💋‍👨","👩‍❤️‍👨","👨‍❤️‍👨","👨‍👩‍👦","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👨‍👨‍👦","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👨‍👨‍👧‍👧","👨‍👦","👨‍👦‍👦","👨‍👧","👨‍👧‍👦","👨‍👧‍👧","👞","🇮🇲"],"beard":["🧔","🧔‍♂️","🧔‍♀️"],"woman":["🧔‍♀️","👩","👩‍🦰","👩‍🦱","👩‍🦳","👩‍🦲","👱‍♀️","👵","🙍‍♀️","🙎‍♀️","🙅‍♀️","🙆‍♀️","💁‍♀️","🙋‍♀️","🧏‍♀️","🙇‍♀️","🤦‍♀️","🤷‍♀️","👩‍⚕️","👩‍🎓","👩‍🏫","👩‍⚖️","👩‍🌾","👩‍🍳","👩‍🔧","👩‍🏭","👩‍💼","👩‍🔬","👩‍💻","👩‍🎤","👩‍🎨","👩‍✈️","👩‍🚀","👩‍🚒","👮‍♀️","🕵️‍♀️","💂‍♀️","👷‍♀️","👳‍♀️","🧕","🤵‍♀️","👰‍♀️","🤰","👩‍🍼","🦸‍♀️","🦹‍♀️","🧙‍♀️","🧚‍♀️","🧛‍♀️","🧝‍♀️","🧞‍♀️","🧟‍♀️","💆‍♀️","💇‍♀️","🚶‍♀️","🧍‍♀️","🧎‍♀️","👩‍🦯","👩‍🦼","👩‍🦽","🏃‍♀️","💃","🧖‍♀️","🧗‍♀️","🏌️‍♀️","🏄‍♀️","🚣‍♀️","🏊‍♀️","⛹️‍♀️","🏋️‍♀️","🚴‍♀️","🚵‍♀️","🤸‍♀️","🤽‍♀️","🤾‍♀️","🤹‍♀️","🧘‍♀️","👫","👩‍❤️‍💋‍👨","👩‍❤️‍💋‍👩","👩‍❤️‍👨","👩‍❤️‍👩","👨‍👩‍👦","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👩‍👩‍👦","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👩‍👩‍👧‍👧","👩‍👦","👩‍👦‍👦","👩‍👧","👩‍👧‍👦","👩‍👧‍👧","👚","👡","👢","👒"],"curly":["👨‍🦱","👩‍🦱","🧑‍🦱","➰","➿"],"bald":["👨‍🦲","👩‍🦲","🧑‍🦲"],"older":["🧓"],"old":["👴","👵","🗝️"],"tip":["💁","💁‍♂️","💁‍♀️"],"deaf":["🧏","🧏‍♂️","🧏‍♀️"],"bow":["🙇","🙇‍♂️","🙇‍♀️","🏹"],"facepalm":["🤦","🤦‍♂️","🤦‍♀️"],"shrug":["🤷","🤷‍♂️","🤷‍♀️"],"health":["🧑‍⚕️","👨‍⚕️","👩‍⚕️"],"worker":["🧑‍⚕️","👨‍⚕️","👩‍⚕️","🧑‍🏭","👨‍🏭","👩‍🏭","🧑‍💼","👨‍💼","👩‍💼","👷","👷‍♂️","👷‍♀️","⛑️"],"student":["🧑‍🎓","👨‍🎓","👩‍🎓"],"teacher":["🧑‍🏫","👨‍🏫","👩‍🏫"],"judge":["🧑‍⚖️","👨‍⚖️","👩‍⚖️"],"farmer":["🧑‍🌾","👨‍🌾","👩‍🌾"],"cook":["🧑‍🍳","👨‍🍳","👩‍🍳","🍳","🇨🇰"],"mechanic":["🧑‍🔧","👨‍🔧","👩‍🔧"],"factory":["🧑‍🏭","👨‍🏭","👩‍🏭","🏭"],"office":["🧑‍💼","👨‍💼","👩‍💼","🏢","🏣","🏤"],"scientist":["🧑‍🔬","👨‍🔬","👩‍🔬"],"technologist":["🧑‍💻","👨‍💻","👩‍💻"],"singer":["🧑‍🎤","👨‍🎤","👩‍🎤"],"artist":["🧑‍🎨","👨‍🎨","👩‍🎨","🎨"],"pilot":["🧑‍✈️","👨‍✈️","👩‍✈️"],"astronaut":["🧑‍🚀","👨‍🚀","👩‍🚀"],"firefighter":["🧑‍🚒","👨‍🚒","👩‍🚒"],"police":["👮","👮‍♂️","👮‍♀️","🚓","🚔","🚨"],"officer":["👮","👮‍♂️","👮‍♀️"],"detective":["🕵️","🕵️‍♂️","🕵️‍♀️"],"guard":["💂","💂‍♂️","💂‍♀️"],"ninja":["🥷"],"construction":["👷","👷‍♂️","👷‍♀️","🏗️","🚧"],"crown":["🫅","👑"],"prince":["🤴"],"princess":["👸"],"wear":["👳","👳‍♂️","👳‍♀️"],"turban":["👳","👳‍♂️","👳‍♀️"],"skullcap":["👲"],"headscarf":["🧕"],"tuxedo":["🤵","🤵‍♂️","🤵‍♀️"],"veil":["👰","👰‍♂️","👰‍♀️"],"pregnant":["🤰","🫃","🫄"],"breast":["🤱"],"feed":["🤱","👩‍🍼","👨‍🍼","🧑‍🍼"],"angel":["👼"],"santa":["🎅"],"claus":["🎅","🤶","🧑‍🎄"],"mrs":["🤶"],"mx":["🧑‍🎄"],"superhero":["🦸","🦸‍♂️","🦸‍♀️"],"supervillain":["🦹","🦹‍♂️","🦹‍♀️"],"mage":["🧙","🧙‍♂️","🧙‍♀️"],"fairy":["🧚","🧚‍♂️","🧚‍♀️"],"vampire":["🧛","🧛‍♂️","🧛‍♀️"],"merperson":["🧜"],"merman":["🧜‍♂️"],"mermaid":["🧜‍♀️"],"elf":["🧝","🧝‍♂️","🧝‍♀️"],"genie":["🧞","🧞‍♂️","🧞‍♀️"],"zombie":["🧟","🧟‍♂️","🧟‍♀️"],"troll":["🧌"],"gett":["💆","💆‍♂️","💆‍♀️","💇","💇‍♂️","💇‍♀️"],"massage":["💆","💆‍♂️","💆‍♀️"],"haircut":["💇","💇‍♂️","💇‍♀️"],"walk":["🚶","🚶‍♂️","🚶‍♀️"],"stand":["🧍","🧍‍♂️","🧍‍♀️"],"kneel":["🧎","🧎‍♂️","🧎‍♀️"],"cane":["🧑‍🦯","👨‍🦯","👩‍🦯","🦯"],"motorized":["🧑‍🦼","👨‍🦼","👩‍🦼","🦼"],"wheelchair":["🧑‍🦼","👨‍🦼","👩‍🦼","🧑‍🦽","👨‍🦽","👩‍🦽","🦽","🦼","♿"],"manual":["🧑‍🦽","👨‍🦽","👩‍🦽","🦽"],"run":["🏃","🏃‍♂️","🏃‍♀️","🎽","👟"],"dance":["💃","🕺"],"suit":["🕴️","♠️","♥️","♦️","♣️"],"levitate":["🕴️"],"people":["👯","🤼","🧑‍🤝‍🧑","🫂"],"bunny":["👯","👯‍♂️","👯‍♀️"],"ears":["👯","👯‍♂️","👯‍♀️"],"men":["👯‍♂️","🤼‍♂️","👬","🚹"],"women":["👯‍♀️","🤼‍♀️","👭","🚺"],"steamy":["🧖","🧖‍♂️","🧖‍♀️"],"room":["🧖","🧖‍♂️","🧖‍♀️","🚹","🚺"],"climb":["🧗","🧗‍♂️","🧗‍♀️"],"fence":["🤺"],"horse":["🏇","🐴","🐎","🎠"],"race":["🏇","🏎️"],"skier":["⛷️"],"snowboarder":["🏂"],"golf":["🏌️","🏌️‍♂️","🏌️‍♀️"],"surf":["🏄","🏄‍♂️","🏄‍♀️"],"row":["🚣","🚣‍♂️","🚣‍♀️"],"boat":["🚣","🚣‍♂️","🚣‍♀️","🛥️"],"swim":["🏊","🏊‍♂️","🏊‍♀️"],"bounce":["⛹️","⛹️‍♂️","⛹️‍♀️"],"ball":["⛹️","⛹️‍♂️","⛹️‍♀️","🍙","🎊","⚽","🎱","🔮","🪩"],"lift":["🏋️","🏋️‍♂️","🏋️‍♀️"],"weights":["🏋️","🏋️‍♂️","🏋️‍♀️"],"bike":["🚴","🚴‍♂️","🚴‍♀️","🚵","🚵‍♂️","🚵‍♀️"],"mountain":["🚵","🚵‍♂️","🚵‍♀️","🏔️","⛰️","🚞","🚠"],"cartwheel":["🤸","🤸‍♂️","🤸‍♀️"],"wrestle":["🤼","🤼‍♂️","🤼‍♀️"],"play":["🤽","🤽‍♂️","🤽‍♀️","🤾","🤾‍♂️","🤾‍♀️","🎴","▶️","⏯️"],"water":["🤽","🤽‍♂️","🤽‍♀️","🐃","🌊","🔫","🚰","🚾","🚱"],"polo":["🤽","🤽‍♂️","🤽‍♀️"],"handball":["🤾","🤾‍♂️","🤾‍♀️"],"juggle":["🤹","🤹‍♂️","🤹‍♀️"],"lotus":["🧘","🧘‍♂️","🧘‍♀️","🪷"],"position":["🧘","🧘‍♂️","🧘‍♀️"],"take":["🛀"],"bath":["🛀"],"bed":["🛌","🛏️"],"couple":["💑","👩‍❤️‍👨","👨‍❤️‍👨","👩‍❤️‍👩"],"family":["👪","👨‍👩‍👦","👨‍👩‍👧","👨‍👩‍👧‍👦","👨‍👩‍👦‍👦","👨‍👩‍👧‍👧","👨‍👨‍👦","👨‍👨‍👧","👨‍👨‍👧‍👦","👨‍👨‍👦‍👦","👨‍👨‍👧‍👧","👩‍👩‍👦","👩‍👩‍👧","👩‍👩‍👧‍👦","👩‍👩‍👦‍👦","👩‍👩‍👧‍👧","👨‍👦","👨‍👦‍👦","👨‍👧","👨‍👧‍👦","👨‍👧‍👧","👩‍👦","👩‍👦‍👦","👩‍👧","👩‍👧‍👦","👩‍👧‍👧"],"bust":["👤"],"silhouette":["👤","👥"],"busts":["👥"],"hug":["🫂"],"footprints":["👣"],"gorilla":["🦍"],"orangutan":["🦧"],"dog":["🐶","🐕","🦮","🐕‍🦺","🌭"],"guide":["🦮"],"service":["🐕‍🦺","🈂️"],"poodle":["🐩"],"wolf":["🐺"],"fox":["🦊"],"raccoon":["🦝"],"lion":["🦁"],"tiger":["🐯","🐅"],"leopard":["🐆"],"moose":["🫎"],"donkey":["🫏"],"unicorn":["🦄"],"zebra":["🦓"],"deer":["🦌"],"bison":["🦬"],"cow":["🐮","🐄"],"ox":["🐂"],"buffalo":["🐃"],"pig":["🐷","🐖","🐽"],"boar":["🐗"],"ram":["🐏"],"ewe":["🐑"],"goat":["🐐"],"camel":["🐪","🐫"],"hump":["🐫"],"llama":["🦙"],"giraffe":["🦒"],"elephant":["🐘"],"mammoth":["🦣"],"rhinoceros":["🦏"],"hippopotamus":["🦛"],"mouse":["🐭","🐁","🖱️","🪤"],"rat":["🐀"],"hamster":["🐹"],"rabbit":["🐰","🐇"],"chipmunk":["🐿️"],"beaver":["🦫"],"hedgehog":["🦔"],"bat":["🦇"],"bear":["🐻","🐻‍❄️","🧸"],"polar":["🐻‍❄️"],"koala":["🐨"],"panda":["🐼"],"sloth":["🦥"],"otter":["🦦"],"skunk":["🦨"],"kangaroo":["🦘"],"badger":["🦡"],"paw":["🐾"],"prints":["🐾"],"turkey":["🦃","🇹🇷"],"chicken":["🐔"],"rooster":["🐓"],"hatch":["🐣"],"chick":["🐣","🐤","🐥"],"front":["🐥"],"bird":["🐦","🐦‍⬛"],"penguin":["🐧"],"dove":["🕊️"],"eagle":["🦅"],"duck":["🦆"],"swan":["🦢"],"owl":["🦉"],"dodo":["🦤"],"feather":["🪶"],"flamingo":["🦩"],"peacock":["🦚"],"parrot":["🦜"],"wing":["🪽"],"goose":["🪿"],"frog":["🐸"],"crocodile":["🐊"],"turtle":["🐢"],"lizard":["🦎"],"snake":["🐍"],"dragon":["🐲","🐉","🀄"],"sauropod":["🦕"],"rex":["🦖"],"spout":["🐳"],"whale":["🐳","🐋"],"dolphin":["🐬"],"seal":["🦭"],"fish":["🐟","🐠","🍥","🎣"],"tropical":["🐠","🍹"],"blowfish":["🐡"],"shark":["🦈"],"octopus":["🐙"],"shell":["🐚"],"coral":["🪸"],"jellyfish":["🪼"],"snail":["🐌"],"butterfly":["🦋"],"bug":["🐛"],"ant":["🐜"],"honeybee":["🐝"],"beetle":["🪲","🐞"],"lady":["🐞"],"cricket":["🦗","🏏"],"cockroach":["🪳"],"spider":["🕷️","🕸️"],"web":["🕸️"],"scorpion":["🦂"],"mosquito":["🦟"],"fly":["🪰","🛸","🥏"],"worm":["🪱"],"microbe":["🦠"],"bouquet":["💐"],"cherry":["🌸"],"blossom":["🌸","🌼"],"flower":["💮","🥀","🎴"],"rosette":["🏵️"],"rose":["🌹"],"wilted":["🥀"],"hibiscus":["🌺"],"sunflower":["🌻"],"tulip":["🌷"],"hyacinth":["🪻"],"seedle":["🌱"],"potted":["🪴"],"plant":["🪴"],"evergreen":["🌲"],"tree":["🌲","🌳","🌴","🎄","🎋"],"deciduous":["🌳"],"cactus":["🌵"],"sheaf":["🌾"],"rice":["🌾","🍘","🍙","🍚","🍛"],"herb":["🌿"],"shamrock":["☘️"],"four":["🍀","🕓","🕟"],"leaf":["🍀","🍁","🍂","🍃"],"clover":["🍀"],"maple":["🍁"],"fallen":["🍂"],"flutter":["🍃"],"wind":["🍃","🌬️","🎐"],"empty":["🪹"],"nest":["🪹","🪺","🪆"],"eggs":["🪺"],"mushroom":["🍄"],"grapes":["🍇"],"melon":["🍈"],"watermelon":["🍉"],"tangerine":["🍊"],"lemon":["🍋"],"banana":["🍌"],"pineapple":["🍍"],"mango":["🥭"],"apple":["🍎","🍏"],"pear":["🍐"],"peach":["🍑"],"cherries":["🍒"],"strawberry":["🍓"],"blueberries":["🫐"],"kiwi":["🥝"],"fruit":["🥝"],"tomato":["🍅"],"olive":["🫒"],"coconut":["🥥"],"avocado":["🥑"],"eggplant":["🍆"],"potato":["🥔","🍠"],"carrot":["🥕"],"corn":["🌽"],"pepper":["🌶️","🫑"],"bell":["🫑","🛎️","🔔","🔕"],"cucumber":["🥒"],"leafy":["🥬"],"broccoli":["🥦"],"garlic":["🧄"],"onion":["🧅"],"peanuts":["🥜"],"beans":["🫘"],"chestnut":["🌰"],"ginger":["🫚"],"root":["🫚"],"pea":["🫛"],"pod":["🫛"],"bread":["🍞","🥖"],"croissant":["🥐"],"baguette":["🥖"],"flatbread":["🫓","🥙"],"pretzel":["🥨"],"bagel":["🥯"],"pancakes":["🥞"],"waffle":["🧇"],"cheese":["🧀"],"wedge":["🧀"],"meat":["🍖","🥩"],"poultry":["🍗"],"cut":["🥩"],"bacon":["🥓"],"hamburger":["🍔"],"french":["🍟","🇬🇫","🇵🇫","🇹🇫"],"fries":["🍟"],"pizza":["🍕"],"sandwich":["🥪","🇬🇸"],"taco":["🌮"],"burrito":["🌯"],"tamale":["🫔"],"stuffed":["🥙"],"falafel":["🧆"],"egg":["🥚"],"shallow":["🥘"],"pan":["🥘"],"pot":["🍲","🍯"],"fondue":["🫕"],"bowl":["🥣","🍜","🎳"],"spoon":["🥣","🥄"],"salad":["🥗"],"popcorn":["🍿"],"butter":["🧈"],"salt":["🧂"],"canned":["🥫"],"bento":["🍱"],"box":["🍱","🥡","🧃","🥊","🗳️","🗃️","☑️"],"cracker":["🍘"],"cooked":["🍚"],"curry":["🍛"],"spaghetti":["🍝"],"roasted":["🍠"],"sweet":["🍠"],"oden":["🍢"],"sushi":["🍣"],"fried":["🍤"],"shrimp":["🍤","🦐"],"cake":["🍥","🥮","🎂"],"swirl":["🍥"],"moon":["🥮","🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘","🌙","🌚","🌛","🌜","🌝","🎑"],"dango":["🍡"],"dumple":["🥟"],"fortune":["🥠"],"cookie":["🥠","🍪"],"takeout":["🥡"],"crab":["🦀"],"lobster":["🦞"],"squid":["🦑"],"oyster":["🦪"],"soft":["🍦"],"ice":["🍦","🍧","🍨","🧊","🏒","⛸️"],"cream":["🍦","🍨"],"shaved":["🍧"],"doughnut":["🍩"],"birthday":["🎂"],"shortcake":["🍰"],"cupcake":["🧁"],"pie":["🥧"],"chocolate":["🍫"],"bar":["🍫","📊"],"candy":["🍬"],"lollipop":["🍭"],"custard":["🍮"],"honey":["🍯"],"bottle":["🍼","🍾","🧴"],"glass":["🥛","🍷","🍸","🥃","🔍","🔎"],"milk":["🥛"],"beverage":["☕","🧃"],"teapot":["🫖"],"teacup":["🍵"],"handle":["🍵"],"sake":["🍶"],"pop":["🍾"],"cork":["🍾"],"wine":["🍷"],"cocktail":["🍸"],"drink":["🍹"],"beer":["🍺","🍻"],"mug":["🍺"],"clink":["🍻","🥂"],"mugs":["🍻"],"glasses":["🥂","👓"],"tumbler":["🥃"],"pour":["🫗"],"liquid":["🫗"],"cup":["🥤"],"straw":["🥤"],"tea":["🧋"],"mate":["🧉"],"chopsticks":["🥢"],"fork":["🍽️","🍴"],"knife":["🍽️","🍴","🔪"],"plate":["🍽️"],"kitchen":["🔪"],"jar":["🫙"],"amphora":["🏺"],"globe":["🌍","🌎","🌏","🌐"],"show":["🌍","🌎","🌏"],"europe":["🌍"],"africa":["🌍","🇿🇦"],"americas":["🌎"],"asia":["🌏"],"australia":["🌏","🇦🇺"],"meridians":["🌐"],"world":["🗺️"],"map":["🗺️","🗾"],"japan":["🗾","🇯🇵"],"compass":["🧭"],"snow":["🏔️","🌨️","⛄"],"capped":["🏔️"],"volcano":["🌋"],"mount":["🗻"],"fuji":["🗻"],"camp":["🏕️"],"beach":["🏖️"],"umbrella":["🏖️","🌂","☂️","☔","⛱️"],"desert":["🏜️","🏝️"],"island":["🏝️","🇦🇨","🇧🇻","🇨🇵","🇨🇽","🇳🇫"],"national":["🏞️"],"park":["🏞️"],"stadium":["🏟️"],"classical":["🏛️"],"build":["🏛️","🏗️","🏢"],"brick":["🧱"],"rock":["🪨"],"wood":["🪵"],"hut":["🛖"],"houses":["🏘️"],"derelict":["🏚️"],"house":["🏚️","🏠","🏡"],"garden":["🏡"],"japanese":["🏣","🏯","🎎","🔰","🈁","🈂️","🈷️","🈶","🈯","🉐","🈹","🈚","🈲","🉑","🈸","🈴","🈳","㊗️","㊙️","🈺","🈵"],"post":["🏣","🏤"],"hospital":["🏥"],"bank":["🏦"],"hotel":["🏨","🏩"],"convenience":["🏪"],"store":["🏪","🏬"],"school":["🏫"],"department":["🏬"],"castle":["🏯","🏰"],"wed":["💒"],"tokyo":["🗼"],"tower":["🗼"],"statue":["🗽"],"liberty":["🗽"],"church":["⛪"],"mosque":["🕌"],"hindu":["🛕"],"temple":["🛕"],"synagogue":["🕍"],"shinto":["⛩️"],"shrine":["⛩️"],"kaaba":["🕋"],"fountain":["⛲","🖋️"],"tent":["⛺","🎪"],"foggy":["🌁"],"night":["🌃","🌉"],"stars":["🌃"],"cityscape":["🏙️","🌆"],"sunrise":["🌄","🌅"],"mountains":["🌄"],"dusk":["🌆"],"sunset":["🌇"],"bridge":["🌉"],"springs":["♨️"],"carousel":["🎠"],"playground":["🛝"],"slide":["🛝"],"ferris":["🎡"],"wheel":["🎡","🛞","☸️"],"roller":["🎢","🛼"],"coaster":["🎢"],"barber":["💈"],"pole":["💈","🎣"],"circus":["🎪"],"locomotive":["🚂"],"railway":["🚃","🚞","🛤️","🚟"],"car":["🚃","🚋","🚓","🚔","🏎️","🚨"],"high":["🚄","⚡","👠","🔊"],"speed":["🚄"],"train":["🚄","🚅","🚆"],"bullet":["🚅"],"metro":["🚇"],"rail":["🚈"],"station":["🚉"],"tram":["🚊","🚋"],"monorail":["🚝"],"bus":["🚌","🚍","🚏"],"trolleybus":["🚎"],"minibus":["🚐"],"ambulance":["🚑"],"engine":["🚒"],"taxi":["🚕","🚖"],"automobile":["🚗","🚘"],"sport":["🚙"],"utility":["🚙"],"vehicle":["🚙"],"pickup":["🛻"],"truck":["🛻","🚚"],"delivery":["🚚"],"articulated":["🚛"],"lorry":["🚛"],"tractor":["🚜"],"motorcycle":["🏍️"],"motor":["🛵","🛥️"],"scooter":["🛵","🛴"],"auto":["🛺"],"rickshaw":["🛺"],"bicycle":["🚲"],"kick":["🛴"],"skateboard":["🛹"],"skate":["🛼","⛸️"],"stop":["🚏","🛑","⏹️"],"motorway":["🛣️"],"track":["🛤️","⏭️","⏮️"],"oil":["🛢️"],"drum":["🛢️","🥁","🪘"],"fuel":["⛽"],"pump":["⛽"],"horizontal":["🚥"],"traffic":["🚥","🚦"],"vertical":["🚦","🔃"],"anchor":["⚓"],"ring":["🛟","💍"],"buoy":["🛟"],"sailboat":["⛵"],"canoe":["🛶"],"speedboat":["🚤"],"passenger":["🛳️"],"ship":["🛳️","🚢"],"ferry":["⛴️"],"airplane":["✈️","🛩️","🛫","🛬"],"small":["🛩️","🌤️","◾","◽","▪️","▫️","🔸","🔹"],"departure":["🛫"],"arrival":["🛬"],"parachute":["🪂"],"seat":["💺"],"helicopter":["🚁"],"suspension":["🚟"],"cableway":["🚠"],"aerial":["🚡"],"tramway":["🚡"],"satellite":["🛰️","📡"],"rocket":["🚀"],"saucer":["🛸"],"bellhop":["🛎️"],"luggage":["🧳","🛅"],"hourglass":["⌛","⏳"],"done":["⌛","⏳"],"not":["⏳","🈶"],"watch":["⌚"],"alarm":["⏰"],"clock":["⏰","⏲️","🕰️","🕛","🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚"],"stopwatch":["⏱️"],"timer":["⏲️"],"mantelpiece":["🕰️"],"twelve":["🕛","🕧"],"thirty":["🕧","🕜","🕝","🕞","🕟","🕠","🕡","🕢","🕣","🕤","🕥","🕦"],"one":["🕐","🕜","🩱","🔞"],"three":["🕒","🕞"],"five":["🕔","🕠"],"six":["🕕","🕡","🔯"],"seven":["🕖","🕢"],"eight":["🕗","🕣","✳️","✴️"],"nine":["🕘","🕤"],"ten":["🕙","🕥"],"eleven":["🕚","🕦"],"new":["🌑","🌚","🆕","🇳🇨","🇳🇿","🇵🇬"],"wax":["🌒","🌔"],"crescent":["🌒","🌘","🌙","☪️"],"first":["🌓","🌛"],"quarter":["🌓","🌗","🌛","🌜"],"gibbous":["🌔","🌖"],"full":["🌕","🌝"],"wane":["🌖","🌘"],"last":["🌗","🌜","⏮️"],"sun":["☀️","🌞","⛅","🌤️","🌥️","🌦️"],"ringed":["🪐"],"planet":["🪐"],"glow":["🌟"],"shoot":["🌠"],"milky":["🌌"],"way":["🌌"],"cloud":["☁️","⛅","⛈️","🌤️","🌥️","🌦️","🌧️","🌨️","🌩️"],"behind":["⛅","🌤️","🌥️","🌦️"],"lightning":["⛈️","🌩️"],"rain":["⛈️","🌦️","🌧️","☔"],"large":["🌥️","⬛","⬜","🔶","🔷"],"tornado":["🌪️"],"fog":["🌫️"],"cyclone":["🌀"],"rainbow":["🌈","🏳️‍🌈"],"drops":["☔"],"ground":["⛱️"],"voltage":["⚡"],"snowflake":["❄️"],"snowman":["☃️","⛄"],"comet":["☄️"],"droplet":["💧"],"jack":["🎃"],"lantern":["🎃","🏮"],"christmas":["🎄","🇨🇽"],"fireworks":["🎆"],"sparkler":["🎇"],"firecracker":["🧨"],"sparkles":["✨"],"popper":["🎉"],"confetti":["🎊"],"tanabata":["🎋"],"pine":["🎍"],"dolls":["🎎","🪆"],"carp":["🎏"],"streamer":["🎏"],"chime":["🎐"],"view":["🎑"],"ceremony":["🎑"],"envelope":["🧧","✉️","📨","📩"],"wrapped":["🎁"],"gift":["🎁"],"reminder":["🎗️"],"admission":["🎟️"],"tickets":["🎟️"],"ticket":["🎫"],"military":["🎖️","🪖"],"medal":["🎖️","🏅","🥇","🥈","🥉"],"trophy":["🏆"],"sports":["🏅"],"1st":["🥇"],"place":["🥇","🥈","🥉","🛐"],"2nd":["🥈"],"3rd":["🥉"],"soccer":["⚽"],"baseball":["⚾"],"softball":["🥎"],"basketball":["🏀"],"volleyball":["🏐"],"american":["🏈","🇦🇸"],"football":["🏈","🏉"],"rugby":["🏉"],"tennis":["🎾"],"disc":["🥏"],"game":["🏏","🎮","🎲"],"field":["🏑"],"hockey":["🏑","🏒"],"lacrosse":["🥍"],"ping":["🏓"],"pong":["🏓"],"badminton":["🏸"],"glove":["🥊"],"martial":["🥋"],"arts":["🥋","🎭"],"uniform":["🥋"],"goal":["🥅"],"net":["🥅"],"flag":["⛳","📫","📪","📬","📭","🏁","🚩","🏴","🏳️","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇦🇨","🇦🇩","🇦🇪","🇦🇫","🇦🇬","🇦🇮","🇦🇱","🇦🇲","🇦🇴","🇦🇶","🇦🇷","🇦🇸","🇦🇹","🇦🇺","🇦🇼","🇦🇽","🇦🇿","🇧🇦","🇧🇧","🇧🇩","🇧🇪","🇧🇫","🇧🇬","🇧🇭","🇧🇮","🇧🇯","🇧🇱","🇧🇲","🇧🇳","🇧🇴","🇧🇶","🇧🇷","🇧🇸","🇧🇹","🇧🇻","🇧🇼","🇧🇾","🇧🇿","🇨🇦","🇨🇨","🇨🇩","🇨🇫","🇨🇬","🇨🇭","🇨🇮","🇨🇰","🇨🇱","🇨🇲","🇨🇳","🇨🇴","🇨🇵","🇨🇷","🇨🇺","🇨🇻","🇨🇼","🇨🇽","🇨🇾","🇨🇿","🇩🇪","🇩🇬","🇩🇯","🇩🇰","🇩🇲","🇩🇴","🇩🇿","🇪🇦","🇪🇨","🇪🇪","🇪🇬","🇪🇭","🇪🇷","🇪🇸","🇪🇹","🇪🇺","🇫🇮","🇫🇯","🇫🇰","🇫🇲","🇫🇴","🇫🇷","🇬🇦","🇬🇧","🇬🇩","🇬🇪","🇬🇫","🇬🇬","🇬🇭","🇬🇮","🇬🇱","🇬🇲","🇬🇳","🇬🇵","🇬🇶","🇬🇷","🇬🇸","🇬🇹","🇬🇺","🇬🇼","🇬🇾","🇭🇰","🇭🇲","🇭🇳","🇭🇷","🇭🇹","🇭🇺","🇮🇨","🇮🇩","🇮🇪","🇮🇱","🇮🇲","🇮🇳","🇮🇴","🇮🇶","🇮🇷","🇮🇸","🇮🇹","🇯🇪","🇯🇲","🇯🇴","🇯🇵","🇰🇪","🇰🇬","🇰🇭","🇰🇮","🇰🇲","🇰🇳","🇰🇵","🇰🇷","🇰🇼","🇰🇾","🇰🇿","🇱🇦","🇱🇧","🇱🇨","🇱🇮","🇱🇰","🇱🇷","🇱🇸","🇱🇹","🇱🇺","🇱🇻","🇱🇾","🇲🇦","🇲🇨","🇲🇩","🇲🇪","🇲🇫","🇲🇬","🇲🇭","🇲🇰","🇲🇱","🇲🇲","🇲🇳","🇲🇴","🇲🇵","🇲🇶","🇲🇷","🇲🇸","🇲🇹","🇲🇺","🇲🇻","🇲🇼","🇲🇽","🇲🇾","🇲🇿","🇳🇦","🇳🇨","🇳🇪","🇳🇫","🇳🇬","🇳🇮","🇳🇱","🇳🇴","🇳🇵","🇳🇷","🇳🇺","🇳🇿","🇴🇲","🇵🇦","🇵🇪","🇵🇫","🇵🇬","🇵🇭","🇵🇰","🇵🇱","🇵🇲","🇵🇳","🇵🇷","🇵🇸","🇵🇹","🇵🇼","🇵🇾","🇶🇦","🇷🇪","🇷🇴","🇷🇸","🇷🇺","🇷🇼","🇸🇦","🇸🇧","🇸🇨","🇸🇩","🇸🇪","🇸🇬","🇸🇭","🇸🇮","🇸🇯","🇸🇰","🇸🇱","🇸🇲","🇸🇳","🇸🇴","🇸🇷","🇸🇸","🇸🇹","🇸🇻","🇸🇽","🇸🇾","🇸🇿","🇹🇦","🇹🇨","🇹🇩","🇹🇫","🇹🇬","🇹🇭","🇹🇯","🇹🇰","🇹🇱","🇹🇲","🇹🇳","🇹🇴","🇹🇷","🇹🇹","🇹🇻","🇹🇼","🇹🇿","🇺🇦","🇺🇬","🇺🇲","🇺🇳","🇺🇸","🇺🇾","🇺🇿","🇻🇦","🇻🇨","🇻🇪","🇻🇬","🇻🇮","🇻🇳","🇻🇺","🇼🇫","🇼🇸","🇽🇰","🇾🇪","🇾🇹","🇿🇦","🇿🇲","🇿🇼","🏴󠁧󠁢󠁥󠁮󠁧󠁿","🏴󠁧󠁢󠁳󠁣󠁴󠁿","🏴󠁧󠁢󠁷󠁬󠁳󠁿"],"dive":["🤿"],"shirt":["🎽","👕"],"skis":["🎿"],"sled":["🛷"],"curl":["🥌","📃"],"stone":["🥌","💎"],"bullseye":["🎯"],"yo":["🪀"],"kite":["🪁"],"pistol":["🔫"],"pool":["🎱"],"crystal":["🔮"],"magic":["🪄"],"wand":["🪄"],"video":["🎮","📹"],"joystick":["🕹️"],"slot":["🎰"],"machine":["🎰","📠"],"die":["🎲"],"puzzle":["🧩"],"piece":["🧩","🩱"],"teddy":["🧸"],"pinata":["🪅"],"mirror":["🪩","🪞"],"spade":["♠️"],"diamond":["♦️","🔶","🔷","🔸","🔹","💠"],"club":["♣️"],"chess":["♟️"],"pawn":["♟️"],"joker":["🃏"],"mahjong":["🀄"],"cards":["🎴"],"perform":["🎭"],"framed":["🖼️"],"picture":["🖼️"],"palette":["🎨"],"thread":["🧵"],"sew":["🪡"],"needle":["🪡"],"yarn":["🧶"],"knot":["🪢"],"goggles":["🥽"],"lab":["🥼"],"coat":["🥼","🧥"],"safety":["🦺","🧷"],"vest":["🦺"],"necktie":["👔"],"jeans":["👖"],"scarf":["🧣"],"gloves":["🧤"],"socks":["🧦"],"dress":["👗"],"kimono":["👘"],"sari":["🥻"],"swimsuit":["🩱"],"briefs":["🩲"],"shorts":["🩳"],"bikini":["👙"],"clothes":["👚"],"fold":["🪭"],"fan":["🪭"],"purse":["👛"],"handbag":["👜"],"clutch":["👝"],"bag":["👝","💰"],"shop":["🛍️","🛒"],"bags":["🛍️"],"backpack":["🎒"],"thong":["🩴"],"sandal":["🩴","👡"],"shoe":["👞","👟","🥿","👠"],"hike":["🥾"],"boot":["🥾","👢"],"flat":["🥿"],"heeled":["👠"],"ballet":["🩰"],"shoes":["🩰"],"pick":["🪮","⛏️","⚒️"],"top":["🎩","🔝"],"graduation":["🎓"],"cap":["🎓","🧢"],"billed":["🧢"],"helmet":["🪖","⛑️"],"rescue":["⛑️"],"prayer":["📿"],"beads":["📿"],"lipstick":["💄"],"gem":["💎"],"muted":["🔇"],"speaker":["🔇","🔈","🔉","🔊"],"low":["🔈","🪫"],"volume":["🔈","🔉","🔊"],"medium":["🔉","◼️","◻️","◾","◽"],"loudspeaker":["📢"],"megaphone":["📣"],"postal":["📯"],"horn":["📯"],"slash":["🔕"],"musical":["🎼","🎵","🎶","🎹"],"score":["🎼"],"note":["🎵"],"notes":["🎶"],"studio":["🎙️"],"microphone":["🎙️","🎤"],"level":["🎚️"],"slider":["🎚️"],"control":["🎛️","🛂"],"knobs":["🎛️"],"headphone":["🎧"],"radio":["📻","🔘"],"saxophone":["🎷"],"accordion":["🪗"],"guitar":["🎸"],"keyboard":["🎹","⌨️"],"trumpet":["🎺"],"violin":["🎻"],"banjo":["🪕"],"long":["🪘"],"maracas":["🪇"],"flute":["🪈"],"mobile":["📱","📲","📵","📴"],"phone":["📱","📲","📴"],"telephone":["☎️","📞"],"receiver":["📞"],"pager":["📟"],"fax":["📠"],"battery":["🔋","🪫"],"electric":["🔌"],"plug":["🔌"],"laptop":["💻"],"desktop":["🖥️"],"computer":["🖥️","🖱️","💽"],"printer":["🖨️"],"trackball":["🖲️"],"disk":["💽","💾","💿"],"floppy":["💾"],"optical":["💿"],"dvd":["📀"],"abacus":["🧮"],"movie":["🎥"],"camera":["🎥","📷","📸","📹"],"film":["🎞️","📽️"],"frames":["🎞️"],"projector":["📽️"],"clapper":["🎬"],"board":["🎬"],"television":["📺"],"flash":["📸"],"videocassette":["📼"],"magnify":["🔍","🔎"],"tilted":["🔍","🔎"],"candle":["🕯️"],"bulb":["💡"],"flashlight":["🔦"],"paper":["🏮","🧻"],"diya":["🪔"],"lamp":["🪔","🛋️"],"notebook":["📔","📓"],"decorative":["📔"],"cover":["📔"],"book":["📕","📖","📗","📘","📙"],"books":["📚"],"ledger":["📒"],"page":["📃","📄"],"scroll":["📜"],"newspaper":["📰","🗞️"],"rolled":["🗞️"],"bookmark":["📑","🔖"],"tabs":["📑"],"label":["🏷️"],"coin":["🪙"],"yen":["💴","💹"],"banknote":["💴","💵","💶","💷"],"dollar":["💵","💲"],"euro":["💶"],"pound":["💷"],"wings":["💸"],"credit":["💳"],"card":["💳","🗂️","📇","🗃️","🪪"],"receipt":["🧾"],"chart":["💹","📈","📉","📊"],"increase":["💹","📈"],"mail":["📧"],"income":["📨"],"outbox":["📤"],"tray":["📤","📥"],"inbox":["📥"],"package":["📦"],"mailbox":["📫","📪","📬","📭"],"lowered":["📪","📭"],"postbox":["📮"],"ballot":["🗳️"],"pencil":["✏️"],"nib":["✒️"],"pen":["🖋️","🖊️","🔏"],"paintbrush":["🖌️"],"crayon":["🖍️"],"memo":["📝"],"briefcase":["💼"],"file":["📁","📂","🗃️","🗄️"],"folder":["📁","📂"],"dividers":["🗂️"],"calendar":["📅","📆","🗓️"],"off":["📆","📴"],"notepad":["🗒️"],"decrease":["📉"],"clipboard":["📋"],"pushpin":["📌","📍"],"round":["📍"],"paperclip":["📎"],"linked":["🖇️"],"paperclips":["🖇️"],"straight":["📏"],"ruler":["📏","📐"],"triangular":["📐","🚩"],"scissors":["✂️"],"cabinet":["🗄️"],"wastebasket":["🗑️"],"locked":["🔒","🔏","🔐"],"unlocked":["🔓"],"key":["🔐","🔑","🗝️"],"hammer":["🔨","⚒️","🛠️"],"axe":["🪓"],"wrench":["🛠️","🔧"],"dagger":["🗡️"],"swords":["⚔️"],"bomb":["💣"],"boomerang":["🪃"],"shield":["🛡️"],"carpentry":["🪚"],"saw":["🪚"],"screwdriver":["🪛"],"nut":["🔩"],"bolt":["🔩"],"gear":["⚙️"],"clamp":["🗜️"],"balance":["⚖️"],"scale":["⚖️"],"link":["🔗"],"chains":["⛓️"],"hook":["🪝"],"toolbox":["🧰"],"magnet":["🧲"],"ladder":["🪜"],"alembic":["⚗️"],"test":["🧪"],"tube":["🧪"],"petri":["🧫"],"dish":["🧫"],"dna":["🧬"],"microscope":["🔬"],"telescope":["🔭"],"antenna":["📡","📶"],"syringe":["💉"],"drop":["🩸"],"blood":["🩸","🅰️","🆎","🅱️","🅾️"],"pill":["💊"],"adhesive":["🩹"],"crutch":["🩼"],"stethoscope":["🩺"],"ray":["🩻"],"door":["🚪"],"elevator":["🛗"],"window":["🪟"],"couch":["🛋️"],"chair":["🪑"],"toilet":["🚽"],"plunger":["🪠"],"shower":["🚿"],"bathtub":["🛁"],"trap":["🪤"],"razor":["🪒"],"lotion":["🧴"],"pin":["🧷"],"broom":["🧹"],"basket":["🧺"],"bucket":["🪣"],"soap":["🧼"],"bubbles":["🫧"],"toothbrush":["🪥"],"sponge":["🧽"],"extinguisher":["🧯"],"cart":["🛒"],"cigarette":["🚬"],"coffin":["⚰️"],"headstone":["🪦"],"funeral":["⚱️"],"urn":["⚱️"],"nazar":["🧿"],"amulet":["🧿"],"hamsa":["🪬"],"moai":["🗿"],"placard":["🪧"],"identification":["🪪"],"atm":["🏧"],"litter":["🚮","🚯"],"bin":["🚮"],"potable":["🚰","🚱"],"restroom":["🚻"],"closet":["🚾"],"passport":["🛂"],"customs":["🛃"],"baggage":["🛄"],"claim":["🛄"],"warn":["⚠️"],"children":["🚸"],"cross":["🚸","✝️","☦️","❌","❎"],"entry":["⛔"],"prohibited":["🚫","🈲"],"bicycles":["🚳"],"smoke":["🚭"],"non":["🚱"],"pedestrians":["🚷"],"phones":["📵"],"under":["🔞"],"eighteen":["🔞"],"radioactive":["☢️"],"biohazard":["☣️"],"curve":["↩️","↪️","⤴️","⤵️"],"clockwise":["🔃"],"arrows":["🔃","🔄"],"counterclockwise":["🔄"],"button":["🔄","🔀","🔁","🔂","▶️","⏩","⏭️","⏯️","◀️","⏪","⏮️","🔼","⏫","🔽","⏬","⏸️","⏹️","⏺️","⏏️","🔅","🔆","✅","❎","🅰️","🆎","🅱️","🆑","🆒","🆓","🆔","🆕","🆖","🅾️","🆗","🅿️","🆘","🆙","🆚","🈁","🈂️","🈷️","🈶","🈯","🉐","🈹","🈚","🈲","🉑","🈸","🈴","🈳","㊗️","㊙️","🈺","🈵","🔘","🔳","🔲"],"end":["🔚"],"soon":["🔜"],"worship":["🛐"],"atom":["⚛️"],"om":["🕉️"],"david":["✡️"],"dharma":["☸️"],"yin":["☯️"],"yang":["☯️"],"latin":["✝️","🔠","🔡","🔤"],"orthodox":["☦️"],"peace":["☮️"],"menorah":["🕎"],"pointed":["🔯","✴️","🔺","🔻"],"khanda":["🪯"],"aries":["♈"],"taurus":["♉"],"gemini":["♊"],"cancer":["♋"],"leo":["♌"],"virgo":["♍"],"libra":["♎"],"scorpio":["♏"],"sagittarius":["♐"],"capricorn":["♑"],"aquarius":["♒"],"pisces":["♓"],"ophiuchus":["⛎"],"shuffle":["🔀"],"tracks":["🔀"],"repeat":["🔁","🔂"],"single":["🔂"],"fast":["⏩","⏪","⏫","⏬"],"forward":["⏩"],"next":["⏭️"],"or":["⏯️"],"pause":["⏯️","⏸️"],"reverse":["◀️","⏪"],"upwards":["🔼"],"downwards":["🔽"],"record":["⏺️"],"eject":["⏏️"],"cinema":["🎦"],"dim":["🔅"],"bright":["🔆"],"bars":["📶"],"wireless":["🛜"],"vibration":["📳"],"mode":["📳"],"female":["♀️"],"male":["♂️"],"transgender":["⚧️","🏳️‍⚧️"],"multiply":["✖️"],"plus":["➕"],"minus":["➖"],"divide":["➗"],"heavy":["🟰","💲"],"equals":["🟰"],"infinity":["♾️"],"double":["‼️","➿"],"question":["⁉️","❓","❔"],"wavy":["〰️"],"currency":["💱"],"exchange":["💱"],"recycle":["♻️"],"fleur":["⚜️"],"de":["⚜️"],"lis":["⚜️"],"trident":["🔱"],"emblem":["🔱"],"name":["📛"],"badge":["📛"],"for":["🔰","🈺"],"beginner":["🔰"],"hollow":["⭕"],"circle":["⭕","🔴","🟠","🟡","🟢","🔵","🟣","🟤","⚫","⚪"],"check":["✅","☑️","✔️"],"loop":["➰","➿"],"part":["〽️"],"alternation":["〽️"],"spoked":["✳️"],"asterisk":["✳️"],"copyright":["©️"],"registered":["®️"],"trade":["™️"],"keycap":["#️⃣","*️⃣","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"],"input":["🔠","🔡","🔢","🔣","🔤"],"uppercase":["🔠"],"lowercase":["🔡"],"numbers":["🔢"],"letters":["🔤"],"type":["🅰️","🆎","🅱️","🅾️"],"ab":["🆎"],"cl":["🆑"],"cool":["🆒"],"free":["🆓","🈶","🈚"],"information":["ℹ️"],"id":["🆔"],"circled":["Ⓜ️"],"ng":["🆖"],"sos":["🆘"],"vs":["🆚"],"here":["🈁"],"charge":["🈂️","🈶","🈚"],"monthly":["🈷️"],"amount":["🈷️"],"reserved":["🈯"],"bargain":["🉐"],"discount":["🈹"],"acceptable":["🉑"],"application":["🈸"],"pass":["🈴"],"grade":["🈴"],"vacancy":["🈳","🈵"],"congratulations":["㊗️"],"secret":["㊙️"],"business":["🈺"],"square":["🟥","🟧","🟨","🟩","🟦","🟪","🟫","⬛","⬜","◼️","◻️","◾","◽","▪️","▫️","🔳","🔲"],"triangle":["🔺","🔻"],"dot":["💠"],"chequered":["🏁"],"flags":["🎌"],"pirate":["🏴‍☠️"],"ascension":["🇦🇨"],"andorra":["🇦🇩"],"united":["🇦🇪","🇬🇧","🇺🇳","🇺🇸"],"arab":["🇦🇪"],"emirates":["🇦🇪"],"afghanistan":["🇦🇫"],"antigua":["🇦🇬"],"barbuda":["🇦🇬"],"anguilla":["🇦🇮"],"albania":["🇦🇱"],"armenia":["🇦🇲"],"angola":["🇦🇴"],"antarctica":["🇦🇶"],"argentina":["🇦🇷"],"samoa":["🇦🇸","🇼🇸"],"austria":["🇦🇹"],"aruba":["🇦🇼"],"aland":["🇦🇽"],"islands":["🇦🇽","🇨🇨","🇨🇰","🇫🇰","🇫🇴","🇬🇸","🇭🇲","🇮🇨","🇰🇾","🇲🇭","🇲🇵","🇵🇳","🇸🇧","🇹🇨","🇺🇲","🇻🇬","🇻🇮"],"azerbaijan":["🇦🇿"],"bosnia":["🇧🇦"],"herzegovina":["🇧🇦"],"barbados":["🇧🇧"],"bangladesh":["🇧🇩"],"belgium":["🇧🇪"],"burkina":["🇧🇫"],"faso":["🇧🇫"],"bulgaria":["🇧🇬"],"bahrain":["🇧🇭"],"burundi":["🇧🇮"],"benin":["🇧🇯"],"st":["🇧🇱","🇰🇳","🇱🇨","🇲🇫","🇵🇲","🇸🇭","🇻🇨"],"barthelemy":["🇧🇱"],"bermuda":["🇧🇲"],"brunei":["🇧🇳"],"bolivia":["🇧🇴"],"caribbean":["🇧🇶"],"netherlands":["🇧🇶","🇳🇱"],"brazil":["🇧🇷"],"bahamas":["🇧🇸"],"bhutan":["🇧🇹"],"bouvet":["🇧🇻"],"botswana":["🇧🇼"],"belarus":["🇧🇾"],"belize":["🇧🇿"],"canada":["🇨🇦"],"cocos":["🇨🇨"],"keel":["🇨🇨"],"congo":["🇨🇩","🇨🇬"],"kinshasa":["🇨🇩"],"central":["🇨🇫"],"african":["🇨🇫"],"republic":["🇨🇫","🇩🇴"],"brazzaville":["🇨🇬"],"switzerland":["🇨🇭"],"cote":["🇨🇮"],"ivoire":["🇨🇮"],"chile":["🇨🇱"],"cameroon":["🇨🇲"],"china":["🇨🇳","🇭🇰","🇲🇴"],"colombia":["🇨🇴"],"clipperton":["🇨🇵"],"costa":["🇨🇷"],"rica":["🇨🇷"],"cuba":["🇨🇺"],"cape":["🇨🇻"],"verde":["🇨🇻"],"curacao":["🇨🇼"],"cyprus":["🇨🇾"],"czechia":["🇨🇿"],"germany":["🇩🇪"],"diego":["🇩🇬"],"garcia":["🇩🇬"],"djibouti":["🇩🇯"],"denmark":["🇩🇰"],"dominica":["🇩🇲"],"dominican":["🇩🇴"],"algeria":["🇩🇿"],"ceuta":["🇪🇦"],"melilla":["🇪🇦"],"ecuador":["🇪🇨"],"estonia":["🇪🇪"],"egypt":["🇪🇬"],"western":["🇪🇭"],"sahara":["🇪🇭"],"eritrea":["🇪🇷"],"spain":["🇪🇸"],"ethiopia":["🇪🇹"],"european":["🇪🇺"],"union":["🇪🇺"],"finland":["🇫🇮"],"fiji":["🇫🇯"],"falkland":["🇫🇰"],"micronesia":["🇫🇲"],"faroe":["🇫🇴"],"france":["🇫🇷"],"gabon":["🇬🇦"],"kingdom":["🇬🇧"],"grenada":["🇬🇩"],"georgia":["🇬🇪","🇬🇸"],"guiana":["🇬🇫"],"guernsey":["🇬🇬"],"ghana":["🇬🇭"],"gibraltar":["🇬🇮"],"greenland":["🇬🇱"],"gambia":["🇬🇲"],"guinea":["🇬🇳","🇬🇶","🇬🇼","🇵🇬"],"guadeloupe":["🇬🇵"],"equatorial":["🇬🇶"],"greece":["🇬🇷"],"south":["🇬🇸","🇰🇷","🇸🇸","🇿🇦"],"guatemala":["🇬🇹"],"guam":["🇬🇺"],"bissau":["🇬🇼"],"guyana":["🇬🇾"],"hong":["🇭🇰"],"kong":["🇭🇰"],"sar":["🇭🇰","🇲🇴"],"heard":["🇭🇲"],"mcdonald":["🇭🇲"],"honduras":["🇭🇳"],"croatia":["🇭🇷"],"haiti":["🇭🇹"],"hungary":["🇭🇺"],"canary":["🇮🇨"],"indonesia":["🇮🇩"],"ireland":["🇮🇪"],"israel":["🇮🇱"],"isle":["🇮🇲"],"india":["🇮🇳"],"british":["🇮🇴","🇻🇬"],"indian":["🇮🇴"],"ocean":["🇮🇴"],"territory":["🇮🇴"],"iraq":["🇮🇶"],"iran":["🇮🇷"],"iceland":["🇮🇸"],"italy":["🇮🇹"],"jersey":["🇯🇪"],"jamaica":["🇯🇲"],"jordan":["🇯🇴"],"kenya":["🇰🇪"],"kyrgyzstan":["🇰🇬"],"cambodia":["🇰🇭"],"kiribati":["🇰🇮"],"comoros":["🇰🇲"],"kitts":["🇰🇳"],"nevis":["🇰🇳"],"north":["🇰🇵","🇲🇰"],"korea":["🇰🇵","🇰🇷"],"kuwait":["🇰🇼"],"cayman":["🇰🇾"],"kazakhstan":["🇰🇿"],"laos":["🇱🇦"],"lebanon":["🇱🇧"],"lucia":["🇱🇨"],"liechtenstein":["🇱🇮"],"sri":["🇱🇰"],"lanka":["🇱🇰"],"liberia":["🇱🇷"],"lesotho":["🇱🇸"],"lithuania":["🇱🇹"],"luxembourg":["🇱🇺"],"latvia":["🇱🇻"],"libya":["🇱🇾"],"morocco":["🇲🇦"],"monaco":["🇲🇨"],"moldova":["🇲🇩"],"montenegro":["🇲🇪"],"martin":["🇲🇫"],"madagascar":["🇲🇬"],"marshall":["🇲🇭"],"macedonia":["🇲🇰"],"mali":["🇲🇱"],"myanmar":["🇲🇲"],"burma":["🇲🇲"],"mongolia":["🇲🇳"],"macao":["🇲🇴"],"northern":["🇲🇵"],"mariana":["🇲🇵"],"martinique":["🇲🇶"],"mauritania":["🇲🇷"],"montserrat":["🇲🇸"],"malta":["🇲🇹"],"mauritius":["🇲🇺"],"maldives":["🇲🇻"],"malawi":["🇲🇼"],"mexico":["🇲🇽"],"malaysia":["🇲🇾"],"mozambique":["🇲🇿"],"namibia":["🇳🇦"],"caledonia":["🇳🇨"],"niger":["🇳🇪"],"norfolk":["🇳🇫"],"nigeria":["🇳🇬"],"nicaragua":["🇳🇮"],"norway":["🇳🇴"],"nepal":["🇳🇵"],"nauru":["🇳🇷"],"niue":["🇳🇺"],"zealand":["🇳🇿"],"oman":["🇴🇲"],"panama":["🇵🇦"],"peru":["🇵🇪"],"polynesia":["🇵🇫"],"papua":["🇵🇬"],"philippines":["🇵🇭"],"pakistan":["🇵🇰"],"poland":["🇵🇱"],"pierre":["🇵🇲"],"miquelon":["🇵🇲"],"pitcairn":["🇵🇳"],"puerto":["🇵🇷"],"rico":["🇵🇷"],"palestinian":["🇵🇸"],"territories":["🇵🇸","🇹🇫"],"portugal":["🇵🇹"],"palau":["🇵🇼"],"paraguay":["🇵🇾"],"qatar":["🇶🇦"],"reunion":["🇷🇪"],"romania":["🇷🇴"],"serbia":["🇷🇸"],"russia":["🇷🇺"],"rwanda":["🇷🇼"],"saudi":["🇸🇦"],"arabia":["🇸🇦"],"solomon":["🇸🇧"],"seychelles":["🇸🇨"],"sudan":["🇸🇩","🇸🇸"],"sweden":["🇸🇪"],"singapore":["🇸🇬"],"helena":["🇸🇭"],"slovenia":["🇸🇮"],"svalbard":["🇸🇯"],"jan":["🇸🇯"],"mayen":["🇸🇯"],"slovakia":["🇸🇰"],"sierra":["🇸🇱"],"leone":["🇸🇱"],"san":["🇸🇲"],"marino":["🇸🇲"],"senegal":["🇸🇳"],"somalia":["🇸🇴"],"suriname":["🇸🇷"],"sao":["🇸🇹"],"tome":["🇸🇹"],"principe":["🇸🇹"],"el":["🇸🇻"],"salvador":["🇸🇻"],"sint":["🇸🇽"],"maarten":["🇸🇽"],"syria":["🇸🇾"],"eswatini":["🇸🇿"],"tristan":["🇹🇦"],"da":["🇹🇦"],"cunha":["🇹🇦"],"turks":["🇹🇨"],"caicos":["🇹🇨"],"chad":["🇹🇩"],"southern":["🇹🇫"],"togo":["🇹🇬"],"thailand":["🇹🇭"],"tajikistan":["🇹🇯"],"tokelau":["🇹🇰"],"timor":["🇹🇱"],"leste":["🇹🇱"],"turkmenistan":["🇹🇲"],"tunisia":["🇹🇳"],"tonga":["🇹🇴"],"trinidad":["🇹🇹"],"tobago":["🇹🇹"],"tuvalu":["🇹🇻"],"taiwan":["🇹🇼"],"tanzania":["🇹🇿"],"ukraine":["🇺🇦"],"uganda":["🇺🇬"],"us":["🇺🇲","🇻🇮"],"outly":["🇺🇲"],"nations":["🇺🇳"],"states":["🇺🇸"],"uruguay":["🇺🇾"],"uzbekistan":["🇺🇿"],"vatican":["🇻🇦"],"city":["🇻🇦"],"vincent":["🇻🇨"],"grenadines":["🇻🇨"],"venezuela":["🇻🇪"],"virgin":["🇻🇬","🇻🇮"],"vietnam":["🇻🇳"],"vanuatu":["🇻🇺"],"wallis":["🇼🇫"],"futuna":["🇼🇫"],"kosovo":["🇽🇰"],"yemen":["🇾🇪"],"mayotte":["🇾🇹"],"zambia":["🇿🇲"],"zimbabwe":["🇿🇼"],"england":["🏴󠁧󠁢󠁥󠁮󠁧󠁿"],"scotland":["🏴󠁧󠁢󠁳󠁣󠁴󠁿"],"wales":["🏴󠁧󠁢󠁷󠁬󠁳󠁿"]}
},{}],12:[function(require,module,exports){
module.exports={"߀":"0","́":""," ":" ","Ⓐ":"A","Ａ":"A","À":"A","Á":"A","Â":"A","Ầ":"A","Ấ":"A","Ẫ":"A","Ẩ":"A","Ã":"A","Ā":"A","Ă":"A","Ằ":"A","Ắ":"A","Ẵ":"A","Ẳ":"A","Ȧ":"A","Ǡ":"A","Ä":"A","Ǟ":"A","Ả":"A","Å":"A","Ǻ":"A","Ǎ":"A","Ȁ":"A","Ȃ":"A","Ạ":"A","Ậ":"A","Ặ":"A","Ḁ":"A","Ą":"A","Ⱥ":"A","Ɐ":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ⓑ":"B","Ｂ":"B","Ḃ":"B","Ḅ":"B","Ḇ":"B","Ƀ":"B","Ɓ":"B","ｃ":"C","Ⓒ":"C","Ｃ":"C","Ꜿ":"C","Ḉ":"C","Ç":"C","Ⓓ":"D","Ｄ":"D","Ḋ":"D","Ď":"D","Ḍ":"D","Ḑ":"D","Ḓ":"D","Ḏ":"D","Đ":"D","Ɗ":"D","Ɖ":"D","ᴅ":"D","Ꝺ":"D","Ð":"Dh","Ǳ":"DZ","Ǆ":"DZ","ǲ":"Dz","ǅ":"Dz","ɛ":"E","Ⓔ":"E","Ｅ":"E","È":"E","É":"E","Ê":"E","Ề":"E","Ế":"E","Ễ":"E","Ể":"E","Ẽ":"E","Ē":"E","Ḕ":"E","Ḗ":"E","Ĕ":"E","Ė":"E","Ë":"E","Ẻ":"E","Ě":"E","Ȅ":"E","Ȇ":"E","Ẹ":"E","Ệ":"E","Ȩ":"E","Ḝ":"E","Ę":"E","Ḙ":"E","Ḛ":"E","Ɛ":"E","Ǝ":"E","ᴇ":"E","ꝼ":"F","Ⓕ":"F","Ｆ":"F","Ḟ":"F","Ƒ":"F","Ꝼ":"F","Ⓖ":"G","Ｇ":"G","Ǵ":"G","Ĝ":"G","Ḡ":"G","Ğ":"G","Ġ":"G","Ǧ":"G","Ģ":"G","Ǥ":"G","Ɠ":"G","Ꞡ":"G","Ᵹ":"G","Ꝿ":"G","ɢ":"G","Ⓗ":"H","Ｈ":"H","Ĥ":"H","Ḣ":"H","Ḧ":"H","Ȟ":"H","Ḥ":"H","Ḩ":"H","Ḫ":"H","Ħ":"H","Ⱨ":"H","Ⱶ":"H","Ɥ":"H","Ⓘ":"I","Ｉ":"I","Ì":"I","Í":"I","Î":"I","Ĩ":"I","Ī":"I","Ĭ":"I","İ":"I","Ï":"I","Ḯ":"I","Ỉ":"I","Ǐ":"I","Ȉ":"I","Ȋ":"I","Ị":"I","Į":"I","Ḭ":"I","Ɨ":"I","Ⓙ":"J","Ｊ":"J","Ĵ":"J","Ɉ":"J","ȷ":"J","Ⓚ":"K","Ｋ":"K","Ḱ":"K","Ǩ":"K","Ḳ":"K","Ķ":"K","Ḵ":"K","Ƙ":"K","Ⱪ":"K","Ꝁ":"K","Ꝃ":"K","Ꝅ":"K","Ꞣ":"K","Ⓛ":"L","Ｌ":"L","Ŀ":"L","Ĺ":"L","Ľ":"L","Ḷ":"L","Ḹ":"L","Ļ":"L","Ḽ":"L","Ḻ":"L","Ł":"L","Ƚ":"L","Ɫ":"L","Ⱡ":"L","Ꝉ":"L","Ꝇ":"L","Ꞁ":"L","Ǉ":"LJ","ǈ":"Lj","Ⓜ":"M","Ｍ":"M","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ɯ":"M","ϻ":"M","Ꞥ":"N","Ƞ":"N","Ⓝ":"N","Ｎ":"N","Ǹ":"N","Ń":"N","Ñ":"N","Ṅ":"N","Ň":"N","Ṇ":"N","Ņ":"N","Ṋ":"N","Ṉ":"N","Ɲ":"N","Ꞑ":"N","ᴎ":"N","Ǌ":"NJ","ǋ":"Nj","Ⓞ":"O","Ｏ":"O","Ò":"O","Ó":"O","Ô":"O","Ồ":"O","Ố":"O","Ỗ":"O","Ổ":"O","Õ":"O","Ṍ":"O","Ȭ":"O","Ṏ":"O","Ō":"O","Ṑ":"O","Ṓ":"O","Ŏ":"O","Ȯ":"O","Ȱ":"O","Ö":"O","Ȫ":"O","Ỏ":"O","Ő":"O","Ǒ":"O","Ȍ":"O","Ȏ":"O","Ơ":"O","Ờ":"O","Ớ":"O","Ỡ":"O","Ở":"O","Ợ":"O","Ọ":"O","Ộ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Ɔ":"O","Ɵ":"O","Ꝋ":"O","Ꝍ":"O","Œ":"OE","Ƣ":"OI","Ꝏ":"OO","Ȣ":"OU","Ⓟ":"P","Ｐ":"P","Ṕ":"P","Ṗ":"P","Ƥ":"P","Ᵽ":"P","Ꝑ":"P","Ꝓ":"P","Ꝕ":"P","Ⓠ":"Q","Ｑ":"Q","Ꝗ":"Q","Ꝙ":"Q","Ɋ":"Q","Ⓡ":"R","Ｒ":"R","Ŕ":"R","Ṙ":"R","Ř":"R","Ȑ":"R","Ȓ":"R","Ṛ":"R","Ṝ":"R","Ŗ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꝛ":"R","Ꞧ":"R","Ꞃ":"R","Ⓢ":"S","Ｓ":"S","ẞ":"S","Ś":"S","Ṥ":"S","Ŝ":"S","Ṡ":"S","Š":"S","Ṧ":"S","Ṣ":"S","Ṩ":"S","Ș":"S","Ş":"S","Ȿ":"S","Ꞩ":"S","Ꞅ":"S","Ⓣ":"T","Ｔ":"T","Ṫ":"T","Ť":"T","Ṭ":"T","Ț":"T","Ţ":"T","Ṱ":"T","Ṯ":"T","Ŧ":"T","Ƭ":"T","Ʈ":"T","Ⱦ":"T","Ꞇ":"T","Þ":"Th","Ꜩ":"TZ","Ⓤ":"U","Ｕ":"U","Ù":"U","Ú":"U","Û":"U","Ũ":"U","Ṹ":"U","Ū":"U","Ṻ":"U","Ŭ":"U","Ü":"U","Ǜ":"U","Ǘ":"U","Ǖ":"U","Ǚ":"U","Ủ":"U","Ů":"U","Ű":"U","Ǔ":"U","Ȕ":"U","Ȗ":"U","Ư":"U","Ừ":"U","Ứ":"U","Ữ":"U","Ử":"U","Ự":"U","Ụ":"U","Ṳ":"U","Ų":"U","Ṷ":"U","Ṵ":"U","Ʉ":"U","Ⓥ":"V","Ｖ":"V","Ṽ":"V","Ṿ":"V","Ʋ":"V","Ꝟ":"V","Ʌ":"V","Ꝡ":"VY","Ⓦ":"W","Ｗ":"W","Ẁ":"W","Ẃ":"W","Ŵ":"W","Ẇ":"W","Ẅ":"W","Ẉ":"W","Ⱳ":"W","Ⓧ":"X","Ｘ":"X","Ẋ":"X","Ẍ":"X","Ⓨ":"Y","Ｙ":"Y","Ỳ":"Y","Ý":"Y","Ŷ":"Y","Ỹ":"Y","Ȳ":"Y","Ẏ":"Y","Ÿ":"Y","Ỷ":"Y","Ỵ":"Y","Ƴ":"Y","Ɏ":"Y","Ỿ":"Y","Ⓩ":"Z","Ｚ":"Z","Ź":"Z","Ẑ":"Z","Ż":"Z","Ž":"Z","Ẓ":"Z","Ẕ":"Z","Ƶ":"Z","Ȥ":"Z","Ɀ":"Z","Ⱬ":"Z","Ꝣ":"Z","ⓐ":"a","ａ":"a","ẚ":"a","à":"a","á":"a","â":"a","ầ":"a","ấ":"a","ẫ":"a","ẩ":"a","ã":"a","ā":"a","ă":"a","ằ":"a","ắ":"a","ẵ":"a","ẳ":"a","ȧ":"a","ǡ":"a","ä":"a","ǟ":"a","ả":"a","å":"a","ǻ":"a","ǎ":"a","ȁ":"a","ȃ":"a","ạ":"a","ậ":"a","ặ":"a","ḁ":"a","ą":"a","ⱥ":"a","ɐ":"a","ɑ":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ⓑ":"b","ｂ":"b","ḃ":"b","ḅ":"b","ḇ":"b","ƀ":"b","ƃ":"b","ɓ":"b","Ƃ":"b","ⓒ":"c","ć":"c","ĉ":"c","ċ":"c","č":"c","ç":"c","ḉ":"c","ƈ":"c","ȼ":"c","ꜿ":"c","ↄ":"c","C":"c","Ć":"c","Ĉ":"c","Ċ":"c","Č":"c","Ƈ":"c","Ȼ":"c","ⓓ":"d","ｄ":"d","ḋ":"d","ď":"d","ḍ":"d","ḑ":"d","ḓ":"d","ḏ":"d","đ":"d","ƌ":"d","ɖ":"d","ɗ":"d","Ƌ":"d","Ꮷ":"d","ԁ":"d","Ɦ":"d","ð":"dh","ǳ":"dz","ǆ":"dz","ⓔ":"e","ｅ":"e","è":"e","é":"e","ê":"e","ề":"e","ế":"e","ễ":"e","ể":"e","ẽ":"e","ē":"e","ḕ":"e","ḗ":"e","ĕ":"e","ė":"e","ë":"e","ẻ":"e","ě":"e","ȅ":"e","ȇ":"e","ẹ":"e","ệ":"e","ȩ":"e","ḝ":"e","ę":"e","ḙ":"e","ḛ":"e","ɇ":"e","ǝ":"e","ⓕ":"f","ｆ":"f","ḟ":"f","ƒ":"f","ﬀ":"ff","ﬁ":"fi","ﬂ":"fl","ﬃ":"ffi","ﬄ":"ffl","ⓖ":"g","ｇ":"g","ǵ":"g","ĝ":"g","ḡ":"g","ğ":"g","ġ":"g","ǧ":"g","ģ":"g","ǥ":"g","ɠ":"g","ꞡ":"g","ꝿ":"g","ᵹ":"g","ⓗ":"h","ｈ":"h","ĥ":"h","ḣ":"h","ḧ":"h","ȟ":"h","ḥ":"h","ḩ":"h","ḫ":"h","ẖ":"h","ħ":"h","ⱨ":"h","ⱶ":"h","ɥ":"h","ƕ":"hv","ⓘ":"i","ｉ":"i","ì":"i","í":"i","î":"i","ĩ":"i","ī":"i","ĭ":"i","ï":"i","ḯ":"i","ỉ":"i","ǐ":"i","ȉ":"i","ȋ":"i","ị":"i","į":"i","ḭ":"i","ɨ":"i","ı":"i","ⓙ":"j","ｊ":"j","ĵ":"j","ǰ":"j","ɉ":"j","ⓚ":"k","ｋ":"k","ḱ":"k","ǩ":"k","ḳ":"k","ķ":"k","ḵ":"k","ƙ":"k","ⱪ":"k","ꝁ":"k","ꝃ":"k","ꝅ":"k","ꞣ":"k","ⓛ":"l","ｌ":"l","ŀ":"l","ĺ":"l","ľ":"l","ḷ":"l","ḹ":"l","ļ":"l","ḽ":"l","ḻ":"l","ſ":"l","ł":"l","ƚ":"l","ɫ":"l","ⱡ":"l","ꝉ":"l","ꞁ":"l","ꝇ":"l","ɭ":"l","ǉ":"lj","ⓜ":"m","ｍ":"m","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ɯ":"m","ⓝ":"n","ｎ":"n","ǹ":"n","ń":"n","ñ":"n","ṅ":"n","ň":"n","ṇ":"n","ņ":"n","ṋ":"n","ṉ":"n","ƞ":"n","ɲ":"n","ŉ":"n","ꞑ":"n","ꞥ":"n","ԉ":"n","ǌ":"nj","ⓞ":"o","ｏ":"o","ò":"o","ó":"o","ô":"o","ồ":"o","ố":"o","ỗ":"o","ổ":"o","õ":"o","ṍ":"o","ȭ":"o","ṏ":"o","ō":"o","ṑ":"o","ṓ":"o","ŏ":"o","ȯ":"o","ȱ":"o","ö":"o","ȫ":"o","ỏ":"o","ő":"o","ǒ":"o","ȍ":"o","ȏ":"o","ơ":"o","ờ":"o","ớ":"o","ỡ":"o","ở":"o","ợ":"o","ọ":"o","ộ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","ꝋ":"o","ꝍ":"o","ɵ":"o","ɔ":"o","ᴑ":"o","œ":"oe","ƣ":"oi","ꝏ":"oo","ȣ":"ou","ⓟ":"p","ｐ":"p","ṕ":"p","ṗ":"p","ƥ":"p","ᵽ":"p","ꝑ":"p","ꝓ":"p","ꝕ":"p","ρ":"p","ⓠ":"q","ｑ":"q","ɋ":"q","ꝗ":"q","ꝙ":"q","ⓡ":"r","ｒ":"r","ŕ":"r","ṙ":"r","ř":"r","ȑ":"r","ȓ":"r","ṛ":"r","ṝ":"r","ŗ":"r","ṟ":"r","ɍ":"r","ɽ":"r","ꝛ":"r","ꞧ":"r","ꞃ":"r","ⓢ":"s","ｓ":"s","ś":"s","ṥ":"s","ŝ":"s","ṡ":"s","š":"s","ṧ":"s","ṣ":"s","ṩ":"s","ș":"s","ş":"s","ȿ":"s","ꞩ":"s","ꞅ":"s","ẛ":"s","ʂ":"s","ß":"ss","ⓣ":"t","ｔ":"t","ṫ":"t","ẗ":"t","ť":"t","ṭ":"t","ț":"t","ţ":"t","ṱ":"t","ṯ":"t","ŧ":"t","ƭ":"t","ʈ":"t","ⱦ":"t","ꞇ":"t","þ":"th","ꜩ":"tz","ⓤ":"u","ｕ":"u","ù":"u","ú":"u","û":"u","ũ":"u","ṹ":"u","ū":"u","ṻ":"u","ŭ":"u","ü":"u","ǜ":"u","ǘ":"u","ǖ":"u","ǚ":"u","ủ":"u","ů":"u","ű":"u","ǔ":"u","ȕ":"u","ȗ":"u","ư":"u","ừ":"u","ứ":"u","ữ":"u","ử":"u","ự":"u","ụ":"u","ṳ":"u","ų":"u","ṷ":"u","ṵ":"u","ʉ":"u","ⓥ":"v","ｖ":"v","ṽ":"v","ṿ":"v","ʋ":"v","ꝟ":"v","ʌ":"v","ꝡ":"vy","ⓦ":"w","ｗ":"w","ẁ":"w","ẃ":"w","ŵ":"w","ẇ":"w","ẅ":"w","ẘ":"w","ẉ":"w","ⱳ":"w","ⓧ":"x","ｘ":"x","ẋ":"x","ẍ":"x","ⓨ":"y","ｙ":"y","ỳ":"y","ý":"y","ŷ":"y","ỹ":"y","ȳ":"y","ẏ":"y","ÿ":"y","ỷ":"y","ẙ":"y","ỵ":"y","ƴ":"y","ɏ":"y","ỿ":"y","ⓩ":"z","ｚ":"z","ź":"z","ẑ":"z","ż":"z","ž":"z","ẓ":"z","ẕ":"z","ƶ":"z","ȥ":"z","ɀ":"z","ⱬ":"z","ꝣ":"z"}
},{}],13:[function(require,module,exports){
module.exports=[{"s":9728,"e":9747,"w":1},{"s":9748,"e":9749,"w":2},{"s":9750,"e":9799,"w":1},{"s":9800,"e":9811,"w":2},{"s":9812,"e":9854,"w":1},{"s":9855,"e":9855,"w":2},{"s":9856,"e":9874,"w":1},{"s":9875,"e":9875,"w":2},{"s":9876,"e":9888,"w":1},{"s":9889,"e":9889,"w":2},{"s":9890,"e":9897,"w":1},{"s":9898,"e":9899,"w":2},{"s":9900,"e":9916,"w":1},{"s":9917,"e":9918,"w":2},{"s":9919,"e":9923,"w":1},{"s":9924,"e":9925,"w":2},{"s":9926,"e":9933,"w":1},{"s":9934,"e":9934,"w":2},{"s":9935,"e":9939,"w":1},{"s":9940,"e":9940,"w":2},{"s":9941,"e":9961,"w":1},{"s":9962,"e":9962,"w":2},{"s":9963,"e":9969,"w":1},{"s":9970,"e":9971,"w":2},{"s":9972,"e":9972,"w":1},{"s":9973,"e":9973,"w":2},{"s":9974,"e":9977,"w":1},{"s":9978,"e":9978,"w":2},{"s":9979,"e":9980,"w":1},{"s":9981,"e":9981,"w":2},{"s":9982,"e":9983,"w":1},{"s":9984,"e":9988,"w":1},{"s":9989,"e":9989,"w":2},{"s":9990,"e":9993,"w":1},{"s":9994,"e":9995,"w":2},{"s":9996,"e":10023,"w":1},{"s":10024,"e":10024,"w":2},{"s":10025,"e":10059,"w":1},{"s":10060,"e":10060,"w":2},{"s":10061,"e":10061,"w":1},{"s":10062,"e":10062,"w":2},{"s":10063,"e":10066,"w":1},{"s":10067,"e":10069,"w":2},{"s":10070,"e":10070,"w":1},{"s":10071,"e":10071,"w":2},{"s":10072,"e":10132,"w":1},{"s":10133,"e":10135,"w":2},{"s":10136,"e":10159,"w":1},{"s":10160,"e":10160,"w":2},{"s":10161,"e":10174,"w":1},{"s":10175,"e":10175,"w":2},{"s":126976,"e":126979,"w":1},{"s":126980,"e":126980,"w":2},{"s":126981,"e":127182,"w":1},{"s":127183,"e":127183,"w":2},{"s":127184,"e":127373,"w":1},{"s":127374,"e":127374,"w":2},{"s":127375,"e":127376,"w":1},{"s":127377,"e":127386,"w":2},{"s":127387,"e":127487,"w":1},{"s":127744,"e":127776,"w":2},{"s":127777,"e":127788,"w":1},{"s":127789,"e":127797,"w":2},{"s":127798,"e":127798,"w":1},{"s":127799,"e":127868,"w":2},{"s":127869,"e":127869,"w":1},{"s":127870,"e":127891,"w":2},{"s":127892,"e":127903,"w":1},{"s":127904,"e":127946,"w":2},{"s":127947,"e":127950,"w":1},{"s":127951,"e":127955,"w":2},{"s":127956,"e":127967,"w":1},{"s":127968,"e":127984,"w":2},{"s":127985,"e":127987,"w":1},{"s":127988,"e":127988,"w":2},{"s":127989,"e":127991,"w":1},{"s":127992,"e":127994,"w":2},{"s":128000,"e":128062,"w":2},{"s":128063,"e":128063,"w":1},{"s":128064,"e":128064,"w":2},{"s":128065,"e":128065,"w":1},{"s":128066,"e":128252,"w":2},{"s":128253,"e":128254,"w":1},{"s":128255,"e":128317,"w":2},{"s":128318,"e":128330,"w":1},{"s":128331,"e":128334,"w":2},{"s":128335,"e":128335,"w":1},{"s":128336,"e":128359,"w":2},{"s":128360,"e":128377,"w":1},{"s":128378,"e":128378,"w":2},{"s":128379,"e":128404,"w":1},{"s":128405,"e":128406,"w":2},{"s":128407,"e":128419,"w":1},{"s":128420,"e":128420,"w":2},{"s":128421,"e":128506,"w":1},{"s":128507,"e":128591,"w":2},{"s":128592,"e":128639,"w":1},{"s":128640,"e":128709,"w":2},{"s":128710,"e":128715,"w":1},{"s":128716,"e":128716,"w":2},{"s":128717,"e":128719,"w":1},{"s":128720,"e":128722,"w":2},{"s":128723,"e":128724,"w":1},{"s":128725,"e":128727,"w":2},{"s":128728,"e":128746,"w":1},{"s":128747,"e":128748,"w":2},{"s":128749,"e":128755,"w":1},{"s":128756,"e":128764,"w":2},{"s":128765,"e":128991,"w":1},{"s":128992,"e":129003,"w":2},{"s":129004,"e":129291,"w":1},{"s":129292,"e":129338,"w":2},{"s":129339,"e":129339,"w":1},{"s":129340,"e":129349,"w":2},{"s":129350,"e":129350,"w":1},{"s":129351,"e":129400,"w":2},{"s":129401,"e":129401,"w":1},{"s":129402,"e":129483,"w":2},{"s":129484,"e":129484,"w":1},{"s":129485,"e":129535,"w":2},{"s":129536,"e":129647,"w":1},{"s":129648,"e":129652,"w":2},{"s":129653,"e":129655,"w":1},{"s":129656,"e":129658,"w":2},{"s":129659,"e":129663,"w":1},{"s":129664,"e":129670,"w":2},{"s":129671,"e":129679,"w":1},{"s":129680,"e":129704,"w":2},{"s":129705,"e":129711,"w":1},{"s":129712,"e":129718,"w":2},{"s":129719,"e":129727,"w":1},{"s":129728,"e":129730,"w":2},{"s":129731,"e":129743,"w":1},{"s":129744,"e":129750,"w":2},{"s":129751,"e":129791,"w":1}]

},{}],14:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



const latinizeMap = require( './json-data/latinize-map.json' ) ;

module.exports = function( str ) {
	return str.replace( /[^\u0000-\u007e]/g , ( c ) => { return latinizeMap[ c ] || c ; } ) ;
} ;



},{"./json-data/latinize-map.json":12}],15:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



exports.resize = function( str , length ) {
	if ( str.length === length ) {
		return str ;
	}
	else if ( str.length > length ) {
		return str.slice( 0 , length ) ;
	}

	return str + ' '.repeat( length - str.length ) ;

} ;



exports.occurrenceCount = function( str , subStr , overlap = false ) {
	if ( ! str || ! subStr ) { return 0 ; }

	var count = 0 , index = 0 ,
		inc = overlap ? 1 : subStr.length ;

	while ( ( index = str.indexOf( subStr , index ) ) !== -1 ) {
		count ++ ;
		index += inc ;
	}

	return count ;
} ;


},{}],16:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



const CONTROL_CLASS = 1 ;
const WORD_SEPARATOR_CLASS = 2 ;
const LETTER_CLASS = 3 ;
const NUMBER_CLASS = 4 ;
const SYMBOL_CLASS = 5 ;



function getCharacterClass( char , code ) {
	if ( isWordSeparator( code ) ) { return WORD_SEPARATOR_CLASS ; }
	if ( code <= 0x1f || code === 0x7f ) { return CONTROL_CLASS ; }
	if ( isNumber( code ) ) { return NUMBER_CLASS ; }
	// Here we assume that a letter is a char with a “case”
	if ( char.toUpperCase() !== char.toLowerCase() ) { return LETTER_CLASS ; }
	return SYMBOL_CLASS ;
}



function isWordSeparator( code ) {
	if (
		// space, tab, no-break space
		code === 0x20 || code === 0x09 || code === 0xa0 ||
		// hyphen, underscore
		code === 0x2d || code === 0x5f
	) {
		return true ;
	}

	return false ;
}



function isNumber( code ) {
	if ( code >= 0x30 && code <= 0x39 ) { return true ; }
	return false ;
}



function naturalSort( a , b ) {
	a = '' + a ;
	b = '' + b ;

	var aIndex , aEndIndex , aChar , aCode , aClass , aCharLc , aNumber ,
		aTrim = a.trim() ,
		aLength = aTrim.length ,
		bIndex , bEndIndex , bChar , bCode , bClass , bCharLc , bNumber ,
		bTrim = b.trim() ,
		bLength = bTrim.length ,
		advantage = 0 ;

	for ( aIndex = bIndex = 0 ; aIndex < aLength && bIndex < bLength ; aIndex ++ , bIndex ++ ) {
		aChar = aTrim[ aIndex ] ;
		bChar = bTrim[ bIndex ] ;
		aCode = aTrim.charCodeAt( aIndex ) ;
		bCode = bTrim.charCodeAt( bIndex ) ;
		aClass = getCharacterClass( aChar , aCode ) ;
		bClass = getCharacterClass( bChar , bCode ) ;
		if ( aClass !== bClass ) { return aClass - bClass ; }

		switch ( aClass ) {
			case WORD_SEPARATOR_CLASS :
				// Eat all white chars and continue
				while ( isWordSeparator( aTrim.charCodeAt( aIndex + 1 ) ) ) { aIndex ++ ; }
				while ( isWordSeparator( bTrim.charCodeAt( bIndex + 1 ) ) ) { bIndex ++ ; }
				break ;

			case CONTROL_CLASS :
			case SYMBOL_CLASS :
				if ( aCode !== bCode ) { return aCode - bCode ; }
				break ;

			case LETTER_CLASS :
				aCharLc = aChar.toLowerCase() ;
				bCharLc = bChar.toLowerCase() ;
				if ( aCharLc !== bCharLc ) { return aCharLc > bCharLc ? 1 : -1 ; }

				// As a last resort, we would sort uppercase first
				if ( ! advantage && aChar !== bChar ) { advantage = aChar !== aCharLc ? -1 : 1 ; }

				break ;

			case NUMBER_CLASS :
				// Lookup for a whole number and parse it
				aEndIndex = aIndex + 1 ;
				while ( isNumber( aTrim.charCodeAt( aEndIndex ) ) ) { aEndIndex ++ ; }
				aNumber = parseFloat( aTrim.slice( aIndex , aEndIndex ) ) ;

				bEndIndex = bIndex + 1 ;
				while ( isNumber( bTrim.charCodeAt( bEndIndex ) ) ) { bEndIndex ++ ; }
				bNumber = parseFloat( bTrim.slice( bIndex , bEndIndex ) ) ;

				if ( aNumber !== bNumber ) { return aNumber - bNumber ; }

				// As a last resort, we would sort the number with the less char first
				if ( ! advantage && aEndIndex - aIndex !== bEndIndex - bIndex ) { advantage = ( aEndIndex - aIndex ) - ( bEndIndex - bIndex ) ; }

				// Advance the index at the end of the number area
				aIndex = aEndIndex - 1 ;
				bIndex = bEndIndex - 1 ;
				break ;
		}
	}

	// If there was an “advantage”, use it now
	if ( advantage ) { return advantage ; }

	// Finally, sort by remaining char, or by trimmed length or by full length
	return ( aLength - aIndex ) - ( bLength - bIndex ) || aLength - bLength || a.length - b.length ;
}

module.exports = naturalSort ;


},{}],17:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



var escape = require( './escape.js' ) ;



exports.regexp = {} ;



exports.regexp.array2alternatives = function array2alternatives( array ) {
	var i , sorted = array.slice() ;

	// Sort descending by string length
	sorted.sort( ( a , b ) => {
		return b.length - a.length ;
	} ) ;

	// Then escape what should be
	for ( i = 0 ; i < sorted.length ; i ++ ) {
		sorted[ i ] = escape.regExpPattern( sorted[ i ] ) ;
	}

	return sorted.join( '|' ) ;
} ;



},{"./escape.js":6}],18:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



const stringKit = {} ;
module.exports = stringKit ;



/*
// Tier 0: add polyfills to stringKit
const polyfill = require( './polyfill.js' ) ;

for ( let fn_ in polyfill ) {
	stringKit[ fn ] = function( str , ... args ) {
		return polyfill[ fn ].call( str , ... args ) ;
	} ;
}
//*/



Object.assign( stringKit ,

	// Tier 1
	{ escape: require( './escape.js' ) } ,
	{ ansi: require( './ansi.js' ) } ,
	{ unicode: require( './unicode.js' ) }
) ;



Object.assign( stringKit ,

	// Tier 2
	require( './format.js' ) ,

	// Tier 3
	require( './misc.js' ) ,
	require( './inspect.js' ) ,
	require( './regexp.js' ) ,
	require( './camel.js' ) ,
	{
		latinize: require( './latinize.js' ) ,
		toTitleCase: require( './toTitleCase.js' ) ,
		wordwrap: require( './wordwrap.js' ) ,
		naturalSort: require( './naturalSort.js' ) ,
		fuzzy: require( './fuzzy.js' ) ,
		StringNumber: require( './StringNumber.js' ) ,
		english: require( './english.js' ) ,
		emoji: require( './emoji.js' )
	}
) ;



/*
// Install all polyfill into String.prototype
stringKit.installPolyfills = function installPolyfills() {
	for ( let fn in polyfill ) {
		if ( ! String.prototype[ fn ] ) {
			String.prototype[ fn ] = polyfill[ fn ] ;
		}
	}
} ;
//*/


},{"./StringNumber.js":1,"./ansi.js":2,"./camel.js":3,"./emoji.js":4,"./english.js":5,"./escape.js":6,"./format.js":7,"./fuzzy.js":8,"./inspect.js":9,"./latinize.js":14,"./misc.js":15,"./naturalSort.js":16,"./regexp.js":17,"./toTitleCase.js":19,"./unicode.js":20,"./wordwrap.js":21}],19:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



const DEFAULT_OPTIONS = {
	underscoreToSpace: true ,
	lowerCaseWords: new Set( [
		// Articles
		'a' , 'an' , 'the' ,
		// Conjunctions (only coordinating conjunctions, maybe we will have to add subordinating and correlative conjunctions)
		'for' , 'and' , 'nor' , 'but' , 'or' , 'yet' , 'so' ,
		// Prepositions (there are more, but usually only preposition with 2 or 3 letters are lower-cased)
		'of' , 'on' , 'off' , 'in' , 'into' , 'by' , 'with' , 'to' , 'at' , 'up' , 'down' , 'as'
	] )
} ;



module.exports = ( str , options = DEFAULT_OPTIONS ) => {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	// Manage options
	var dashToSpace = options.dashToSpace ?? DEFAULT_OPTIONS.dashToSpace ,
		underscoreToSpace = options.underscoreToSpace ?? DEFAULT_OPTIONS.underscoreToSpace ,
		zealous = options.zealous ?? DEFAULT_OPTIONS.zealous ,
		preserveAllCaps = options.preserveAllCaps ?? DEFAULT_OPTIONS.preserveAllCaps ,
		lowerCaseWords = options.lowerCaseWords ?? DEFAULT_OPTIONS.lowerCaseWords ;

	lowerCaseWords =
		lowerCaseWords instanceof Set ? lowerCaseWords :
		Array.isArray( lowerCaseWords ) ? new Set( lowerCaseWords ) :
		null ;


	if ( dashToSpace ) { str = str.replace( /-+/g , ' ' ) ; }
	if ( underscoreToSpace ) { str = str.replace( /_+/g , ' ' ) ; }

	// Squash multiple spaces into only one, and trim
	str = str.replace( / +/g , ' ' ).trim() ;


	return str.replace( /[^\s_-]+/g , ( part , position ) => {
		// Check word that must be lower-cased (excluding the first and the last word)
		if ( lowerCaseWords && position && position + part.length < str.length ) {
			let lowerCased = part.toLowerCase() ;
			if ( lowerCaseWords.has( lowerCased ) ) { return lowerCased ; }
		}

		if ( zealous ) {
			if ( preserveAllCaps && part === part.toUpperCase() ) {
				// This is a ALLCAPS word
				return part ;
			}

			return part[ 0 ].toUpperCase() + part.slice( 1 ).toLowerCase() ;
		}

		return part[ 0 ].toUpperCase() + part.slice( 1 ) ;
	} ) ;
} ;


},{}],20:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



/*
	Javascript does not use UTF-8 but UCS-2.
	The purpose of this module is to process correctly strings containing UTF-8 characters that take more than 2 bytes.

	Since the punycode module is deprecated in Node.js v8.x, this is an adaptation of punycode.ucs2.x
	as found on Aug 16th 2017 at: https://github.com/bestiejs/punycode.js/blob/master/punycode.js.

	2021 note -- Modern Javascript is way more unicode friendly since many years, e.g. `Array.from( string )` and `for ( char of string )` are unicode aware.
	Some methods here are now useless, but have been modernized to use the correct ES features.
*/



// Create the module and export it
const unicode = {} ;
module.exports = unicode ;



unicode.encode = array => String.fromCodePoint( ... array ) ;

// Decode a string into an array of unicode codepoints.
// The 2nd argument of Array.from() is a map function, it avoids creating intermediate array.
unicode.decode = str => Array.from( str , c => c.codePointAt( 0 ) ) ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.firstCodePoint = str => str.codePointAt( 0 ) ;

// Extract only the first char.
unicode.firstChar = str => str.length ? String.fromCodePoint( str.codePointAt( 0 ) ) : undefined ;

// DEPRECATED: This function is totally useless now, with modern JS.
unicode.toArray = str => Array.from( str ) ;



// Decode a string into an array of Cell (used by Terminal-kit).
// Wide chars have an additionnal filler cell, so position is correct
unicode.toCells = ( Cell , str , tabWidth = 4 , linePosition = 0 , ... extraCellArgs ) => {
	var char , code , fillSize , width ,
		output = [] ;

	for ( char of str ) {
		code = char.codePointAt( 0 ) ;

		if ( code === 0x0a ) {	// New line
			linePosition = 0 ;
		}
		else if ( code === 0x09 ) {	// Tab
			// Depends upon the next tab-stop
			fillSize = tabWidth - ( linePosition % tabWidth ) - 1 ;
			//output.push( new Cell( '\t' , ... extraCellArgs ) ) ;
			output.push( new Cell( '\t' , 1 , ... extraCellArgs ) ) ;
			linePosition += 1 + fillSize ;

			// Add a filler cell
			while ( fillSize -- ) { output.push( new Cell( ' ' , -2 , ... extraCellArgs ) ) ; }
		}
		else {
			width = unicode.codePointWidth( code ) ,
			output.push( new Cell( char , width , ... extraCellArgs ) ) ;
			linePosition += width ;

			// Add an anti-filler cell (a cell with 0 width, following a wide char)
			while ( -- width > 0 ) { output.push( new Cell( ' ' , -1 , ... extraCellArgs ) ) ; }
		}
	}

	return output ;
} ;



unicode.fromCells = ( cells ) => {
	var cell , str = '' ;

	for ( cell of cells ) {
		if ( ! cell.filler ) { str += cell.char ; }
	}

	return str ;
} ;



// Get the length of an unicode string
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
// /!\ Use Array.from().length instead??? Not using it is potentially faster, but it needs benchmark to be sure.
unicode.length = str => {
	// for ... of is unicode-aware
	var char , length = 0 ;
	for ( char of str ) { length ++ ; }		/* eslint-disable-line no-unused-vars */
	return length ;
} ;



// Return a string that does not exceed the character limit
unicode.truncateLength = unicode.truncate = ( str , limit ) => {
	var position = 0 , length = 0 ;

	for ( let char of str ) {
		if ( length === limit ) { return str.slice( 0 , position ) ; }
		length ++ ;
		position += char.length ;
	}

	// The string remains unchanged
	return str ;
} ;



// Return the width of a string in a terminal/monospace font
unicode.width = str => {
	// for ... of is unicode-aware
	var char , count = 0 ;
	for ( char of str ) { count += unicode.codePointWidth( char.codePointAt( 0 ) ) ; }
	return count ;
} ;



// Return the width of an array of string in a terminal/monospace font
unicode.arrayWidth = ( array , limit ) => {
	var index , count = 0 ;

	if ( limit === undefined ) { limit = array.length ; }

	for ( index = 0 ; index < limit ; index ++ ) {
		count += unicode.isFullWidth( array[ index ] ) ? 2 : 1 ;
	}

	return count ;
} ;



// Userland may use this, it is more efficient than .truncateWidth() + .width(),
// and BTW even more than testing .width() then .truncateWidth() + .width()
var lastTruncateWidth = 0 ;
unicode.getLastTruncateWidth = () => lastTruncateWidth ;

// Return a string that does not exceed the width limit (taking wide-char into considerations)
unicode.widthLimit =	// DEPRECATED
unicode.truncateWidth = ( str , limit ) => {
	var char , charWidth , position = 0 ;

	// Module global:
	lastTruncateWidth = 0 ;

	for ( char of str ) {
		charWidth = unicode.codePointWidth( char.codePointAt( 0 ) ) ;

		if ( lastTruncateWidth + charWidth > limit ) {
			return str.slice( 0 , position ) ;
		}

		lastTruncateWidth += charWidth ;
		position += char.length ;
	}

	// The string remains unchanged
	return str ;
} ;



/*
	** PROBABLY DEPRECATED **

	Check if a UCS2 char is a surrogate pair.

	Returns:
		0: single char
		1: leading surrogate
		-1: trailing surrogate

	Note: it does not check input, to gain perfs.
*/
unicode.surrogatePair = char => {
	var code = char.charCodeAt( 0 ) ;

	if ( code < 0xd800 || code >= 0xe000 ) { return 0 ; }
	else if ( code < 0xdc00 ) { return 1 ; }
	return -1 ;
} ;



// Check if a character is a full-width char or not
unicode.isFullWidth = char => unicode.isFullWidthCodePoint( char.codePointAt( 0 ) ) ;

// Return the width of a char, leaner than .width() for one char
unicode.charWidth = char => unicode.codePointWidth( char.codePointAt( 0 ) ) ;



/*
	Build the Emoji width lookup.
	The ranges file (./lib/unicode-emoji-width-ranges.json) is produced by a Terminal-Kit script ([terminal-kit]/utilities/build-emoji-width-lookup.js),
	that writes each emoji and check the cursor location.
*/
const emojiWidthLookup = new Map() ;

( function() {
	var ranges = require( './json-data/unicode-emoji-width-ranges.json' ) ;
	for ( let range of ranges ) {
		for ( let i = range.s ; i <= range.e ; i ++ ) {
			emojiWidthLookup.set( i , range.w ) ;
		}
	}
} )() ;

/*
	Check if a codepoint represent a full-width char or not.
*/
unicode.codePointWidth = code => {
	// Assuming all emoji are wide here
	if ( unicode.isEmojiCodePoint( code ) ) {
		return emojiWidthLookup.get( code ) ?? 2 ;
	}

	// Code points are derived from:
	// http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	if ( code >= 0x1100 && (
		code <= 0x115f ||	// Hangul Jamo
		code === 0x2329 || // LEFT-POINTING ANGLE BRACKET
		code === 0x232a || // RIGHT-POINTING ANGLE BRACKET
		// CJK Radicals Supplement .. Enclosed CJK Letters and Months
		( 0x2e80 <= code && code <= 0x3247 && code !== 0x303f ) ||
		// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
		( 0x3250 <= code && code <= 0x4dbf ) ||
		// CJK Unified Ideographs .. Yi Radicals
		( 0x4e00 <= code && code <= 0xa4c6 ) ||
		// Hangul Jamo Extended-A
		( 0xa960 <= code && code <= 0xa97c ) ||
		// Hangul Syllables
		( 0xac00 <= code && code <= 0xd7a3 ) ||
		// CJK Compatibility Ideographs
		( 0xf900 <= code && code <= 0xfaff ) ||
		// Vertical Forms
		( 0xfe10 <= code && code <= 0xfe19 ) ||
		// CJK Compatibility Forms .. Small Form Variants
		( 0xfe30 <= code && code <= 0xfe6b ) ||
		// Halfwidth and Fullwidth Forms
		( 0xff01 <= code && code <= 0xff60 ) ||
		( 0xffe0 <= code && code <= 0xffe6 ) ||
		// Kana Supplement
		( 0x1b000 <= code && code <= 0x1b001 ) ||
		// Enclosed Ideographic Supplement
		( 0x1f200 <= code && code <= 0x1f251 ) ||
		// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
		( 0x20000 <= code && code <= 0x3fffd )
	) ) {
		return 2 ;
	}

	if (
		unicode.isEmojiModifierCodePoint( code ) ||
		unicode.isZeroWidthDiacriticCodePoint( code )
	) {
		return 0 ;
	}

	return 1 ;
} ;

// For a true/false type of result
unicode.isFullWidthCodePoint = code => unicode.codePointWidth( code ) === 2 ;



// Convert normal ASCII chars to their full-width counterpart
unicode.toFullWidth = str => {
	return String.fromCodePoint( ... Array.from( str , char => {
		var code = char.codePointAt( 0 ) ;
		return code >= 33 && code <= 126  ?  0xff00 + code - 0x20  :  code ;
	} ) ) ;
} ;



// Check if a character is a diacritic with zero-width or not
unicode.isZeroWidthDiacritic = char => unicode.isZeroWidthDiacriticCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://en.wikipedia.org/wiki/Combining_character
// Diacritics and other characters that combines with previous one (zero-width)
unicode.isZeroWidthDiacriticCodePoint = code =>
	// Combining Diacritical Marks
	( 0x300 <= code && code <= 0x36f ) ||
	// Combining Diacritical Marks Extended
	( 0x1ab0 <= code && code <= 0x1aff ) ||
	// Combining Diacritical Marks Supplement
	( 0x1dc0 <= code && code <= 0x1dff ) ||
	// Combining Diacritical Marks for Symbols
	( 0x20d0 <= code && code <= 0x20ff ) ||
	// Combining Half Marks
	( 0xfe20 <= code && code <= 0xfe2f ) ||
	// Dakuten and handakuten (japanese)
	code === 0x3099 || code === 0x309a ||
	// Devanagari
	( 0x900 <= code && code <= 0x903 ) ||
	( 0x93a <= code && code <= 0x957 && code !== 0x93d && code !== 0x950 ) ||
	code === 0x962 || code === 0x963 ||
	// Thai
	code === 0xe31 ||
	( 0xe34 <= code && code <= 0xe3a ) ||
	( 0xe47 <= code && code <= 0xe4e ) ;

// Check if a character is an emoji or not
unicode.isEmoji = char => unicode.isEmojiCodePoint( char.codePointAt( 0 ) ) ;

// Some doc found here: https://stackoverflow.com/questions/30470079/emoji-value-range
unicode.isEmojiCodePoint = code =>
	// Miscellaneous symbols
	( 0x2600 <= code && code <= 0x26ff ) ||
	// Dingbats
	( 0x2700 <= code && code <= 0x27bf ) ||
	// Emoji
	( 0x1f000 <= code && code <= 0x1f1ff ) ||
	( 0x1f300 <= code && code <= 0x1f3fa ) ||
	( 0x1f400 <= code && code <= 0x1faff ) ;

// Emoji modifier
unicode.isEmojiModifier = char => unicode.isEmojiModifierCodePoint( char.codePointAt( 0 ) ) ;
unicode.isEmojiModifierCodePoint = code =>
	( 0x1f3fb <= code && code <= 0x1f3ff ) ||	// (Fitzpatrick): https://en.wikipedia.org/wiki/Miscellaneous_Symbols_and_Pictographs#Emoji_modifiers
	code === 0xfe0f ;	// VARIATION SELECTOR-16 [VS16] {emoji variation selector}


},{"./json-data/unicode-emoji-width-ranges.json":13}],21:[function(require,module,exports){
/*
	String Kit

	Copyright (c) 2014 - 2021 Cédric Ronvel

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

"use strict" ;



const unicode = require( './unicode.js' ) ;



// French typography rules with '!', '?', ':' and ';'
const FRENCH_DOUBLE_GRAPH_TYPO = {
	'!': true ,
	'?': true ,
	':': true ,
	';': true
} ;



/*
	.wordwrap( str , width )
	.wordwrap( str , options )

	str: the string to process
	width: the max width (default to 80)
	options: object, where:
		width: the max width (default to 80)
		glue: (optional) the char used to join lines, by default: lines are joined with '\n',
		noJoin: (optional) if set: don't join, instead return an array of lines
		offset: (optional) offset of the first-line
		updateOffset: (optional) if set, options.offset is updated with the last line width
		noTrim: (optional) if set, don't right-trim lines, if not set, right-trim all lines except the last
		fill: (optional) if set, fill the remaining width with space (it forces noTrim)
		skipFn: (optional) a function used to skip a whole sequence, useful for special sequences
			like ANSI escape sequence, and so on...
		charWidthFn: (optional) a function used to compute the width of one char/group of chars
		regroupFn: (optional) a function used to regroup chars together
*/
module.exports = function wordwrap( str , options ) {
	var start = 0 , end , skipEnd , lineWidth , currentLine , currentWidth , length ,
		lastEnd , lastWidth , lastWasSpace , charWidthFn ,
		explicitNewLine = true ,
		strArray = unicode.toArray( str ) ,
		trimNewLine = false ,
		line , lines = [] ;

	if ( typeof options !== 'object' ) {
		options = { width: options } ;
	}

	// Catch NaN, zero or negative and non-number
	if ( ! options.width || typeof options.width !== 'number' || options.width <= 0 ) { options.width = 80 ; }

	lineWidth = options.offset ? options.width - options.offset : options.width ;

	if ( typeof options.glue !== 'string' ) { options.glue = '\n' ; }

	if ( options.regroupFn ) {
		strArray = options.regroupFn( strArray ) ;
		// If char are grouped, use unicode.width() as a default
		charWidthFn = options.charWidthFn || unicode.width ;
	}
	else {
		// If char are not grouped, use unicode.charWidth() as a default
		charWidthFn = options.charWidthFn || unicode.charWidth ;
	}

	length = strArray.length ;

	var getNextLine = () => {
		//originStart = start ;

		if ( ! explicitNewLine || trimNewLine ) {
			// Find the first non-space char
			while ( strArray[ start ] === ' ' ) { start ++ ; }

			if ( trimNewLine && strArray[ start ] === '\n' ) {
				explicitNewLine = true ;
				start ++ ;
				/*
				originStart = start ;
				while ( strArray[ start ] === ' ' ) { start ++ ; }
				*/
			}
		}

		if ( start >= length ) { return null ; }

		explicitNewLine = false ;
		trimNewLine = false ;
		lastWasSpace = false ;
		end = lastEnd = start ;
		currentWidth = lastWidth = 0 ;

		for ( ;; ) {
			if ( end >= length ) {
				return strArray.slice( start , end ).join( '' ) ;
			}

			if ( strArray[ end ] === '\n' ) {
				explicitNewLine = true ;
				currentLine = strArray.slice( start , end ++ ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - currentWidth ) ;
				}

				return currentLine ;
			}

			if ( options.skipFn ) {
				skipEnd = options.skipFn( strArray , end ) ;
				if ( skipEnd !== end ) {
					end = skipEnd ;
					continue ;
				}
			}

			if ( strArray[ end ] === ' ' && ! lastWasSpace && ! FRENCH_DOUBLE_GRAPH_TYPO[ strArray[ end + 1 ] ] ) {
				// This is the first space of a group of space
				lastEnd = end ;
				lastWidth = currentWidth ;
			}
			else {
				lastWasSpace = false ;
			}

			currentWidth += charWidthFn( strArray[ end ] ) ;

			if ( currentWidth > lineWidth ) {
				// If lastEnd === start, this is a word that takes the whole line: cut it
				// If not, use the lastEnd
				trimNewLine = true ;

				if ( lastEnd !== start ) {
					end = lastEnd ;
				}
				else if ( lineWidth < options.width ) {
					// This is the first line with an offset, so just start over in line two
					end = start ;
					return '' ;
				}

				currentLine = strArray.slice( start , end ).join( '' ) ;

				if ( options.fill ) {
					currentLine += ' '.repeat( lineWidth - lastWidth ) ;
				}

				return currentLine ;
			}

			// Do not move that inside the for(;;), some part are using a continue statement and manage the end value by themself
			end ++ ;
		}
	} ;

	while ( start < length && ( line = getNextLine() ) !== null ) {
		lines.push( line ) ;
		start = end ;
		lineWidth = options.width ;
	}

	// If it ends with an explicit newline, we have to reproduce it now!
	if ( explicitNewLine ) { lines.push( '' ) ; }

	if ( ! options.noTrim && ! options.fill ) {
		lines = lines.map( ( line_ , index ) => index === lines.length - 1 ? line_ : line_.trimRight() ) ;
	}

	if ( ! options.noJoin ) { lines = lines.join( options.glue ) ; }

	if ( options.updateOffset ) { options.offset = currentWidth ; }

	return lines ;
} ;


},{"./unicode.js":20}],22:[function(require,module,exports){

},{}],23:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],24:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[18])(18)
});
