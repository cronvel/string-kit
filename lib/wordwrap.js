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
	str: the string to process
	width: the max width (default to 80)
	join: (optional) the char to join lines,
		by default: lines are joined with '\n',
		if null: do not join, return an array of lines
*/
module.exports = function wordwrap( str , width , join )
{
	var start = 0 , end , maxEnd , lastEnd , lastWasSpace ,
		trimNewLine = false ,
		line , lines = [] ,
		length = str.length ;
	
	// Catch NaN, zero or negative and non-number
	if ( ! width || typeof width !== 'number' || width <= 0 ) { width = 80 ; }
	
	if ( join === undefined ) { join = '\n' ; }
	
	var getNextLine = function() {
		
		// Find the first non-space char
		while( str[ start ] === ' ' ) { start ++ ; }
		
		if ( trimNewLine && str[ start ] === '\n' )
		{
			start ++ ;
			while( str[ start ] === ' ' ) { start ++ ; }
		}
		
		if ( start >= length ) { return null ; }
		
		trimNewLine = false ;
		lastWasSpace = false ;
		end = lastEnd = start ;
		maxEnd = start + width ;
		
		while( true )
		{
			if ( end >= length )
			{
				return str.slice( start , end ).trim() ;
			}
			else if ( end >= maxEnd )
			{
				// If lastEnd === start, this is a word that takes the whole line: cut it
				// If not, use the lastEnd
				trimNewLine = true ;
				if ( lastEnd !== start ) { end = lastEnd ; }
				return str.slice( start , end ).trim() ;
			}
			else if ( str[ end ] === '\n' )
			{
				return str.slice( start , end ++ ).trim() ;
			}
			else if ( str[ end ] === ' ' && ! lastWasSpace )
			{
				// This is the first space of a group of space
				lastEnd = end ;
			}
			else
			{
				lastWasSpace = false ;
			}
			
			end ++ ;
		}
	} ;
	
	while ( start < length && ( line = getNextLine() ) !== null )
	{
		lines.push( line ) ;
		start = end ;
	}
	
	if ( typeof join === 'string' ) { lines = lines.join( join ) ; }
	
	return lines ;
} ;


