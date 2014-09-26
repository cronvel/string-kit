/*
	The Cedric's Swiss Knife (CSK) - CSK string toolbox

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

/*
*/

// Load modules
var tree = require( 'tree-kit' ) ;
var term = require( 'terminal-kit' ) ;



// Create and export
var string = {} ;
module.exports = string ;



// String formater, inspired by C's printf

/*
	%s	string
	%f	float
	%d	integer
	%i	integer, same as %d
	%u	unsigned integer
	%U	unsigned positive integer (>0)
	%x	hexadecimal
	%h	hexadecimal, same as %x
	%o	octal
	%b	binary
	%D	drop
	%[	filter function existing in the 'this' context, e.g. %[filter:%a%a]
	%a	argument for a function
	
	Candidate format:
	%c	for char? (can receive a string or an integer translated into an UTF8 chars)
	%C	for currency formating?
	%O	for object? (using JSON.stringify() ?)
	%B	for Buffer objects?
	%e	for scientific notation?
*/

string.format = function format( str )
{
	if ( typeof str !== 'string' )
	{
		if ( str === null || str === undefined ) { return '' ; }
		else if ( /*str && typeof str === 'object' && */ typeof str.toString === 'function' ) { str = str.toString() ; }
		else { return '' ; }
	}
	
	var arg , autoIndex = 1 , args = arguments , length = arguments.length , self = this ;
	
	//console.log( 'format args:' , arguments ) ;
	
	// /!\ each changes here should be reported on string.format.count() too /!\
	str = str.replace( /%([+-]?)([0-9]*)(([a-zA-Z%])|\[([a-zA-Z0-9_]+)(:([^\]]*))?\])/g ,
		function( match , relative , index , trash , mode , fn , trash2 , argString ) {		// jshint ignore:line
		
			//console.log( 'replaceArgs:' , arguments , 'MATCH:' , match ) ;
			if ( mode === '%' ) { return '%'; }
			
			if ( fn )
			{
				var i , argMatches , argList = [] ;
				
				if ( argString && ( argMatches = argString.match( /%([+-]?)([0-9]*)[a-zA-Z]/g ) ) )
				{
					//console.log( argMatches ) ;
					//console.log( argString ) ;
					for ( i = 0 ; i < argMatches.length ; i ++ )
					{
						relative = argMatches[ i ][ 1 ] ;
						index = argMatches[ i ][ 2 ] ;
						
						if ( index )
						{
							index = parseInt( index ) ;
							
							if ( relative )
							{
								if ( relative === '+' ) { index = autoIndex + index ; }
								else if ( relative === '-' ) { index = autoIndex - index ; }
							}
						}
						else
						{
							index = autoIndex ;
						}
						
						autoIndex ++ ;
						
						if ( index >= length || index < 1 ) { argList[ i ] = undefined ; }
						else { argList[ i ] = args[ index ] ; }
					}
				}
				
				//console.log( '~F~' ) ;
				if ( typeof self[ fn ] !== 'function' ) { return '' ; }
				return self[ fn ].apply( self , argList ) ;
			}
			
			if ( index )
			{
				index = parseInt( index ) ;
				
				if ( relative )
				{
					if ( relative === '+' ) { index = autoIndex + index ; }
					else if ( relative === '-' ) { index = autoIndex - index ; }
				}
			}
			else
			{
				index = autoIndex ;
			}
			
			autoIndex ++ ;
			
			if ( index >= length || index < 1 ) { arg = undefined ; }
			else { arg = args[ index ] ; }
			
			switch ( mode )
			{
				case 's' :	// string
					if ( arg === null || arg === undefined ) { return '' ; }
					if ( typeof arg === 'string' ) { return arg ; }
					if ( typeof arg === 'number' ) { return '' + arg ; }
					if ( typeof arg.toString === 'function' ) { return arg.toString() ; }
					return '' ;
				case 'f' :	// float
					if ( typeof arg === 'string' ) { arg = parseFloat( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + arg ; }
					return '0' ;
				case 'd' :
				case 'i' :	// integer decimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.floor( arg ) ; }
					return '0' ;
				case 'u' :	// unsigned decimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ) ; }
					return '0' ;
				case 'U' :	// unsigned positive decimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 1 ) ; }
					return '1' ;
				case 'x' :
				case 'h' :	// unsigned hexadecimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 16 ) ; }
					return '0' ;
				case 'o' :	// unsigned hexadecimal
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 8 ) ; }
					return '0' ;
				case 'b' :	// unsigned binary
					if ( typeof arg === 'string' ) { arg = parseInt( arg ) ; }
					if ( typeof arg === 'number' ) { return '' + Math.max( Math.floor( arg ) , 0 ).toString( 2 ) ; }
					return '0' ;
				default :
					return '' ;
			}
	} ) ;
	
	for ( ; autoIndex < length ; autoIndex ++ )
	{
		arg = args[ autoIndex ] ;
		if ( arg === null || arg === undefined ) { continue ; }
		else if ( typeof arg === 'string' ) { str += arg ; }
		else if ( typeof arg === 'number' ) { str += arg ; }
		else if ( typeof arg.toString === 'function' ) { str += arg.toString() ; }
	}
	
	return str ;
} ;



