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





			/* Escape collection */



string.escape = {} ;

// From Mozilla Developper Network
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
string.escape.regExp = string.escape.regExpPattern = function escapeRegExpPattern( str ) {
	return str.replace( /([.*+?^${}()|\[\]\/\\])/g , '\\$1' ) ;
} ;

string.escape.regExpReplacement = function escapeRegExpReplacement( str ) {
	return str.replace( /\$/g , '$$$$' ) ;
} ;



string.escape.shellArg = function escapeShellArg( str ) {
	return '\'' + str.replace( /\'/g , "'\\''" ) + '\'' ;
} ;



var escapeControlMap = { '\r': '\\r', '\n': '\\n', '\t': '\\t', '\x7f': '\\x7f' } ;

// Escape \r \n \t so they become readable again
string.escape.control = function escapeControl( str ) {
	return str.replace( /\r|\n|\t|[\x00-\x1f\x7f]/g , function( match ) {
		if ( escapeControlMap[ match ] !== undefined ) { return escapeControlMap[ match ] ; }
		var hex = match.charCodeAt( 0 ).toString( 16 ) ;
		if ( hex.length % 2 ) { hex = '0' + hex ; }
		return '\\x' + hex ;
	} ) ;
} ;



var escapeHtmlMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' } ;

// Only escape & < > so this is suited for content outside tags
string.escape.html = function escapeHtml( str ) {
	return str.replace( /[&<>]/g , function( match ) { return escapeHtmlMap[ match ] ; } ) ;
} ;

// Escape & < > " so this is suited for content inside a double-quoted attribute
string.escape.htmlAttr = function escapeHtmlAttr( str ) {
	return str.replace( /[&<>"]/g , function( match ) { return escapeHtmlMap[ match ] ; } ) ;
} ;

// Escape all html special characters & < > " '
string.escape.htmlSpecialChars = function escapeHtmlSpecialChars( str ) {
	return str.replace( /[&<>"']/g , function( match ) { return escapeHtmlMap[ match ] ; } ) ;
} ;





/*
	Inspect a variable, return a string ready to be displayed with console.log(), or even as an HTML output.
	
	Options:
		* style:
			* 'none': (default) normal output suitable for console.log() or writing in a file
			* 'color': colorful output suitable for terminal
			* 'html': html output
		* depth: depth limit, default: 3
		* nofunc: do not display functions
		* funcDetails: display function's details
		* proto: display object's prototype
		* useInspect? use .inspect() methode when available on an object
*/

function inspect( runtime , options , variable )
{
	var i , funcName , length , propertyList , constructor , keyIsProperty ,
		type , pre , nextIndent , nextIndent2 , isArray , isFunc ,
		str = '' , key = '' , descriptorStr = '' , descriptor ;
	
	
	// Things applied only for the first call, not for recursive call
	
	if ( ! runtime )
	{
		if ( arguments.length < 3 ) { variable = options ; options = {} ; }
		else if ( ! options || typeof options !== 'object' ) { options = {} ; }
		
		runtime = { depth: 0 , indent: '' , ancestors: [] } ;
		
		if ( ! options.style ) { options.style = inspectStyle.none ; }
		else if ( typeof options.style === 'string' ) { options.style = inspectStyle[ options.style ] ; }
		
		if ( options.depth === undefined ) { options.depth = 3 ; }
	}
	
	
	// Prepare things (indentation, key, descriptor, ... )
	
	type = typeof variable ;
	nextIndent = runtime.indent + options.style.tab ;
	nextIndent2 = nextIndent + options.style.tab ;
	
	if ( type === 'function' && options.nofunc ) { return '' ; }
	
	if ( runtime.key !== undefined )
	{
		if ( runtime.descriptor )
		{
			descriptorStr = [] ;
			
			if ( ! runtime.descriptor.configurable ) { descriptorStr.push( '-conf' ) ; }
			if ( ! runtime.descriptor.enumerable ) { descriptorStr.push( '-enum' ) ; }
			
			// Already displayed by runtime.forceType
			//if ( runtime.descriptor.get || runtime.descriptor.set ) { descriptorStr.push( 'getter/setter' ) ; } else
			if ( ! runtime.descriptor.writable ) { descriptorStr.push( '-w' ) ; }
			
			//if ( descriptorStr.length ) { descriptorStr = '(' + descriptorStr.join( ' ' ) + ')' ; }
			if ( descriptorStr.length ) { descriptorStr = descriptorStr.join( ' ' ) ; }
			else { descriptorStr = '' ; }
		}
		
		key = runtime.keyIsProperty ?
			options.style.key( runtime.key ) + ': ' :
			'[' + options.style.index( runtime.key ) + '] ' ;
		
		if ( descriptorStr ) { descriptorStr = ' ' + options.style.type( descriptorStr ) ; }
	}
	
	pre = runtime.indent + key ;
	
	
	// Describe the current variable
	
	if ( variable === undefined )
	{
		str += pre + options.style.constant( 'undefined' ) + descriptorStr + options.style.nl ;
	}
	else if ( variable === null )
	{
		str += pre + options.style.constant( 'null' ) + descriptorStr + options.style.nl ;
	}
	else if ( variable === false )
	{
		str += pre + options.style.constant( 'false' ) + descriptorStr + options.style.nl ;
	}
	else if ( variable === true )
	{
		str += pre + options.style.constant( 'true' ) + descriptorStr + options.style.nl ;
	}
	else if ( type === 'number' )
	{
		str += pre + options.style.number( variable.toString() ) + ' ' + options.style.type( 'number' ) + descriptorStr + options.style.nl ;
	}
	else if ( type === 'string' )
	{
		str += pre + '"' + options.style.string( string.escape.control( variable ) ) + '" ' +
			options.style.type( 'string' ) + options.style.length( '(' + variable.length + ')' ) + descriptorStr + options.style.nl ;
	}
	else if ( Buffer.isBuffer( variable ) )
	{
		str += pre + options.style.inspect( variable.inspect() ) + ' ' +
			options.style.type( 'Buffer' ) + options.style.length( '(' + variable.length + ')' ) + descriptorStr + options.style.nl ;
	}
	else if ( type === 'object' || type === 'function' )
	{
		funcName = length = '' ;
		
		isFunc = false ;
		if ( type === 'function' )
		{
			isFunc = true ;
			funcName = ' ' + options.style.funcName( ( variable.name ? variable.name : '(anonymous)' ) ) ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}
		
		isArray = false ;
		if ( Array.isArray( variable ) )
		{
			isArray = true ;
			length = options.style.length( '(' + variable.length + ')' ) ;
		}
		
		if ( ! variable.constructor ) { constructor = '(no constructor)' ; }
		else if ( ! variable.constructor.name ) { constructor = '(anonymous)' ; }
		else { constructor = variable.constructor.name ; }
		
		constructor = options.style.constructorName( constructor ) ;
		
		if ( runtime.forceType ) { str += pre + options.style.type( runtime.forceType ) ; }
		else { str += pre + constructor + funcName + length + ' ' + options.style.type( type ) + descriptorStr ; }
		
		propertyList = Object.getOwnPropertyNames( variable ) ;
		
		if ( isFunc && ! options.funcDetails )
		{
			str += options.style.nl ;
		}
		else if ( ! propertyList.length )
		{
			str += ' {}' + options.style.nl ;
		}
		else if ( runtime.depth >= options.depth )
		{
			str += ' ' + options.style.limit( '[depth limit]' ) + options.style.nl ;
		}
		else if ( runtime.ancestors.indexOf( variable ) !== -1 )
		{
			str += ' ' + options.style.limit( '[circular]' ) + options.style.nl ;
		}
		else
		{
			str += ' {' + options.style.nl ;
			
			for ( i = 0 ; i < propertyList.length ; i ++ )
			{
				descriptor = Object.getOwnPropertyDescriptor( variable , propertyList[ i ] ) ;
				
				keyIsProperty = ! isArray || ! descriptor.enumerable || isNaN( propertyList[ i ] ) ;
				
				if ( descriptor.get || descriptor.set )
				{
					str += inspect( {
							depth: runtime.depth + 1 ,
							ancestors: runtime.ancestors.concat( variable ) ,
							indent: nextIndent ,
							key: propertyList[ i ] ,
							keyIsProperty: keyIsProperty ,
							descriptor: descriptor ,
							forceType: 'getter/setter'
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
			
			if ( options.proto )
			{
				str += inspect( {
						depth: runtime.depth + 1 ,
						ancestors: runtime.ancestors.concat( variable ) ,
						indent: nextIndent ,
						key: '__proto__' ,
						keyIsProperty: true
					} ,
					options ,
					variable.__proto__	// jshint ignore:line
				) ;
			}
			
			str += runtime.indent + '}' + options.style.nl ;
		}
	}
	
	
	// Finalizing
	
	if ( runtime.depth === 0 )
	{
		if ( options.style === 'html' ) { str = string.escape.html( str ) ; }
	}
	
	return str ;
}

string.inspect = inspect.bind( undefined , null ) ;



// Inspect's styles

var inspectStyle = {} ;

var inspectStyleNoop = function( str ) { return str ; } ;

inspectStyle.none = {
	tab: '    ' ,
	nl: '\n' ,
	limit: inspectStyleNoop ,
	type: function( str ) { return '<' + str + '>' ; } ,
	constant: inspectStyleNoop ,
	funcName: inspectStyleNoop ,
	constructorName: function( str ) { return '<' + str + '>' ; } ,
	length: inspectStyleNoop ,
	key: inspectStyleNoop ,
	index: inspectStyleNoop ,
	number: inspectStyleNoop ,
	inspect: inspectStyleNoop ,
	string: inspectStyleNoop
} ;

inspectStyle.color = tree.extend( null , {} , inspectStyle.none , {
	limit: term.str.bold.brightRed ,
	type: term.str.italic.brightBlack ,
	constant: term.str.cyan ,
	funcName: term.str.italic.magenta ,
	constructorName: term.str.magenta ,
	length: term.str.italic.brightBlack ,
	key: term.str.green ,
	index: term.str.blue ,
	number: term.str.cyan ,
	inspect: term.str.cyan ,
	string: term.str.blue
} ) ;

inspectStyle.html = tree.extend( null , {} , inspectStyle.none , {
	tab: '&nbsp;&nbsp;&nbsp;&nbsp;' ,
	nl: '<br />' ,
	limit: function( str ) { return '<span style="color:red">' + str + '</span>' ; } ,
	type: function( str ) { return '<i style="color:gray">' + str + '</i>' ; } ,
	constant: function( str ) { return '<span style="color:cyan">' + str + '</span>' ; } ,
	funcName: function( str ) { return '<i style="color:magenta">' + str + '</i>' ; } ,
	constructorName: function( str ) { return '<span style="color:magenta">' + str + '</span>' ; } ,
	length: function( str ) { return '<i style="color:gray">' + str + '</i>' ; } ,
	key: function( str ) { return '<span style="color:green">' + str + '</span>' ; } ,
	index: function( str ) { return '<span style="color:blue">' + str + '</span>' ; } ,
	number: function( str ) { return '<span style="color:cyan">' + str + '</span>' ; } ,
	inspect: function( str ) { return '<span style="color:cyan">' + str + '</span>' ; } ,
	string: function( str ) { return '<span style="color:blue">' + str + '</span>' ; }
} ) ;







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

