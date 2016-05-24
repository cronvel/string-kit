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

/* jshint unused:false */
/* global describe, it, before, after */

"use strict" ;



var string = require( '../lib/string.js' ) ;
var expect = require( 'expect.js' ) ;





			/* Tests */



describe( "Unicode" , function() {
	
	it( "unicode.length() should report correctly the length of a string" , function() {
		
		expect( string.unicode.length( '' ) ).to.be( 0 ) ;
		expect( string.unicode.length( 'a' ) ).to.be( 1 ) ;
		expect( string.unicode.length( 'abc' ) ).to.be( 3 ) ;
		expect( string.unicode.length( '\x1b[' ) ).to.be( 2 ) ;
		expect( string.unicode.length( '𝌆' ) ).to.be( 1 ) ;
		expect( string.unicode.length( 'a𝌆' ) ).to.be( 2 ) ;
		expect( string.unicode.length( 'a𝌆a𝌆a' ) ).to.be( 5 ) ;
		expect( string.unicode.length( 'é𝌆é𝌆é' ) ).to.be( 5 ) ;
		expect( string.unicode.length( '䷆䷆' ) ).to.be( 2 ) ;
		expect( string.unicode.length( '備' ) ).to.be( 1 ) ;
		expect( string.unicode.length( '備備' ) ).to.be( 2 ) ;
		expect( string.unicode.length( '備-備' ) ).to.be( 3 ) ;
	} ) ;
	
	it( "unicode.toArray() should produce an array of character" , function() {
		
		expect( string.unicode.toArray( '' ) ).to.eql( [] ) ;
		expect( string.unicode.toArray( 'a' ) ).to.eql( [ 'a' ] ) ;
		expect( string.unicode.toArray( 'abc' ) ).to.eql( [ 'a' , 'b' , 'c' ] ) ;
		expect( string.unicode.toArray( '\x1b[' ) ).to.eql( [ '\x1b' , '[' ] ) ;
		expect( string.unicode.toArray( '𝌆' ) ).to.eql( [ '𝌆' ] ) ;
		expect( string.unicode.toArray( 'a𝌆' ) ).to.eql( [ 'a' , '𝌆' ] ) ;
		expect( string.unicode.toArray( 'a𝌆a𝌆a' ) ).to.eql( [ 'a' , '𝌆' , 'a' , '𝌆' , 'a' ] ) ;
		expect( string.unicode.toArray( 'é𝌆é𝌆é' ) ).to.eql( [ 'é' , '𝌆' , 'é' , '𝌆' , 'é' ] ) ;
		expect( string.unicode.toArray( '䷆䷆' ) ).to.eql( [ '䷆' , '䷆' ] ) ;
		expect( string.unicode.toArray( '備' ) ).to.eql( [ '備' ] ) ;
		expect( string.unicode.toArray( '備備' ) ).to.eql( [ '備' , '備' ] ) ;
		expect( string.unicode.toArray( '備-備' ) ).to.eql( [ '備' , '-' , '備' ] ) ;
	} ) ;
	
	it( "unicode.surrogatePair() should return 0 for single char, 1 for leading surrogate, -1 for trailing surrogate" , function() {
		
		expect( string.unicode.surrogatePair( 'a' ) ).to.be( 0 ) ;
		expect( '𝌆'.length ).to.be( 2 ) ;
		expect( string.unicode.surrogatePair( '𝌆'[0] ) ).to.be( 1 ) ;
		expect( string.unicode.surrogatePair( '𝌆'[1] ) ).to.be( -1 ) ;
		expect( '備'.length ).to.be( 2 ) ;
		expect( string.unicode.surrogatePair( '備'[0] ) ).to.be( 1 ) ;
		expect( string.unicode.surrogatePair( '備'[1] ) ).to.be( -1 ) ;
		
		// Can be wide or not, but expressed in only 1 code unit
		expect( '䷆'.length ).to.be( 1 ) ;
		expect( string.unicode.surrogatePair( '䷆'[0] ) ).to.be( 0 ) ;
//		expect( string.unicode.surrogatePair( '䷆'[1] ) ).to.be( undefined ) ;
	} ) ;
	
	it( "unicode.isFullWidth() should return true if the char is full-width" , function() {
		
		expect( string.unicode.isFullWidth( 'a' ) ).to.be( false ) ;
		expect( string.unicode.isFullWidth( '＠' ) ).to.be( true ) ;
		expect( string.unicode.isFullWidth( '𝌆' ) ).to.be( false ) ;
		expect( string.unicode.isFullWidth( '備' ) ).to.be( true ) ;
		expect( string.unicode.isFullWidth( '䷆' ) ).to.be( false ) ;
	} ) ;
} ) ;
	



 