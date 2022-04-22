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
	lowerCaseWords: new Set( [ 'a' , 'the' , 'of' , 'in' ] )
} ;



module.exports = ( str , options = DEFAULT_OPTIONS ) => {
	if ( ! str || typeof str !== 'string' ) { return '' ; }

	if ( options.dashToSpace ) {
		str = str.replace( /-+/g , ' ' ) ;
	}

	if ( options.underscoreToSpace ) {
		str = str.replace( /_+/g , ' ' ) ;
	}

	// Squash multiple spaces into only one, and trim
	str = str.replace( / +/g , ' ' ).trim() ;

	var lowerCaseWords =
		options.lowerCaseWords instanceof Set ? options.lowerCaseWords :
		Array.isArray( options.lowerCaseWords ) ? new Set( options.lowerCaseWords ) :
		null ;

	var wordCount = 0 ;

	return str.replace( /[^\s_-]+/g , ( part ) => {
		wordCount ++ ;

		if ( wordCount > 1 && options.lowerCaseWords ) {
			let lowerCased = part.toLowerCase() ;
			if ( options.lowerCaseWords.has( lowerCased ) ) { return lowerCased ; }
		}

		if ( options.zealous ) {
			if ( options.preserveAllCaps && part === part.toUpperCase() ) {
				// This is a ALLCAPS word
				return part ;
			}

			return part[ 0 ].toUpperCase() + part.slice( 1 ).toLowerCase() ;
		}

		return part[ 0 ].toUpperCase() + part.slice( 1 ) ;
	} ) ;
} ;

