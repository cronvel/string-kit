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
		* depth limit
		* cycle detection
		* Array with object's properties
*/

var sterm = term.str ;


function inspect( runtime , options , variable )
{
	var type , pre , nextIndent , nextIndent2 , str = '' , key = '' , descriptorStr = '' , descriptor ;
	
	// Things applied only for the first call, not for recursive call
	if ( ! runtime )
	{
		if ( arguments.length < 3 ) { variable = options ; options = {} ; }
		else if ( ! options || typeof options !== 'object' ) { options = {} ; }
		
		runtime = { depth: 0 , indent: '' } ;
		
		if ( options.color )
		{
			if ( options.colorType === undefined ) { options.colorType = term.str.italic.brightBlack ; }
		}
		
		if ( options.html )
		{
			if ( options.htmlTab === undefined ) { options.htmlTab = '&nbsp;&nbsp;&nbsp;&nbsp;' ; }
		}
		
		if ( options.depth === undefined ) { options.depth = 3 ; }
	}
	
	type = typeof variable ;
	
	
	nextIndent = runtime.indent + ( ! options.html ? "\t" : options.htmlTab ) ;
	nextIndent2 = nextIndent + ( ! options.html ? "\t" : options.htmlTab ) ;
	
	
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
				'.<i style="color:green;">' + runtime.key + ( descriptorStr ? '<span style="color:gray;">' + descriptorStr + '</span>' : '' ) + '</i> : ' :
				'[<i style="color:blue;">' + runtime.key + '</i>] : ' ;
		}
		else if ( options.color )
		{
			key = runtime.keyIsProperty ?
				'.' + sterm.green( runtime.key ) + ( descriptorStr ? options.colorType( descriptorStr ) : '' ) + ' : ' :
				'[' + sterm.blue( runtime.key ) + '] : ' ;
		}
		else
		{
			key = runtime.keyIsProperty ?
				"." + runtime.key + ( descriptorStr ? descriptorStr : '' ) + " : " :
				'[' + runtime.key + '] : ' ;
		}
	}
	
	
	pre = runtime.indent + key ;
	
	
	if ( variable === undefined )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">undefined</i><br />' ; }
		else if ( options.color ) { str += pre + options.colorType( "undefined\n" ) ; }
		else { str += pre + "<undefined>\n" ; }
	}
	else if ( variable === null )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">null</i><br />' ; }
		else if ( options.color ) { str += pre + options.colorType( "null\n" ) ; }
		else { str += pre + "<null>\n" ; }
	}
	else if ( variable === false )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">false</i><br />' ; }
		else if ( options.color ) { str += pre + options.colorType( "false\n" ) ; }
		else { str += pre + "<false>\n" ; }
	}
	else if ( variable === true )
	{
		if ( options.html ) { str += pre + '<i style="color:gray;">true</i><br />' ; }
		else if ( options.color ) { str += pre + options.colorType( "true\n" ) ; }
		else { str += pre + "<true>\n" ; }
	}
	else if ( type === 'number' )
	{
		if ( options.html ) { str += pre + '<i style="color:blue;">' + variable.toString() + '</i> <i style="color:gray;">number</i><br />' ; }
		else if ( options.color ) { str += pre + sterm.blue( variable.toString() ) + options.colorType( " number\n" ) ; }
		else { str += pre + variable.toString() + " <number>\n" ; }
	}
	else if ( type === 'string' )
	{
		if ( options.html )
		{
			str += pre + '"<i style="color:cyan;">' +
				// escape( 'html_content' , variable ) +    // need to backport this later
				variable +
				'</i>" <i style="color:gray;">string</i><br />' ;
		}
		else
		{
			// \r mess up things in linux CLI, turn them into literal
			variable = variable.replace( "\r" , "\\r" ) ;
			if ( options.color ) { str += pre + '"' + sterm.blue( variable ) + '" ' + options.colorType( "string\n" ) ; }
			else { str += pre + '"' + variable + '" <string>\n' ; }
		}
	}
	else if ( type === 'function' )
	{
		var funcName = variable.name ? variable.name : '<anonymous>' ;
		
		if ( options.html ) { str += pre + '<i style="color:gray;">' + funcName + " function (" + variable.length + ")</i>" + ( ! options.skipPrototype ? "<br />" + runtime.indent + " --> prototype [<br />\n" : "\n" ) ; }
		else if ( options.color ) { str += pre + sterm.magenta( funcName ) + options.colorType( " function (" + variable.length + ")" ) + ( ! options.skipPrototype ? "\n" + runtime.indent + " --> prototype [\n" : "\n" ) ; }
		else { str += pre + "<" + funcName + " function> (" + variable.length + ")" + ( ! options.skipPrototype ? "\n" + runtime.indent + " --> prototype [\n" : "\n" ) ; }
		
		if ( ! options.skipPrototype )
		{
			var propertyList = options.all ? Object.getOwnPropertyNames( variable.prototype ) : Object.keys( variable.prototype ) ;
			
			for ( var i = 0 ; i < propertyList.length ; i ++ )
			{
				str += inspect(
					{ indent: nextIndent , key: propertyList[ i ] , keyIsProperty: true } ,
					tree.extend( null , {} , options , { skipPrototype: true , all: true } ) ,
					variable.prototype[ propertyList[ i ] ]
				) ;
			}
			
			if ( options.html ) { str += runtime.indent + "]<br />" ; }
			else { str += runtime.indent + "]\n" ; }
		}
	}
	else if ( type === 'object' )
	{
		if ( Array.isArray( variable ) )
		{
			if ( options.html ) { str += pre + '<i style="color:gray;">array</i><br />' + runtime.indent + "{<br />" ; }
			else if ( options.color ) { str += pre + options.colorType( + "array" ) + "\n" + runtime.indent + "{\n" ; }
			else { str += pre + "<array>\n" + runtime.indent + "{\n" ; }
			
			var propertyList = Object.keys( variable ) ;
			
			for ( var i = 0 ; i < propertyList.length ; i ++ )
			{
				str += inspect(
					{ indent: nextIndent , key: propertyList[ i ] , keyIsProperty: false } ,
					options ,
					variable[ propertyList[ i ] ]
				) ;
			}
			
			if ( options.html ) { str += runtime.indent + "}<br />" ; }
			else { str += runtime.indent + "}\n" ; }
		}
		else
		{
			var constructor = variable.constructor.name ? variable.constructor.name : '<constructorless>' ;
			
			if ( options.html ) { str += pre + '<i style="color:gray;">' + constructor + " object</i><br />" + runtime.indent + "{<br />" ; }
			else if ( options.color ) { str += pre + sterm.magenta( constructor ) + options.colorType( " object" ) + "\n" + runtime.indent + "{\n" ; }
			else { str += pre + "<" + constructor + " object>\n" + runtime.indent + "{\n" ; }
			
			var propertyList = Object.getOwnPropertyNames( variable ) ;
			
			for ( var i = 0 ; i < propertyList.length ; i ++ )
			{
				descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
				
				if ( descriptor.get || descriptor.set )
				{
					str += inspect( {
							indent: nextIndent ,
							key: propertyList[ i ] ,
							keyIsProperty: true ,
							descriptor: descriptor
						} ,
						options ,
						{ get: descriptor.get , set: descriptor.set }
					) ;
				}
				else
				{
					str += inspect( {
							indent: nextIndent ,
							key: propertyList[ i ] ,
							keyIsProperty: true ,
							descriptor: descriptor
						} ,
						options ,
						variable[ propertyList[ i ] ]
					) ;
				}
			}
			
			
			if ( options.html ) { str += runtime.indent + "}<br />" ; }
			else { str += runtime.indent + "}\n" ; }
		}
	}
	
	return str ;
} ;



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

