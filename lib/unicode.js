/*
	String Kit
	
	Copyright (c) 2014 - 2017 Cédric Ronvel
	
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
*/



// Create the module and export it
var unicode = {} ;
module.exports = unicode ;



unicode.encode = function encode( array )
{
	return String.fromCodePoint( ... array ) ;
} ;



// Decode a string into an array of unicode codepoints
unicode.decode = function decode( str )
{
	var value , extra , counter = 0 , output = [] ,
		length = str.length ;
	
	while ( counter < length )
	{
		value = str.charCodeAt( counter ++ ) ;
		
		if ( value >= 0xD800 && value <= 0xDBFF && counter < length )
		{
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;
			
			if ( ( extra & 0xFC00 ) === 0xDC00 )	// Low surrogate.
			{
				output.push( ( ( value & 0x3FF ) << 10 ) + ( extra & 0x3FF ) + 0x10000 ) ;
			}
			else
			{
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push( value ) ;
				counter -- ;
			}
		}
		else
		{
			output.push( value ) ;
		}
	}
	
	return output ;
} ;



// Decode a string into an array of unicode characters
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.toArray = function toArray( str )
{
	var value , extra , counter = 0 , output = [] ,
		length = str.length ;
	
	while ( counter < length )
	{
		value = str.charCodeAt( counter ++ ) ;
		
		if ( value >= 0xD800 && value <= 0xDBFF && counter < length )
		{
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;
			
			if ( ( extra & 0xFC00 ) === 0xDC00 )	// Low surrogate.
			{
				output.push( str.slice( counter - 2 , counter ) ) ;
			}
			else
			{
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push( str[ counter - 2 ] ) ;
				counter -- ;
			}
		}
		else
		{
			output.push( str[ counter - 1 ] ) ;
		}
	}
	
	return output ;
} ;



// Get the length of an unicode string
// Mostly an adaptation of .decode(), not factorized for performance's sake (used by Terminal-kit)
unicode.length = function length( str )
{
	var value , extra , counter = 0 , uLength = 0 ,
		length = str.length ;
	
	while ( counter < length )
	{
		value = str.charCodeAt( counter ++ ) ;
		
		if ( value >= 0xD800 && value <= 0xDBFF && counter < length )
		{
			// It's a high surrogate, and there is a next character.
			extra = str.charCodeAt( counter ++ ) ;
			
			if ( ( extra & 0xFC00 ) !== 0xDC00 )
			{
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				counter -- ;
			}
		}
		
		uLength ++ ;
	}
	
	return uLength ;
} ;



// Return the width of a string in a terminal / monospace font
unicode.width = function width( str )
{
	var count = 0 ;
	
	unicode.decode( str ).forEach( code => count += unicode.isFullWidthCodePoint( code ) ? 2 : 1 ) ;
	
	return count ;
} ;



/*
	Returns:
		0: single char
		1: leading surrogate
		-1: trailing surrogate
	
	Note: it does not check input, to gain perfs.
*/
unicode.surrogatePair = function surrogatePair( char )
{
	var code = char.charCodeAt( 0 ) ;
	
	if ( code < 0xd800 || code >= 0xe000 ) { return 0 ; }
	else if ( code < 0xdc00 ) { return 1 ; }
	else { return -1 ; }
} ;



/*
	Check if a character is a full-width char or not.
*/
unicode.isFullWidth = function isFullWidth( char )
{
	return unicode.isFullWidthCodePoint( char.codePointAt( 0 ) ) ;
} ;


	
/*
	Check if a codepoint represent a full-width char or not.
	
	Borrowed from Node.js source, from readline.js.
*/
unicode.isFullWidthCodePoint = function isFullWidthCodePoint( code )
{
	// Code points are derived from:
	// http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	if ( code >= 0x1100 && (
			code <= 0x115f ||	// Hangul Jamo
			0x2329 === code || // LEFT-POINTING ANGLE BRACKET
			0x232a === code || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			( 0x2e80 <= code && code <= 0x3247 && code !== 0x303f ) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			0x3250 <= code && code <= 0x4dbf ||
			// CJK Unified Ideographs .. Yi Radicals
			0x4e00 <= code && code <= 0xa4c6 ||
			// Hangul Jamo Extended-A
			0xa960 <= code && code <= 0xa97c ||
			// Hangul Syllables
			0xac00 <= code && code <= 0xd7a3 ||
			// CJK Compatibility Ideographs
			0xf900 <= code && code <= 0xfaff ||
			// Vertical Forms
			0xfe10 <= code && code <= 0xfe19 ||
			// CJK Compatibility Forms .. Small Form Variants
			0xfe30 <= code && code <= 0xfe6b ||
			// Halfwidth and Fullwidth Forms
			0xff01 <= code && code <= 0xff60 ||
			0xffe0 <= code && code <= 0xffe6 ||
			// Kana Supplement
			0x1b000 <= code && code <= 0x1b001 ||
			// Enclosed Ideographic Supplement
			0x1f200 <= code && code <= 0x1f251 ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			0x20000 <= code && code <= 0x3fffd ) ) {
		return true ;
	}
	
	return false ;
} ;



// Convert normal ASCII chars to their full-width counterpart
unicode.toFullWidth = function toFullWidth( str )
{
	return String.fromCodePoint( ... unicode.decode( str ).map( code => 
		code >= 33 && code <= 126  ?  0xff00 + code - 0x20  :  code
	) ) ;
} ;