// Count the number of parameters needed for this string
string.format.count = function count( str )
{
	if ( typeof str !== 'string' ) { return 0 ; }
	
	// This regex differs slightly from the main regex: we do not count '%%' and '%['
	var matches = str.match( /%[+-]?[0-9]*[a-zA-Z]/g ) ;
	if ( ! matches ) { return 0 ; }
	else { return matches.length ; }
} ;





string.escape = {} ;

// From Mozilla Developper Network
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
string.escape.regExp = function escapeRegExp( str ) {
	return str.replace( /([.*+?^${}()|\[\]\/\\])/g , '\\$1' ) ;
} ;

string.escape.shellArg = function escapeShellArg( str ) {
	return '\'' + str.replace( /\'/g , "'\\''" ) + '\'' ;
} ;








/*
	TODO:
*/

/*
	options:
		* depth: depth limit, default: 3
		* proto: display prototype of function
*/

var sterm = term.str ;


function inspect( runtime , options , variable )
{
	var i , funcName , propertyList , constructor , keyIsProperty ,
		type , pre , nextIndent , nextIndent2 , isArray ,
		str = '' , key = '' , descriptorStr = '' , descriptor ;
	
	// Things applied only for the first call, not for recursive call
	if ( ! runtime )
	{
		if ( arguments.length < 3 ) { variable = options ; options = {} ; }
		else if ( ! options || typeof options !== 'object' ) { options = {} ; }
		
		runtime = { depth: 0 , indent: '' , ancestors: [] } ;
		
		if ( options.color )
		{
			if ( options.colorType === undefined ) { options.colorType = term.str.italic.brightBlack ; }
			if ( options.colorClass === undefined ) { options.colorClass = term.str.magenta ; }
			if ( options.colorKey === undefined ) { options.colorKey = term.str.green ; }
			if ( options.colorIndex === undefined ) { options.colorIndex = term.str.blue ; }
			if ( options.colorNumber === undefined ) { options.colorNumber = term.str.blue ; }
			if ( options.colorString === undefined ) { options.colorString = term.str.blue ; }
		}
		
		if ( options.html )
		{
			if ( options.tab === undefined ) { options.tab = '&nbsp;&nbsp;&nbsp;&nbsp;' ; }
			if ( options.nl === undefined ) { options.nl = '<br />' ; }
		}
		
		if ( options.depth === undefined ) { options.depth = 3 ; }
		
		if ( options.tab === undefined ) { options.tab = '    ' ; }
		//if ( options.tab === undefined ) { options.tab = '\t' ; }
		if ( options.nl === undefined ) { options.nl = '\n' ; }
	}
	
	type = typeof variable ;
	
	
	nextIndent = runtime.indent + options.tab ;
	nextIndent2 = nextIndent + options.tab ;
	
	
	if ( runtime.key !== undefined )
	{
		if ( runtime.descriptor )
		{
			descriptorStr = [] ;
			
			if ( ! runtime.descriptor.configurable ) { descriptorStr.push( '-conf' ) ; }
			if ( ! runtime.descriptor.enumerable ) { descriptorStr.push( '-enum' ) ; }
			
			if ( runtime.descriptor.get || runtime.descriptor.set ) { descriptorStr.push( 'getter/setter' ) ; }
			else if ( ! runtime.descriptor.writable ) { descriptorStr.push( '-w' ) ; }
			
			if ( descriptorStr.length ) { descriptorStr = ' (' + descriptorStr.join( ' ' ) + ')' ; }
			else { descriptorStr = '' ; }
		}
		
		if ( options.html )
		{
			key = runtime.keyIsProperty ?
				'<i style="color:green;">' + runtime.key + ( descriptorStr ? '<span style="color:gray;">' + descriptorStr + '</span>' : '' ) + '</i> : ' :
				'[<i style="color:blue;">' + runtime.key + '</i>] : ' ;
		}
		else if ( options.color )
		{
			key = runtime.keyIsProperty ?
				options.colorKey( runtime.key ) + ( descriptorStr ? options.colorType( descriptorStr ) : '' ) + ' : ' :
				'[' + options.colorIndex( runtime.key ) + '] : ' ;
		}
		else
		{
			key = runtime.keyIsProperty ?
				runtime.key + ( descriptorStr ? descriptorStr : '' ) + " : " :
				'[' + runtime.key + '] : ' ;
		}
	}
	
	
	pre = runtime.indent + key ;
	
	
	if ( variable === undefined )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">undefined</i>' + options.nl ; }
		else if ( options.color ) { str += pre + options.colorType( "undefined" ) + options.nl ; }
		else { str += pre + "<undefined>" + options.nl ; }
	}
	else if ( variable === null )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">null</i>' + options.nl ; }
		else if ( options.color ) { str += pre + options.colorType( "null" ) + options.nl ; }
		else { str += pre + "<null>" + options.nl ; }
	}
	else if ( variable === false )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">false</i>' + options.nl ; }
		else if ( options.color ) { str += pre + options.colorType( "false" ) + options.nl ; }
		else { str += pre + "<false>" + options.nl ; }
	}
	else if ( variable === true )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">true</i>' + options.nl ; }
		else if ( options.color ) { str += pre + options.colorType( "true" ) + options.nl ; }
		else { str += pre + "<true>" + options.nl ; }
	}
	else if ( type === 'number' )
	{
		if ( options.html ) { str += pre + '<i style="color:blue;">' + variable.toString() + '</i> <i style="color:gray;">number</i>' + options.nl ; }
		else if ( options.color ) { str += pre + options.colorNumber( variable.toString() ) + options.colorType( " number" ) + options.nl ; }
		else { str += pre + variable.toString() + " <number>" + options.nl ; }
	}
	else if ( type === 'string' )
	{
		if ( options.html )
		{
			str += pre + '"<i style="color:cyan;">' +
				// escape( 'html_content' , variable ) +    // need to backport this later
				variable +
				'</i>" <i style="color:gray;">string</i>' + options.nl ;
		}
		else
		{
			// \r mess up things in linux CLI, turn them into literal
			variable = variable.replace( "\r" , "\\r" ) ;
			if ( options.color ) { str += pre + '"' + options.colorString( variable ) + '" ' + options.colorType( "string" ) + options.nl ; }
			else { str += pre + '"' + variable + '" <string>' + options.nl ; }
		}
	}
	else if ( type === 'function' )
	{
		funcName = variable.name ? variable.name : '<anonymous>' ;
		
		if ( options.html ) { str += pre + '<i style="color:gray;">' + funcName + " function (" + variable.length + ")</i>" ; }
		else if ( options.color ) { str += pre + options.colorClass( funcName ) + options.colorType( " function (" + variable.length + ")" ) ; }
		else { str += pre + "<" + funcName + " function> (" + variable.length + ")" ; }
		
		if ( runtime.depth < options.depth && options.proto )
		{
			propertyList = Object.getOwnPropertyNames( variable.prototype ) ;
			
			str += options.nl + runtime.indent + "--> prototype {" + options.nl ;
			
			for ( i = 0 ; i < propertyList.length ; i ++ )
			{
				str += inspect( {
						indent: nextIndent ,
						ancestors: runtime.ancestors.concat( variable ) ,
						key: propertyList[ i ] ,
						keyIsProperty: true
					} ,
					options ,
					variable.prototype[ propertyList[ i ] ]
				) ;
			}
			
			str += runtime.indent + "}" ;
		}
		
		str += options.nl ;
	}
	else if ( type === 'object' )
	{
		isArray = Array.isArray( variable ) ;
		constructor = variable.constructor.name ? variable.constructor.name : '<constructorless>' ;
		
		if ( options.html ) { str += pre + '<i style="color:gray;">' + constructor + " object</i>" ; }
		else if ( options.color ) { str += pre + options.colorClass( constructor ) + options.colorType( " object" ) ; }
		else { str += pre + "<" + constructor + " object>" ; }
		
		propertyList = Object.getOwnPropertyNames( variable ) ;
		
		if ( ! propertyList.length )
		{
			str += " {}" + options.nl ;
		}
		else if ( runtime.ancestors.indexOf( variable ) !== -1 )
		{
			str += " [circular]" + options.nl ;
		}
		else if ( runtime.depth >= options.depth )
		{
			str += " [depth limit]" + options.nl ;
		}
		else
		{
			//str += options.nl + runtime.indent + "{" + options.nl ;
			str += " {" + options.nl ;
			
			for ( i = 0 ; i < propertyList.length ; i ++ )
			{
				descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
				
				keyIsProperty = descriptor.enumerable && isArray ? false : true ;
				
				if ( descriptor.get || descriptor.set )
				{
					str += inspect( {
							depth: runtime.depth + 1 ,
							ancestors: runtime.ancestors.concat( variable ) ,
							indent: nextIndent ,
							key: propertyList[ i ] ,
							keyIsProperty: keyIsProperty ,
							descriptor: descriptor
						} ,
						options ,
						{ get: descriptor.get , set: descriptor.set }
					) ;
				}
				else
				{
					str += inspect( {
							depth: runtime.depth + 1 ,
							ancestors: runtime.ancestors.concat( variable ) ,
							indent: nextIndent ,
							key: propertyList[ i ] ,
							keyIsProperty: keyIsProperty ,
							descriptor: descriptor
						} ,
						options ,
						variable[ propertyList[ i ] ]
					) ;
				}
			}
			
			str += runtime.indent + "}" + options.nl ;
		}
	}
	
	return str ;
}



string.inspect = inspect.bind( undefined , null ) ;








/*

function dumpPrototypeChainStr( object , options )
{
	if ( object === null || typeof object !== 'object' )  return '<bad type>' ;
	
	var str = '' ;
	var current = Object.getPrototypeOf( object ) ;
	
	while ( typeof current === 'object' && current !== null )
	{
		if ( str )  str += " --> " ;
		str += current.constructor.name ;
		current = Object.getPrototypeOf( current ) ;
	}
	
	return str ;
}



// Shortcut
var dump = function( variable , options ) { console.log( dumpStr( variable , options ) ) ; } ;
var dumpError = function( error , options ) { console.log( dumpErrorStr( error , options ) ) ; } ;
var dumpPrototypeChain = function( object , options ) { console.log( dumpPrototypeChainStr( object , options ) ) ; } ;

*/

