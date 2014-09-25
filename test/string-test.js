/*
	The Cedric's Swiss Knife (CSK) - CSK string toolbox test suite

	Copyright (c) 2014 Cédric Ronvel 
	
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


var string = require( '../lib/string.js' ) ;
var expect = require( 'expect.js' ) ;





			/* Tests */



describe( "format()" , function() {
	
	var format = string.format ;
	
	it( "%u should format unsigned integer" , function() {
		
		expect( format( '%u' , 123 ) ).to.be( '123' ) ;
		expect( format( '%u' , 0 ) ).to.be( '0' ) ;
		expect( format( '%u' , -123 ) ).to.be( '0' ) ;
		expect( format( '%u' ) ).to.be( '0' ) ;
	} ) ;
	
	it( "%U should format *positive* unsigned integer" , function() {
		
		expect( format( '%U' , 123 ) ).to.be( '123' ) ;
		expect( format( '%U' , 0 ) ).to.be( '1' ) ;
		expect( format( '%U' , -123 ) ).to.be( '1' ) ;
		expect( format( '%U' ) ).to.be( '1' ) ;
	} ) ;
	
	it( "should" , function() {
		
		expect( format( 'ABC: %s%s%s' , 'A' , 'B' , 'C' ) ) ;
		expect( format( 'BAC: %+1s%-1s%s' , 'A' , 'B' , 'C' ) ) ;
		expect( format( 'CBC: %3s%s' , 'A' , 'B' , 'C' ) ) ;
	} ) ;
	
	it( "format.count() should count the number of arguments found" , function() {
		
		expect( format.count( 'blah blih blah' ) ).to.be( 0 ) ;
		expect( format.count( '%i %s' ) ).to.be( 2 ) ;
	} ) ;
	
	it( "when using a filter object as the *this* context, the %[functionName] format should use a custom function to format the input" , function() {
		
		var filters = {
			fixed: function() { return 'F' ; } ,
			double: function( str ) { return '' + str + str ; } ,
			fxy: function( a , b ) { return '' + ( a * a + b ) ; }
		} ;
		
		expect( format.call( filters , '%[fixed]%s%s%s' , 'A' , 'B' , 'C' ) ).to.be( 'FABC' ) ;
		expect( format.call( filters , '%s%[fxy:%a%a]' , 'f(x,y)=' , 5 , 3 ) ).to.be( 'f(x,y)=28' ) ;
		expect( format.call( filters , '%s%[fxy:%+1a%-1a]' , 'f(x,y)=' , 5 , 3 ) ).to.be( 'f(x,y)=14' ) ;
	} ) ;
} ) ;


