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

"use strict" ;



var unicode = require( './unicode.js' ) ;



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
		glue: (optional) the char to join lines, by default: lines are joined with '\n',
		noJoin: (optional) if true: don't join, instead return an array of lines
		offset: (optional) offset of the first-line
		updateOffset: (optional) if true, options.offset is updated with the last line width
		sequenceSkip: (optional) a function used to skip a whole sequence, useful for special sequences
			like ANSI escape sequence, and so on...
*/
module.exports = function wordwrap( str , options ) {
	var start = 0 , end , skipEnd , lineWidth , currentWidth , lastEnd , lastWasSpace ,
		strArray = unicode.toArray( str ) ,
		trimNewLine = false ,
		line , lines = [] ,
		length = strArray.length ;

	if ( typeof options !== 'object' ) {
		options = { width: options } ;
	}

	// Catch NaN, zero or negative and non-number
	if ( ! options.width || typeof options.width !== 'number' || options.width <= 0 ) { options.width = 80 ; }

	lineWidth = options.offset ? options.width - options.offset : options.width ;

	if ( typeof options.glue !== 'string' ) { options.glue = '\n' ; }

	var getNextLine = () => {

		// Find the first non-space char
		while ( strArray[ start ] === ' ' ) { start ++ ; }

		if ( trimNewLine && strArray[ start ] === '\n' ) {
			start ++ ;
			while ( strArray[ start ] === ' ' ) { start ++ ; }
		}

		if ( start >= length ) { return null ; }

		trimNewLine = false ;
		lastWasSpace = false ;
		end = lastEnd = start ;
		currentWidth = 0 ;

		for ( ;; ) {
			if ( end >= length ) {
				return strArray.slice( start , end ).join( '' ).trim() ;
			}

			if ( options.sequenceSkip ) {
				skipEnd = options.sequenceSkip( strArray , end ) ;
				if ( skipEnd !== end ) {
					end = skipEnd ;
					continue ;
				}
			}

			currentWidth += unicode.isFullWidth( strArray[ end ] ) ? 2 : 1 ;

			if ( currentWidth > lineWidth ) {
				// If lastEnd === start, this is a word that takes the whole line: cut it
				// If not, use the lastEnd
				trimNewLine = true ;

				if ( lastEnd !== start ) {
					end = lastEnd ;
				}
				else if ( lineWidth < options.width ) {
					// First line with offset, so skip the first line
					end = start ;
					return '' ;
				}

				return strArray.slice( start , end ).join( '' ).trim() ;
			}
			else if ( strArray[ end ] === '\n' ) {
				return strArray.slice( start , end ++ ).join( '' ).trim() ;
			}
			else if ( strArray[ end ] === ' ' && ! lastWasSpace && ! FRENCH_DOUBLE_GRAPH_TYPO[ strArray[ end + 1 ] ] ) {
				// This is the first space of a group of space
				lastEnd = end ;
			}
			else {
				lastWasSpace = false ;
			}

			end ++ ;
		}
	} ;

	while ( start < length && ( line = getNextLine() ) !== null ) {
		lines.push( line ) ;
		start = end ;
		lineWidth = options.width ;
	}

	if ( ! options.noJoin ) { lines = lines.join( options.glue ) ; }

	if ( options.updateOffset ) { options.offset = currentWidth ; }

	return lines ;
} ;


