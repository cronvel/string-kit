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

