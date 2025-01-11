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



const StringNumber = require( '..' ).StringNumber ;



describe( "StringNumber" , () => {

	it( "convert back and forth" , () => {
		var sn ;
		
		sn = new StringNumber( 0 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [], exposant: 0 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 0 ) ;

		sn = new StringNumber( 0.1234 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 0 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 0.1234 ) ;

		sn = new StringNumber( 0.0001234 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: -3 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 0.0001234 ) ;

		sn = new StringNumber( 1.234 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 1 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1.234 ) ;

		sn = new StringNumber( 123.4 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 3 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 123.4 ) ;

		sn = new StringNumber( 1234 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 4 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1234 ) ;

		sn = new StringNumber( 12340 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 5 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 12340 ) ;

		sn = new StringNumber( 123400000 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 9 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 123400000 ) ;

		sn = new StringNumber( 123400000000000 ) ;
		//console.log( sn , sn.toNumber() ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 15 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 123400000000000 ) ;

		sn = new StringNumber( 1234000000000000000000000 ) ;
		//console.log( sn , sn.toNumber() ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: 25 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1234000000000000000000000 ) ;

		sn = new StringNumber( 0.000000000000000000001234 ) ;
		//console.log( sn , sn.toNumber() ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 2, 3, 4 ], exposant: -20 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 0.000000000000000000001234 ) ;

		sn = new StringNumber( 987.00000000001234 ) ;
		//console.log( sn , sn.toNumber() ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 9, 8, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4 ], exposant: 3 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 987.00000000001234 ) ;

		sn = new StringNumber( -0.1234 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: -1, digits: [ 1, 2, 3, 4 ], exposant: 0 , special: null } ) ;
		expect( sn.toNumber() ).to.be( -0.1234 ) ;

		sn = new StringNumber( -123.4 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: -1, digits: [ 1, 2, 3, 4 ], exposant: 3 , special: null } ) ;
		expect( sn.toNumber() ).to.be( -123.4 ) ;
	} ) ;

	it( "simple .toString()" , () => {
		expect( new StringNumber( 0 ).toString() ).to.be( '0' ) ;
		expect( new StringNumber( 3 ).toString() ).to.be( '3' ) ;
		expect( new StringNumber( 30 ).toString() ).to.be( '30' ) ;
		expect( new StringNumber( 300 ).toString() ).to.be( '300' ) ;
		expect( new StringNumber( 0.3 ).toString() ).to.be( '0.3' ) ;
		expect( new StringNumber( 0.03 ).toString() ).to.be( '0.03' ) ;
		expect( new StringNumber( 0.003 ).toString() ).to.be( '0.003' ) ;
		expect( new StringNumber( 0.123 ).toString() ).to.be( '0.123' ) ;
		expect( new StringNumber( 0.00123 ).toString() ).to.be( '0.00123' ) ;
		expect( new StringNumber( 123.456 ).toString() ).to.be( '123.456' ) ;
		expect( new StringNumber( 12300.456 ).toString() ).to.be( '12300.456' ) ;
		expect( new StringNumber( 123.00456 ).toString() ).to.be( '123.00456' ) ;
		expect( new StringNumber( 12300.00456 ).toString() ).to.be( '12300.00456' ) ;

		expect( new StringNumber( -3 ).toString() ).to.be( '-3' ) ;
		expect( new StringNumber( -123.456 ).toString() ).to.be( '-123.456' ) ;
		expect( new StringNumber( -0.00123 ).toString() ).to.be( '-0.00123' ) ;
	} ) ;

	it( ".toExponential()" , () => {
		expect( new StringNumber( 0 ).toExponential() ).to.be( '0' ) ;
		expect( new StringNumber( 3 ).toExponential() ).to.be( '3e+0' ) ;
		expect( new StringNumber( 30 ).toExponential() ).to.be( '3e+1' ) ;
		expect( new StringNumber( 30000 ).toExponential() ).to.be( '3e+4' ) ;
		expect( new StringNumber( 0.3 ).toExponential() ).to.be( '3e-1' ) ;
		expect( new StringNumber( 0.03 ).toExponential() ).to.be( '3e-2' ) ;
		expect( new StringNumber( 0.123 ).toExponential() ).to.be( '1.23e-1' ) ;
		expect( new StringNumber( 0.00123 ).toExponential() ).to.be( '1.23e-3' ) ;
		expect( new StringNumber( 123.456 ).toExponential() ).to.be( '1.23456e+2' ) ;
		expect( new StringNumber( 12300.456 ).toExponential() ).to.be( '1.2300456e+4' ) ;
		expect( new StringNumber( 123.00456 ).toExponential() ).to.be( '1.2300456e+2' ) ;
		expect( new StringNumber( 12300.00456 ).toExponential() ).to.be( '1.230000456e+4' ) ;

		expect( new StringNumber( -3 ).toExponential() ).to.be( '-3e+0' ) ;
		expect( new StringNumber( -12300.456 ).toExponential() ).to.be( '-1.2300456e+4' ) ;
		expect( new StringNumber( -0.00123 ).toExponential() ).to.be( '-1.23e-3' ) ;
	} ) ;

	it( ".toScientific()" , () => {
		expect( new StringNumber( 0 ).toScientific() ).to.be( '0' ) ;
		expect( new StringNumber( 3 ).toScientific() ).to.be( '3 × 10⁰' ) ;
		expect( new StringNumber( 30 ).toScientific() ).to.be( '3 × 10¹' ) ;
		expect( new StringNumber( 30000 ).toScientific() ).to.be( '3 × 10⁴' ) ;
		expect( new StringNumber( 0.3 ).toScientific() ).to.be( '3 × 10⁻¹' ) ;
		expect( new StringNumber( 0.03 ).toScientific() ).to.be( '3 × 10⁻²' ) ;
		expect( new StringNumber( 0.123 ).toScientific() ).to.be( '1.23 × 10⁻¹' ) ;
		expect( new StringNumber( 0.00123 ).toScientific() ).to.be( '1.23 × 10⁻³' ) ;
		expect( new StringNumber( 123.456 ).toScientific() ).to.be( '1.23456 × 10²' ) ;
		expect( new StringNumber( 12300.456 ).toScientific() ).to.be( '1.2300456 × 10⁴' ) ;
		expect( new StringNumber( 123.00456 ).toScientific() ).to.be( '1.2300456 × 10²' ) ;
		expect( new StringNumber( 12300.00456 ).toScientific() ).to.be( '1.230000456 × 10⁴' ) ;

		expect( new StringNumber( -3 ).toScientific() ).to.be( '-3 × 10⁰' ) ;
		expect( new StringNumber( -12300.456 ).toScientific() ).to.be( '-1.2300456 × 10⁴' ) ;
		expect( new StringNumber( -0.00123 ).toScientific() ).to.be( '-1.23 × 10⁻³' ) ;
	} ) ;

	it( "precision" , () => {
		var sn ;
		
		sn = new StringNumber( 1001 ).precision( 3 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1 ], exposant: 4 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1000 ) ;
		
		sn = new StringNumber( 1004 ).precision( 3 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1 ], exposant: 4 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1000 ) ;
		
		sn = new StringNumber( 1005 ).precision( 3 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 0, 1 ], exposant: 4 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1010 ) ;
		
		sn = new StringNumber( 1009 ).precision( 3 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 0, 1 ], exposant: 4 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1010 ) ;
		
		sn = new StringNumber( 1039 ).precision( 3 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 1, 0, 4 ], exposant: 4 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 1040 ) ;
		
		sn = new StringNumber( 1999 ).precision( 3 ) ;
		//console.log( sn ) ;
		expect( sn ).to.be.partially.like( { sign: 1, digits: [ 2 ], exposant: 4 , special: null } ) ;
		expect( sn.toNumber() ).to.be( 2000 ) ;
	} ) ;

	it( "group separator" , () => {
		expect( new StringNumber( 0 , { groupSeparator: ' ' } ).toString() ).to.be( '0' ) ;
		expect( new StringNumber( 3 , { groupSeparator: ' ' } ).toString() ).to.be( '3' ) ;
		expect( new StringNumber( 12300 , { groupSeparator: ' ' } ).toString() ).to.be( '12 300' ) ;
		expect( new StringNumber( 123456789 , { groupSeparator: ' ' } ).toString() ).to.be( '123 456 789' ) ;
		expect( new StringNumber( 1234567890 , { groupSeparator: ' ' } ).toString() ).to.be( '1 234 567 890' ) ;

		expect( new StringNumber( 12345.6789 , { groupSeparator: ' ' } ).toString() ).to.be( '12 345.6789' ) ;
		expect( new StringNumber( -12345 , { groupSeparator: ' ' } ).toString() ).to.be( '-12 345' ) ;
		expect( new StringNumber( -12345.6789 , { groupSeparator: ' ' } ).toString() ).to.be( '-12 345.6789' ) ;

		// French separators
		expect( new StringNumber( 12345.6789 , { groupSeparator: '.' , decimalSeparator: ',' } ).toString() ).to.be( '12.345,6789' ) ;
	} ) ;

	it( "leading/trailing zero padding" , () => {
		// Leading
		expect( new StringNumber( 0 ).toString( 2 ) ).to.be( '00' ) ;
		expect( new StringNumber( 7 ).toString( 2 ) ).to.be( '07' ) ;
		expect( new StringNumber( 789 ).toString( 2 ) ).to.be( '789' ) ;
		expect( new StringNumber( 7 ).toString( 3 ) ).to.be( '007' ) ;
		expect( new StringNumber( 0.7 ).toString( 2 ) ).to.be( '00.7' ) ;
		expect( new StringNumber( 2.7 ).toString( 2 ) ).to.be( '02.7' ) ;

		// Trailing
		expect( new StringNumber( 0 ).toString( undefined , 2 ) ).to.be( '0.00' ) ;
		expect( new StringNumber( 7 ).toString( undefined , 2 ) ).to.be( '7.00' ) ;
		expect( new StringNumber( 789 ).toString( undefined , 2 ) ).to.be( '789.00' ) ;
		expect( new StringNumber( 7 ).toString( undefined , 2 ) ).to.be( '7.00' ) ;
		expect( new StringNumber( 0.7 ).toString( undefined , 2 ) ).to.be( '0.70' ) ;
		expect( new StringNumber( 2.7 ).toString( undefined , 2 ) ).to.be( '2.70' ) ;

		// Trailing only if decimal
		expect( new StringNumber( 0 ).toString( undefined , 2 , true ) ).to.be( '0' ) ;
		expect( new StringNumber( 7 ).toString( undefined , 2 , true ) ).to.be( '7' ) ;
		expect( new StringNumber( 789 ).toString( undefined , 2 , true ) ).to.be( '789' ) ;
		expect( new StringNumber( 7 ).toString( undefined , 2 , true ) ).to.be( '7' ) ;
		expect( new StringNumber( 0.7 ).toString( undefined , 2 , true ) ).to.be( '0.70' ) ;
		expect( new StringNumber( 2.7 ).toString( undefined , 2 , true ) ).to.be( '2.70' ) ;

		// Leading and trailing
		expect( new StringNumber( 0 ).toString( 2 , 2 ) ).to.be( '00.00' ) ;
		expect( new StringNumber( 7 ).toString( 2 , 2 ) ).to.be( '07.00' ) ;
		expect( new StringNumber( 789 ).toString( 2 , 2 ) ).to.be( '789.00' ) ;
		expect( new StringNumber( 7 ).toString( 3 , 2 ) ).to.be( '007.00' ) ;
		expect( new StringNumber( 0.7 ).toString( 2 , 2 ) ).to.be( '00.70' ) ;
		expect( new StringNumber( 2.7 ).toString( 2 , 2 ) ).to.be( '02.70' ) ;

		// No leading
		expect( new StringNumber( 0.3 ).toString( 0 ) ).to.be( '.3' ) ;
		expect( new StringNumber( 0.03 ).toString( 0 ) ).to.be( '.03' ) ;
		expect( new StringNumber( 0.001 ).toString( 0 ) ).to.be( '.001' ) ;
		expect( new StringNumber( 0.999 ).toString( 0 ) ).to.be( '.999' ) ;
		expect( new StringNumber( 0 ).toString( 0 ) ).to.be( '0' ) ;
		expect( new StringNumber( 1.3 ).toString( 0 ) ).to.be( '1.3' ) ;
		expect( new StringNumber( 10.3 ).toString( 0 ) ).to.be( '10.3' ) ;
	} ) ;

	it( ".round()" , () => {
		expect( new StringNumber( 123 ).round().toString() ).to.be( '123' ) ;
		expect( new StringNumber( 123.456789 ).round().toString() ).to.be( '123' ) ;
		expect( new StringNumber( 123.5 ).round().toString() ).to.be( '124' ) ;
		expect( new StringNumber( 12345.6789 ).round().toString() ).to.be( '12346' ) ;

		expect( new StringNumber( 123.1234 ).round( 2 ).toString() ).to.be( '123.12' ) ;
		expect( new StringNumber( 123.125 ).round( 2 ).toString() ).to.be( '123.13' ) ;
		expect( new StringNumber( 123.456789 ).round( 2 ).toString() ).to.be( '123.46' ) ;
		expect( new StringNumber( 12345.6789 ).round( 3 ).toString() ).to.be( '12345.679' ) ;

		expect( new StringNumber( 123.456789 ).round( -2 ).toString() ).to.be( '100' ) ;
		expect( new StringNumber( 389 ).round( -2 ).toString() ).to.be( '400' ) ;
		expect( new StringNumber( 12345.6789 ).round( -3 ).toString() ).to.be( '12000' ) ;
		expect( new StringNumber( 78568 ).round( -3 ).toString() ).to.be( '79000' ) ;
		expect( new StringNumber( 78500 ).round( -3 ).toString() ).to.be( '79000' ) ;
		expect( new StringNumber( 78168 ).round( -3 ).toString() ).to.be( '78000' ) ;

		expect( new StringNumber( -123 ).round().toString() ).to.be( '-123' ) ;
		expect( new StringNumber( -123.456789 ).round().toString() ).to.be( '-123' ) ;
		expect( new StringNumber( -12345.6789 ).round().toString() ).to.be( '-12346' ) ;
		// Different from Math.round() which would round to -123
		expect( new StringNumber( -123.5 ).round().toString() ).to.be( '-124' ) ;
	} ) ;

	it( ".floor()" , () => {
		expect( new StringNumber( 123 ).floor().toString() ).to.be( '123' ) ;
		expect( new StringNumber( 123.456789 ).floor().toString() ).to.be( '123' ) ;
		expect( new StringNumber( 123.5 ).floor().toString() ).to.be( '123' ) ;
		expect( new StringNumber( 12345.6789 ).floor().toString() ).to.be( '12345' ) ;

		expect( new StringNumber( 123.1234 ).floor( 2 ).toString() ).to.be( '123.12' ) ;
		expect( new StringNumber( 123.125 ).floor( 2 ).toString() ).to.be( '123.12' ) ;
		expect( new StringNumber( 123.456789 ).floor( 2 ).toString() ).to.be( '123.45' ) ;
		expect( new StringNumber( 12345.6789 ).floor( 3 ).toString() ).to.be( '12345.678' ) ;

		expect( new StringNumber( 123.456789 ).floor( -2 ).toString() ).to.be( '100' ) ;
		expect( new StringNumber( 389 ).floor( -2 ).toString() ).to.be( '300' ) ;
		expect( new StringNumber( 12345.6789 ).floor( -3 ).toString() ).to.be( '12000' ) ;
		expect( new StringNumber( 78568 ).floor( -3 ).toString() ).to.be( '78000' ) ;
		expect( new StringNumber( 78500 ).floor( -3 ).toString() ).to.be( '78000' ) ;
		expect( new StringNumber( 78168 ).floor( -3 ).toString() ).to.be( '78000' ) ;

		expect( new StringNumber( -123 ).floor().toString() ).to.be( '-123' ) ;
		expect( new StringNumber( -123.456789 ).floor().toString() ).to.be( '-124' ) ;
		expect( new StringNumber( -12345.6789 ).floor().toString() ).to.be( '-12346' ) ;
	} ) ;

	it( ".ceil()" , () => {
		expect( new StringNumber( 123 ).ceil().toString() ).to.be( '123' ) ;
		expect( new StringNumber( 123.456789 ).ceil().toString() ).to.be( '124' ) ;
		expect( new StringNumber( 123.5 ).ceil().toString() ).to.be( '124' ) ;
		expect( new StringNumber( 12345.6789 ).ceil().toString() ).to.be( '12346' ) ;

		expect( new StringNumber( 123.1234 ).ceil( 2 ).toString() ).to.be( '123.13' ) ;
		expect( new StringNumber( 123.125 ).ceil( 2 ).toString() ).to.be( '123.13' ) ;
		expect( new StringNumber( 123.456789 ).ceil( 2 ).toString() ).to.be( '123.46' ) ;
		expect( new StringNumber( 12345.6789 ).ceil( 3 ).toString() ).to.be( '12345.679' ) ;

		expect( new StringNumber( 123.456789 ).ceil( -2 ).toString() ).to.be( '200' ) ;
		expect( new StringNumber( 389 ).ceil( -2 ).toString() ).to.be( '400' ) ;
		expect( new StringNumber( 12345.6789 ).ceil( -3 ).toString() ).to.be( '13000' ) ;
		expect( new StringNumber( 78568 ).ceil( -3 ).toString() ).to.be( '79000' ) ;
		expect( new StringNumber( 78500 ).ceil( -3 ).toString() ).to.be( '79000' ) ;
		expect( new StringNumber( 78168 ).ceil( -3 ).toString() ).to.be( '79000' ) ;

		expect( new StringNumber( -123 ).ceil().toString() ).to.be( '-123' ) ;
		expect( new StringNumber( -123.456789 ).ceil().toString() ).to.be( '-123' ) ;
		expect( new StringNumber( -12345.6789 ).ceil().toString() ).to.be( '-12345' ) ;
	} ) ;

	it( "metric system" , () => {
		expect( new StringNumber( 0 ).toMetric() ).to.be( '0' ) ;
		expect( new StringNumber( 3 ).toMetric() ).to.be( '3' ) ;
		expect( new StringNumber( 30 ).toMetric() ).to.be( '30' ) ;
		expect( new StringNumber( 3000 ).toMetric() ).to.be( '3k' ) ;
		expect( new StringNumber( 30000 ).toMetric() ).to.be( '30k' ) ;
		expect( new StringNumber( 123000000 ).toMetric() ).to.be( '123M' ) ;
		expect( new StringNumber( 12300000 ).toMetric() ).to.be( '12.3M' ) ;
		expect( new StringNumber( 1230000 ).toMetric() ).to.be( '1.23M' ) ;
		expect( new StringNumber( 123000000000 ).toMetric() ).to.be( '123G' ) ;
		expect( new StringNumber( 123000000000000 ).toMetric() ).to.be( '123T' ) ;
		expect( new StringNumber( 123000000000000000 ).toMetric() ).to.be( '123P' ) ;

		expect( new StringNumber( 0.3 ).toMetric() ).to.be( '300m' ) ;
		expect( new StringNumber( 0.03 ).toMetric() ).to.be( '30m' ) ;
		expect( new StringNumber( 0.123 ).toMetric() ).to.be( '123m' ) ;
		expect( new StringNumber( 0.000123 ).toMetric() ).to.be( '123µ' ) ;
		expect( new StringNumber( 0.000000123 ).toMetric() ).to.be( '123n' ) ;
		expect( new StringNumber( 0.000000000123 ).toMetric() ).to.be( '123p' ) ;
		expect( new StringNumber( 0.000000000000123 ).toMetric() ).to.be( '123f' ) ;

		expect( new StringNumber( 123000.456 ).toMetric() ).to.be( '123.000456k' ) ;

		expect( new StringNumber( -3 ).toMetric() ).to.be( '-3' ) ;
		expect( new StringNumber( -12000 ).toMetric() ).to.be( '-12k' ) ;
		expect( new StringNumber( -0.000123 ).toMetric() ).to.be( '-123µ' ) ;
	} ) ;

	it( "roman numerals" , () => {
		expect( StringNumber.roman( 0 ).toString() ).to.be( 'N' ) ;
		expect( StringNumber.roman( 1 ).toString() ).to.be( 'I' ) ;
		expect( StringNumber.roman( 2 ).toString() ).to.be( 'II' ) ;
		expect( StringNumber.roman( 3 ).toString() ).to.be( 'III' ) ;
		expect( StringNumber.roman( 4 ).toString() ).to.be( 'IV' ) ;
		expect( StringNumber.roman( 5 ).toString() ).to.be( 'V' ) ;
		expect( StringNumber.roman( 14 ).toString() ).to.be( 'XIV' ) ;
		expect( StringNumber.roman( 16 ).toString() ).to.be( 'XVI' ) ;
		expect( StringNumber.roman( 30 ).toString() ).to.be( 'XXX' ) ;
		expect( StringNumber.roman( 59 ).toString() ).to.be( 'LIX' ) ;
		expect( StringNumber.roman( 78 ).toString() ).to.be( 'LXXVIII' ) ;
		expect( StringNumber.roman( 96 ).toString() ).to.be( 'XCVI' ) ;
		expect( StringNumber.roman( 300 ).toString() ).to.be( 'CCC' ) ;
		expect( StringNumber.roman( 3000 ).toString() ).to.be( 'MMM' ) ;
		expect( StringNumber.roman( 4578 ).toString() ).to.be( 'MMMMDLXXVIII' ) ;
		expect( StringNumber.roman( 5200 ).toString() ).to.be( 'ↁCC' ) ;
		expect( StringNumber.roman( 8700 ).toString() ).to.be( 'ↁↀↀↀDCC' ) ;
	} ) ;

	it( "additive roman numerals" , () => {
		expect( StringNumber.additiveRoman( 0 ).toString() ).to.be( 'N' ) ;
		expect( StringNumber.additiveRoman( 1 ).toString() ).to.be( 'I' ) ;
		expect( StringNumber.additiveRoman( 2 ).toString() ).to.be( 'II' ) ;
		expect( StringNumber.additiveRoman( 3 ).toString() ).to.be( 'III' ) ;
		expect( StringNumber.additiveRoman( 4 ).toString() ).to.be( 'IIII' ) ;
		expect( StringNumber.additiveRoman( 5 ).toString() ).to.be( 'V' ) ;
		expect( StringNumber.additiveRoman( 14 ).toString() ).to.be( 'XIIII' ) ;
		expect( StringNumber.additiveRoman( 16 ).toString() ).to.be( 'XVI' ) ;
		expect( StringNumber.additiveRoman( 30 ).toString() ).to.be( 'XXX' ) ;
		expect( StringNumber.additiveRoman( 59 ).toString() ).to.be( 'LVIIII' ) ;
		expect( StringNumber.additiveRoman( 78 ).toString() ).to.be( 'LXXVIII' ) ;
		expect( StringNumber.additiveRoman( 96 ).toString() ).to.be( 'LXXXXVI' ) ;
		expect( StringNumber.additiveRoman( 300 ).toString() ).to.be( 'CCC' ) ;
		expect( StringNumber.additiveRoman( 3000 ).toString() ).to.be( 'MMM' ) ;
		expect( StringNumber.additiveRoman( 4578 ).toString() ).to.be( 'MMMMDLXXVIII' ) ;
		expect( StringNumber.additiveRoman( 5200 ).toString() ).to.be( 'ↁCC' ) ;
		expect( StringNumber.additiveRoman( 8700 ).toString() ).to.be( 'ↁↀↀↀDCC' ) ;
	} ) ;
} ) ;

