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

/* global describe, it, expect */

"use strict" ;



const string = require( '../lib/string.js' ) ;
const unicode = string.unicode ;





/* Misc */



function Cell( char , special ) {
	this.char = char ;
	this.filler = special < 0 ;
}





/* Tests */



describe( "Unicode" , () => {

	it( "unicode.length() should report correctly the length of a string" , () => {
		expect( unicode.length( '' ) ).to.be( 0 ) ;
		expect( unicode.length( 'a' ) ).to.be( 1 ) ;
		expect( unicode.length( 'abc' ) ).to.be( 3 ) ;
		expect( unicode.length( '\x1b[' ) ).to.be( 2 ) ;
		expect( unicode.length( '𝌆' ) ).to.be( 1 ) ;
		expect( unicode.length( 'a𝌆' ) ).to.be( 2 ) ;
		expect( unicode.length( 'a𝌆a𝌆a' ) ).to.be( 5 ) ;
		expect( unicode.length( 'é𝌆é𝌆é' ) ).to.be( 5 ) ;
		expect( unicode.length( '䷆䷆' ) ).to.be( 2 ) ;
		expect( unicode.length( '備' ) ).to.be( 1 ) ;
		expect( unicode.length( '備備' ) ).to.be( 2 ) ;
		expect( unicode.length( '備-備' ) ).to.be( 3 ) ;
	} ) ;

	it( "unicode.firstCodePoint() should produce the first character codepoint" , () => {
		expect( unicode.firstCodePoint( 'a' ) ).to.be( 97 ) ;
		expect( unicode.firstCodePoint( 'azdf' ) ).to.be( 97 ) ;
		expect( unicode.firstCodePoint( '𝌆' ) ).to.be( 119558 ) ;
		expect( unicode.firstCodePoint( '𝌆𝌆a𝌆' ) ).to.be( 119558 ) ;
		expect( unicode.firstCodePoint( 'a𝌆𝌆a𝌆' ) ).to.be( 97 ) ;
		expect( unicode.firstCodePoint( '' ) ).to.be( undefined ) ;
	} ) ;

	it( "unicode.firstChar() should produce the first character codepoint" , () => {
		expect( unicode.firstChar( 'a' ) ).to.be( 'a' ) ;
		expect( unicode.firstChar( 'azdf' ) ).to.be( 'a' ) ;
		expect( unicode.firstChar( '𝌆' ) ).to.be( '𝌆' ) ;
		expect( unicode.firstChar( '𝌆𝌆a𝌆' ) ).to.be( '𝌆' ) ;
		expect( unicode.firstChar( 'a𝌆𝌆a𝌆' ) ).to.be( 'a' ) ;
		expect( unicode.firstChar( '' ) ).to.be( undefined ) ;
	} ) ;

	it( "unicode.decode() should produce an array of codepoint" , () => {
		expect( unicode.decode( '' ) ).to.equal( [] ) ;
		expect( unicode.decode( 'a' ) ).to.equal( [ 97 ] ) ;
		expect( unicode.decode( 'abc' ) ).to.equal( [ 97 , 98 , 99 ] ) ;
		expect( unicode.decode( '\x1b[' ) ).to.equal( [ 27 , 91 ] ) ;
		expect( unicode.decode( '𝌆' ) ).to.equal( [ 119558 ] ) ;
		expect( unicode.decode( 'a𝌆' ) ).to.equal( [ 97 , 119558 ] ) ;
		expect( unicode.decode( 'a𝌆a𝌆a' ) ).to.equal( [ 97 , 119558 , 97 , 119558 , 97 ] ) ;
		expect( unicode.decode( '䷆䷆' ) ).to.equal( [ 19910 , 19910 ] ) ;
		expect( unicode.decode( '備' ) ).to.equal( [ 194569 ] ) ;
		expect( unicode.decode( '備備' ) ).to.equal( [ 194569 , 194569 ] ) ;
		expect( unicode.decode( '備-備' ) ).to.equal( [ 194569 , 45 , 194569 ] ) ;
	} ) ;

	it( "unicode.toArray() should produce an array of characters" , () => {
		expect( unicode.toArray( '' ) ).to.equal( [] ) ;
		expect( unicode.toArray( 'a' ) ).to.equal( [ 'a' ] ) ;
		expect( unicode.toArray( 'abc' ) ).to.equal( [ 'a' , 'b' , 'c' ] ) ;
		expect( unicode.toArray( '\x1b[' ) ).to.equal( [ '\x1b' , '[' ] ) ;
		expect( unicode.toArray( '𝌆' ) ).to.equal( [ '𝌆' ] ) ;
		expect( unicode.toArray( 'a𝌆' ) ).to.equal( [ 'a' , '𝌆' ] ) ;
		expect( unicode.toArray( 'a𝌆a𝌆a' ) ).to.equal( [ 'a' , '𝌆' , 'a' , '𝌆' , 'a' ] ) ;
		expect( unicode.toArray( 'é𝌆é𝌆é' ) ).to.equal( [ 'é' , '𝌆' , 'é' , '𝌆' , 'é' ] ) ;
		expect( unicode.toArray( '䷆䷆' ) ).to.equal( [ '䷆' , '䷆' ] ) ;
		expect( unicode.toArray( '備' ) ).to.equal( [ '備' ] ) ;
		expect( unicode.toArray( '備備' ) ).to.equal( [ '備' , '備' ] ) ;
		expect( unicode.toArray( '備-備' ) ).to.equal( [ '備' , '-' , '備' ] ) ;
	} ) ;

	it( "unicode.toCells() should produce an array of characters with filler chars following wide chars and tab" , () => {
		expect( unicode.toCells( Cell , '' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [] ) ;
		expect( unicode.toCells( Cell , 'a' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' ] ) ;
		expect( unicode.toCells( Cell , 'abc' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , 'b' , 'c' ] ) ;
		expect( unicode.toCells( Cell , '\x1b[' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '\x1b' , '[' ] ) ;
		expect( unicode.toCells( Cell , '𝌆' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '𝌆' ] ) ;
		expect( unicode.toCells( Cell , 'a𝌆' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , '𝌆' ] ) ;
		expect( unicode.toCells( Cell , 'a𝌆a𝌆a' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , '𝌆' , 'a' , '𝌆' , 'a' ] ) ;
		expect( unicode.toCells( Cell , 'é𝌆é𝌆é' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'é' , '𝌆' , 'é' , '𝌆' , 'é' ] ) ;
		expect( unicode.toCells( Cell , '䷆䷆' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '䷆' , '䷆' ] ) ;
		expect( unicode.toCells( Cell , '備' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '備' , null ] ) ;
		expect( unicode.toCells( Cell , '備備' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '備' , null , '備' , null ] ) ;
		expect( unicode.toCells( Cell , '備-備' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '備' , null , '-' , '備' , null ] ) ;

		expect( unicode.toCells( Cell , '🔴' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '🔴' , null ] ) ;
		expect( unicode.toCells( Cell , '🔴' ).map( cell => cell.char ) ).to.be.like( [ '🔴' , ' ' ] ) ;

		// Tabs
		expect( unicode.toCells( Cell , '\ta' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '\t' , null , null , null , 'a' ] ) ;
		expect( unicode.toCells( Cell , '\ta' ).map( cell => cell.char ) ).to.be.like( [ '\t' , ' ' , ' ' , ' ' , 'a' ] ) ;
		expect( unicode.toCells( Cell , '\ta' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '\t' , null , null , null , 'a' ] ) ;
		expect( unicode.toCells( Cell , 'a\ta' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , '\t' , null , null , 'a' ] ) ;
		expect( unicode.toCells( Cell , 'aa\ta' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , 'a' , '\t' , null , 'a' ] ) ;
		expect( unicode.toCells( Cell , 'aaa\ta' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , 'a' , 'a' , '\t' , 'a' ] ) ;
		expect( unicode.toCells( Cell , 'aaaa\ta' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , 'a' , 'a' , 'a' , '\t' , null , null , null , 'a' ] ) ;
		expect( unicode.toCells( Cell , '備\ta' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '備' , null , '\t' , null , 'a' ] ) ;

		expect( unicode.toCells( Cell , '\t\t' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '\t' , null , null , null , '\t' , null , null , null ] ) ;
		expect( unicode.toCells( Cell , '\ta\t' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '\t' , null , null , null , 'a' , '\t' , null , null ] ) ;
		expect( unicode.toCells( Cell , 'a\t\t' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , '\t' , null , null , '\t' , null , null , null ] ) ;
		expect( unicode.toCells( Cell , 'a\ta\t' ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ 'a' , '\t' , null , null , 'a' , '\t' , null , null ] ) ;

		expect( unicode.toCells( Cell , '\ta' , undefined , 2 ).map( cell => cell.filler ? null : cell.char ) ).to.be.like( [ '\t' , null , 'a' ] ) ;
	} ) ;

	it( "unicode.fromCells() should be the inverse of the unicode.toCells()" , () => {
		expect( unicode.fromCells( unicode.toCells( Cell , '備\ta' ) ) ).to.be( '備\ta' ) ;
		expect( unicode.fromCells( unicode.toCells( Cell , '🔴' ) ) ).to.be( '🔴' ) ;
	} ) ;

	it( "unicode.surrogatePair() should return 0 for single char, 1 for leading surrogate, -1 for trailing surrogate" , () => {
		expect( unicode.surrogatePair( 'a' ) ).to.be( 0 ) ;
		expect( '𝌆'.length ).to.be( 2 ) ;
		expect( unicode.surrogatePair( '𝌆'[0] ) ).to.be( 1 ) ;
		expect( unicode.surrogatePair( '𝌆'[1] ) ).to.be( -1 ) ;
		expect( '備'.length ).to.be( 2 ) ;
		expect( unicode.surrogatePair( '備'[0] ) ).to.be( 1 ) ;
		expect( unicode.surrogatePair( '備'[1] ) ).to.be( -1 ) ;

		// Can be wide or not, but expressed in only 1 code unit
		expect( '䷆'.length ).to.be( 1 ) ;
		expect( unicode.surrogatePair( '䷆'[0] ) ).to.be( 0 ) ;
		//		expect( unicode.surrogatePair( '䷆'[1] ) ).to.be( undefined ) ;
	} ) ;

	it( "unicode.isFullWidth() should return true if the char is full-width" , () => {
		expect( unicode.isFullWidth( '…' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( 'a' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( 'aa' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '＠' ) ).to.be( true ) ;
		expect( unicode.isFullWidth( '𝌆' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '備' ) ).to.be( true ) ;
		expect( unicode.isFullWidth( '䷆' ) ).to.be( false ) ;
		
		expect( unicode.isFullWidth( '＠＠' ) ).to.be( true ) ;
		expect( unicode.isFullWidth( 'a＠' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '＠a' ) ).to.be( true ) ;
	} ) ;

	it( "unicode.isFullWidth() and emojis" , () => {
		expect( unicode.isFullWidth( '●' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '║' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '▲' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '⡓' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '♥' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '♡' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '♥️' ) ).to.be( false ) ;
		expect( unicode.isFullWidth( '🔴' ) ).to.be( true ) ;
		expect( unicode.isFullWidth( '😀' ) ).to.be( true ) ;
	} ) ;

	it( "unicode.isDiacritic()" , () => {
		expect( unicode.isZeroWidthDiacritic( 'a' ) ).to.be( false ) ;
		expect( unicode.isZeroWidthDiacritic( 'อั' ) ).to.be( false ) ;
		expect( unicode.isZeroWidthDiacritic( 'อั'[1] ) ).to.be( true ) ;
	} ) ;

	it( "unicode.isEmoji() should return true if the char is an emoji" , () => {
		expect( unicode.isEmoji( 'a' ) ).to.be( false ) ;
		expect( unicode.isEmoji( '＠' ) ).to.be( false ) ;
		expect( unicode.isEmoji( '𝌆' ) ).to.be( false ) ;
		expect( unicode.isEmoji( '備' ) ).to.be( false ) ;
		expect( unicode.isEmoji( '䷆' ) ).to.be( false ) ;
		expect( unicode.isEmoji( '🔴' ) ).to.be( true ) ;
		expect( unicode.isEmoji( '😀' ) ).to.be( true ) ;
		expect( unicode.isEmoji( '♡' ) ).to.be( true ) ;
		expect( unicode.isEmoji( '♥️' ) ).to.be( true ) ;
	} ) ;

	it( ".toFullWidth() should transform a character to its full-width variant, if it exist" , () => {
		expect( unicode.toFullWidth( '@' ) ).to.be( '＠' ) ;
		expect( unicode.toFullWidth( 'é' ) ).to.be( 'é' ) ;
	} ) ;

	it( ".width() should return the width of a string when displayed on a terminal or a monospace font" , () => {
		expect( unicode.width( 'aé@à' ) ).to.be( 4 ) ;
		expect( unicode.width( 'aé＠à' ) ).to.be( 5 ) ;
		expect( unicode.width( 'aé汉字à' ) ).to.be( 7 ) ;

		expect( unicode.width( '😀️' ) ).to.be( 2 ) ;
		expect( unicode.width( '♥' ) ).to.be( 1 ) ;
		expect( unicode.width( '♥️' ) ).to.be( 1 ) ;
	} ) ;

	it( ".charWidth() should the width of a single character" , () => {
		expect( unicode.charWidth( 'a' ) ).to.be( 1 ) ;
		expect( unicode.charWidth( 'é' ) ).to.be( 1 ) ;
		expect( unicode.charWidth( '䷆' ) ).to.equal( 1 ) ;
		expect( unicode.charWidth( '備' ) ).to.equal( 2 ) ;
		expect( unicode.charWidth( '汉' ) ).to.be( 2 ) ;
		expect( unicode.charWidth( '字' ) ).to.be( 2 ) ;
	} ) ;

	it( ".arrayWidth() should return the width of an array of string when displayed on a terminal or a monospace font" , () => {
		expect( unicode.arrayWidth( [ '汉' , '字' ] ) ).to.be( 4 ) ;
		expect( unicode.arrayWidth( [ '汉' , '字' , '＠' ] ) ).to.be( 6 ) ;
		expect( unicode.arrayWidth( [ '汉' , 'a' , '字' , '&' ] ) ).to.be( 6 ) ;
		expect( unicode.arrayWidth( [ 'c' , '汉' , '字' , '＠' , '&' ] ) ).to.be( 8 ) ;

		expect( unicode.arrayWidth( [ '汉' , '字' ] , 2 ) ).to.be( 4 ) ;
		expect( unicode.arrayWidth( [ '汉' , '字' ] , 1 ) ).to.be( 2 ) ;
		expect( unicode.arrayWidth( [ 'c' , '汉' , '字' , '＠' , '&' ] , 0 ) ).to.be( 0 ) ;
		expect( unicode.arrayWidth( [ 'c' , '汉' , '字' , '＠' , '&' ] , 1 ) ).to.be( 1 ) ;
		expect( unicode.arrayWidth( [ 'c' , '汉' , '字' , '＠' , '&' ] , 2 ) ).to.be( 3 ) ;
		expect( unicode.arrayWidth( [ 'c' , '汉' , '字' , '＠' , '&' ] , 3 ) ).to.be( 5 ) ;
		expect( unicode.arrayWidth( [ 'c' , '汉' , '字' , '＠' , '&' ] , 4 ) ).to.be( 7 ) ;
		expect( unicode.arrayWidth( [ 'c' , '汉' , '字' , '＠' , '&' ] , 5 ) ).to.be( 8 ) ;
	} ) ;

	it( ".truncateLength() should return a string that does not exceed the character limit" , () => {
		expect( unicode.truncateLength( 'aé@à' , 2 ) ).to.be( 'aé' ) ;
		expect( unicode.truncateLength( 'aé@à' , 3 ) ).to.be( 'aé@' ) ;
		expect( unicode.truncateLength( 'aé@à' , 4 ) ).to.be( 'aé@à' ) ;

		expect( unicode.truncateLength( 'aé＠à' , 2 ) ).to.be( 'aé' ) ;
		expect( unicode.truncateLength( 'aé＠à' , 3 ) ).to.be( 'aé＠' ) ;
		expect( unicode.truncateLength( 'aé＠à' , 4 ) ).to.be( 'aé＠à' ) ;

		expect( unicode.truncateLength( 'aé汉字à' , 2 ) ).to.be( 'aé' ) ;
		expect( unicode.truncateLength( 'aé汉字à' , 3 ) ).to.be( 'aé汉' ) ;
		expect( unicode.truncateLength( 'aé汉字à' , 4 ) ).to.be( 'aé汉字' ) ;
		expect( unicode.truncateLength( 'aé汉字à' , 5 ) ).to.be( 'aé汉字à' ) ;

		// Alias
		expect( unicode.truncate( 'aé汉字à' , 3 ) ).to.be( 'aé汉' ) ;
	} ) ;

	it( ".truncateWidth() should return a string that does not exceed the width limit" , () => {
		expect( unicode.truncateWidth( 'aé@à' , 3 ) ).to.be( 'aé@' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 3 ) ;
		expect( unicode.truncateWidth( 'aé@à' , 4 ) ).to.be( 'aé@à' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 4 ) ;
		expect( unicode.truncateWidth( 'aé@à' , 5 ) ).to.be( 'aé@à' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 4 ) ;
		expect( unicode.truncateWidth( 'aé＠à' , 2 ) ).to.be( 'aé' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 2 ) ;
		expect( unicode.truncateWidth( 'aé＠à' , 3 ) ).to.be( 'aé' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 2 ) ;
		expect( unicode.truncateWidth( 'aé＠à' , 4 ) ).to.be( 'aé＠' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 4 ) ;
		expect( unicode.truncateWidth( 'aé＠à' , 5 ) ).to.be( 'aé＠à' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 5 ) ;
		expect( unicode.truncateWidth( 'aé＠à' , 6 ) ).to.be( 'aé＠à' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 5 ) ;
		expect( unicode.truncateWidth( 'aé汉字à' , 2 ) ).to.be( 'aé' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 2 ) ;
		expect( unicode.truncateWidth( 'aé汉字à' , 3 ) ).to.be( 'aé' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 2 ) ;
		expect( unicode.truncateWidth( 'aé汉字à' , 4 ) ).to.be( 'aé汉' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 4 ) ;
		expect( unicode.truncateWidth( 'aé汉字à' , 5 ) ).to.be( 'aé汉' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 4 ) ;
		expect( unicode.truncateWidth( 'aé汉字à' , 6 ) ).to.be( 'aé汉字' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 6 ) ;
		expect( unicode.truncateWidth( 'aé汉字à' , 7 ) ).to.be( 'aé汉字à' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 7 ) ;
		expect( unicode.truncateWidth( 'aé汉字à' , 8 ) ).to.be( 'aé汉字à' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 7 ) ;

		expect( unicode.truncateWidth( 'aé汉字' , 5 ) ).to.be( 'aé汉' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 4 ) ;
		expect( unicode.truncateWidth( 'aé汉字' , 6 ) ).to.be( 'aé汉字' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 6 ) ;
		expect( unicode.truncateWidth( 'aé汉字' , 7 ) ).to.be( 'aé汉字' ) ;
		expect( unicode.getLastTruncateWidth() ).to.be( 6 ) ;
	} ) ;

	it.skip( "Thai support" , () => {
		expect( unicode.toArray( 'อักษรไทย' ) ).to.equal( ['อั','ก','ษ','ร','ไ','ท','ย'] ) ;
	} ) ;
} ) ;

