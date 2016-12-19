

# String Kit

A string manipulation toolbox, featuring a string formatter (inspired by sprintf), a variable inspector
(output featuring ANSI colors and HTML) and various escape functions (shell argument, regexp, html, etc).

* License: MIT
* Current status: beta
* Platform: Node.js only (browser support is planned)



# Install

Use Node Package Manager:

    npm install string-kit



# Reference

* [.format()](#ref.format)
* [.format.count()](#ref.format.count)
* [.inspect()](#ref.inspect)
* Escape functions collection
	* [.escape.shellArg()](#ref.escape.shellArg)
	* [.escape.regExp()](#ref.escape.regExp)
	* [.escape.regExpPattern()](#ref.escape.regExp)
	* [.escape.regExpReplacement()](#ref.escape.regExpReplacement)
	* [.escape.html()](#ref.escape.html)
	* [.escape.htmlAttr()](#ref.escape.htmlAttr)
	* [.escape.htmlSpecialChars()](#ref.escape.htmlSpecialChars)
	* [.escape.control()](#ref.escape.control)



<a name="ref.format"></a>
### .format( formatString , ... )

* formatString `String` a string containing some `sprintf()`-like formating
* ... `mixed` a variable list of arguments to insert into the formatString

This function is inspired by the `C`'s `sprintf()` function.

Basicly, if `formatString` includes *format specifiers* (subsequences beginning with %), the additional arguments
following `formatString` are formatted and inserted in the resulting string replacing their respective specifiers.

Also it diverges from `C` in quite a few places.

**New:** Since *v0.3.x* we can add styles markup (color, bold, italic, and so on...) using the `^` caret.
See [the format markup documentation](#ref.format.markup).

Basic usage:
```js
var format = require( 'string-kit' ).format ;
console.log( format( 'Hello %s %s, how are you?' , 'Joe' , 'Doe' ) ) ;
// Output: 'Hello Joe Doe, how are you?'
```

Specifiers:
* `%%` write a single %
* `%s` string
* `%f` float
* `%d` *or* %i integer
* `%u` unsigned integer
* `%U` unsigned positive integer (>0)
* `%h` unsigned hexadecimal
* `%x` unsigned hexadecimal, force pair of symbols (e.g. 'f' -> '0f')
* `%o` unsigned octal
* `%b` unsigned binary
* `%I` call string-kit's inspect()
* `%Y` call string-kit's inspect(), but do not inspect non-enumerable
* `%E` call string-kit's inspectError()
* `%J` JSON.stringify()
* `%D` drop, the argument does not produce anything but is eaten anyway
* `%F` filter function existing in the *this* context, e.g. %[filter:%a%a]F
* `%a` argument for a filter function

Few examples:
```js
var format = require( 'string-kit' ).format ;

console.log( format( 'This company regains %d%% of market share.' , 36 ) ) ;
// Output: 'This company regains 36% of market share.'

console.log( format( '11/8=%f' , 11/8 ) ) ;
// Output: '11/8=1.375'

console.log( format( 'Hexa %h %x' , 11 , 11 ) ) ;
// Output: 'Hexa b 0b'
```

We can insert a number between the *%* sign and the letter of the specifier, this way, rather than using the next
argument, it uses the *Nth* argument, this is the absolute position:
```js
console.log( format( '%2s%1s%3s' , 'A' , 'B' , 'C' ) ) ; // 'BAC'
```

Also, the internal pointer is moved anyway, so the *Nth* format specifier still use the *Nth* argument if it doesn't
specify any position:
```js
console.log( format( '%2s%s%s' , 'A' , 'B' , 'C' ) ) ; // 'BBC'
```

If the number is preceded by a *plus* or a *minus* sign, the relative position is used rather than the absolute position.
```js
console.log( format( '%+1s%-1s%s' , 'A' , 'B' , 'C' ) ) ; // 'BAC'
```

Use case: language.
```js
var hello = {
	en: 'Hello %s %s!' ,
	jp: 'Konnichiwa %2s %1s!'
} ;

console.log( format( hello[ lang ] , firstName , lastName ) ) ;
// Output the appropriate greeting in a language.
// In japanese the last name will come before the first name,
// but the argument list doesn't need to be changed.
```

The mysterious `%[]F` format specifier is used when we want custom formatter.
Firstly we need to build an object containing one or many functions.
Then, `format()` should be used with `call()`, to pass the functions collection as the *this* context.

The `%[` is followed by the function's name, followed by a `:`, followed by a variable list of arguments using `%a`.
It is still possible to use relative and absolute positionning.
The whole *format specifier* is finished when a `]F` is encountered.

Example:
```js
var filters = {
	fxy: function( a , b ) { return '' + ( a * a + b ) ; }
} ;

console.log( format.call( filters , '%s%[fxy:%a%a]F' , 'f(x,y)=' , 5 , 3 ) ) ;
// Output: 'f(x,y)=28'

console.log( format.call( filters , '%s%[fxy:%+1a%-1a]F' , 'f(x,y)=' , 5 , 3 ) ) ;
// Output: 'f(x,y)=14'
```

<a name="ref.format.markup"></a>
##### Style markup reference

Since *v0.3.x* we can add styles (color, bold, italic, and so on...) using the `^` caret:
```js
var format = require( 'string-kit' ).format ;
console.log( format( 'This is ^rred^ and ^bblue^:!' , 'Joe' , 'Doe' ) ) ;
// Output: 'This is red and blue!' with 'red' written in red and 'blue' written in blue.
```

Style markup:
* `^^` write a single caret `^`
* `^b` switch to blue
* `^B` switch to bright blue
* `^c` switch to cyan
* `^C` switch to bright cyan
* `^g` switch to green
* `^G` switch to bright green
* `^k` switch to black
* `^K` switch to bright black
* `^m` switch to magenta
* `^M` switch to bright magenta
* `^r` switch to red
* `^R` switch to bright red
* `^w` switch to white
* `^W` switch to bright white
* `^y` switch to yellow (i.e. brown or orange)
* `^Y` switch to bright yellow (i.e. yellow)
* `^_` switch to underline
* `^/` switch to italic
* `^!` switch to inverse (inverse background and foreground color)
* `^+` switch to bold
* `^-` switch to dim
* `^:` reset the style
* `^ ` (caret followed by a space) reset the style and write a single space

**Note:** as soon as the format string has **one** style markup, a style reset will be added at the end of the string.



<a name="ref.format.count"></a>
### .format.count( formatString )

* formatString `String` a string containing some `sprintf()`-like formating

It just counts the number of *format specifier* in the `formatString`.



<a name="ref.inspect"></a>
### .inspect( [options] , variable )

* options `Object` display options, the following key are possible:
	* style `String` this is the style to use, the value can be:
		* 'none': (default) normal output suitable for console.log() or writing into a file
		* 'color': colorful output suitable for terminal
		* 'html': html output
	* depth: depth limit, default: 3
	* noFunc: do not display functions
	* noDescriptor: do not display descriptor information
	* noType: do not display type and constructor
	* enumOnly: only display enumerable properties
	* funcDetails: display function's details
	* proto: display object's prototype
	* sort: sort the keys
	* minimal: imply noFunc: true, noDescriptor: true, noType: true, enumOnly: true, proto: false and funcDetails: false.
	  Display a minimal JSON-like output.
* variable `mixed` anything we want to inspect/debug

It inspect a variable, and return a string ready to be displayed with console.log(), or even as HTML output.

It produces a slightly better output than node's `util.inspect()`, with more options to control what should be displayed.

Since `options` come first, it is possible to use `bind()` to create some custom variable inspector.

For example:
```js
var colorInspect = require( 'string-kit' ).inspect.bind( undefined , { style: 'color' } ) ;
```



## Escape functions collection



<a name="ref.escape.shellArg"></a>
### .escape.shellArg( str )

* str `String` the string to filter

It escapes the string so that it will be suitable as a shell command's argument.



<a name="ref.escape.regExp"></a>
### .escape.regExp( str ) , .escape.regExpPattern( str ) 

* str `String` the string to filter

It escapes the string so that it will be suitable to inject it in a regular expression's pattern as a literal string.

Example of a search and replace from a user's input:
```js
var result = data.replace(
	new RegExp( stringKit.escape.regExp( userInputSearch ) , 'g' ) ,
	stringKit.escape.regExpReplacement( userInputReplace )
) ;
```



<a name="ref.escape.regExpReplacement"></a>
### .escape.regExpReplacement( str )

* str `String` the string to filter

It escapes the string so that it will be suitable as a literal string for a regular expression's replacement.



<a name="ref.escape.html"></a>
### .escape.html( str )

* str `String` the string to filter

It escapes the string so that it will be suitable as HTML content.

Only  `< > &` are replaced by HTML entities.



<a name="ref.escape.htmlAttr"></a>
### .escape.htmlAttr( str )

* str `String` the string to filter

It escapes the string so that it will be suitable as an HTML tag attribute's value.

Only  `< > & "` are replaced by HTML entities.

It assumes valid HTML: the attribute's value should be into double quote, not in single quote.



<a name="ref.escape.htmlSpecialChars"></a>
### .escape.htmlSpecialChars( str )

* str `String` the string to filter

It escapes all HTML special characters, `< > & " '` are replaced by HTML entities.



<a name="ref.escape.control"></a>
### .escape.control( str )

* str `String` the string to filter

It escapes all ASCII control characters (code lesser than or equals to 0x1F, or *backspace*).

*Carriage return*, *newline* and *tabulation* are respectively replaced by `\r`, `\n` and `\t`.
Other characters are replaced by the unicode notation, e.g. `NUL` is replaced by `\x00`.





Full BDD spec generated by Mocha:


# TOC
   - [format()](#format)
   - [Escape collection](#escape-collection)
   - [Camel case](#camel-case)
   - [Latinize](#latinize)
   - [inspect()](#inspect)
   - [Misc](#misc)
   - [Unicode](#unicode)
<a name=""></a>
 
<a name="format"></a>
# format()
should perform basic examples.

```js
expect( format( 'Hello world' ) ).to.be( 'Hello world' ) ;
expect( format( 'Hello %s' , 'world' ) ).to.be( 'Hello world' ) ;
expect( format( 'Hello %s %s, how are you?' , 'Joe' , 'Doe' ) ).to.be( 'Hello Joe Doe, how are you?' ) ;
expect( format( 'I have %i cookies.' , 3 ) ).to.be( 'I have 3 cookies.' ) ;
expect( format( 'This company regains %d%% of market share.' , 36 ) ).to.be( 'This company regains 36% of market share.' ) ;
expect( format( '11/8=%f' , 11/8 ) ).to.be( '11/8=1.375' ) ;
expect( format( 'Binary %b %b' , 11 , 123 ) ).to.be( 'Binary 1011 1111011' ) ;
expect( format( 'Octal %o %o' , 11 , 123 ) ).to.be( 'Octal 13 173' ) ;
expect( format( 'Hexa %h %x %x' , 11 , 11 , 123 ) ).to.be( 'Hexa b 0b 7b' ) ;
expect( format( 'JSON %J' , {hello:'world',here:'is',my:{wonderful:'object'}} ) ).to.be( 'JSON {"hello":"world","here":"is","my":{"wonderful":"object"}}' ) ;
expect( format( 'Inspect %I' , {hello:'world',here:'is',my:{wonderful:'object'}} ) ).to.be( 'Inspect <Object> <object> {\n    hello: "world" <string>(5)\n    here: "is" <string>(2)\n    my: <Object> <object> {\n        wonderful: "object" <string>(6)\n    }\n}\n' ) ;
//expect( format( 'Inspect %E' , new Error( 'Some error' ) ) ).to.be( '' ) ;
```

%u should format unsigned integer.

```js
expect( format( '%u' , 123 ) ).to.be( '123' ) ;
expect( format( '%u' , 0 ) ).to.be( '0' ) ;
expect( format( '%u' , -123 ) ).to.be( '0' ) ;
expect( format( '%u' ) ).to.be( '0' ) ;
```

%U should format *positive* unsigned integer.

```js
expect( format( '%U' , 123 ) ).to.be( '123' ) ;
expect( format( '%U' , 0 ) ).to.be( '1' ) ;
expect( format( '%U' , -123 ) ).to.be( '1' ) ;
expect( format( '%U' ) ).to.be( '1' ) ;
```

should perform well the argument's index feature.

```js
expect( format( '%s%s%s' , 'A' , 'B' , 'C' ) ).to.be( 'ABC' ) ;
expect( format( '%+1s%-1s%s' , 'A' , 'B' , 'C' ) ).to.be( 'BAC' ) ;
expect( format( '%3s%s' , 'A' , 'B' , 'C' ) ).to.be( 'CBC' ) ;
```

should perform well the mode arguments feature.

```js
expect( format( '%[f0]f' , 1/3 ) ).to.be( '0' ) ;
expect( format( '%[f1]f' , 1/3 ) ).to.be( '0.3' ) ;
expect( format( '%[f2]f' , 1/3 ) ).to.be( '0.33' ) ;

expect( format( '%[f0]f' , 0.1 ) ).to.be( '0' ) ;
expect( format( '%[f1]f' , 0.1 ) ).to.be( '0.1' ) ;
expect( format( '%[f2]f' , 0.1 ) ).to.be( '0.10' ) ;

/*	p is not finished yet
expect( format( '%[p1]f' , 123 ) ).to.be( '10000' ) ;
expect( format( '%[p2]f' , 123 ) ).to.be( '12000' ) ;

expect( format( '%[p1]f' , 1/3 ) ).to.be( '0.3' ) ;
expect( format( '%[p2]f' , 1/3 ) ).to.be( '0.33' ) ;

expect( format( '%[p1]f' , 0.1 ) ).to.be( '0.1' ) ;
expect( format( '%[p2]f' , 0.1 ) ).to.be( '0.10' ) ;
*/
```

format.count() should count the number of arguments found.

```js
expect( format.count( 'blah blih blah' ) ).to.be( 0 ) ;
expect( format.count( 'blah blih %% blah' ) ).to.be( 0 ) ;
expect( format.count( '%i %s' ) ).to.be( 2 ) ;
expect( format.count( '%1i %1s' ) ).to.be( 1 ) ;
expect( format.count( '%5i' ) ).to.be( 5 ) ;
expect( format.count( '%[unexistant]F' ) ).to.be( 0 ) ;
expect( format.count( '%[unexistant:%a%a]F' ) ).to.be( 2 ) ;
```

format.hasFormatting() should return true if the string has formatting and thus need to be interpreted, or false otherwise.

```js
expect( format.hasFormatting( 'blah blih blah' ) ).to.be( false ) ;
expect( format.hasFormatting( 'blah blih %% blah' ) ).to.be( true ) ;
expect( format.hasFormatting( '%i %s' ) ).to.be( true ) ;
expect( format.hasFormatting( '%[unexistant]F' ) ).to.be( true ) ;
expect( format.hasFormatting( '%[unexistant:%a%a]F' ) ).to.be( true ) ;
```

when using a filter object as the *this* context, the %[functionName]F format should use a custom function to format the input.

```js
var formatter = {
	format: formatMethod ,
	fn: {
		fixed: function() { return 'f' ; } ,
		double: function( str ) { return '' + str + str ; } ,
		fxy: function( a , b ) { return '' + ( a * a + b ) ; }
	}
} ;

expect( formatter.format( '%[fixed]F' ) ).to.be( 'f' ) ;
expect( formatter.format( '%[fixed]F%s%s%s' , 'A' , 'B' , 'C' ) ).to.be( 'fABC' ) ;
expect( formatter.format( '%s%[fxy:%a%a]F' , 'f(x,y)=' , 5 , 3 ) ).to.be( 'f(x,y)=28' ) ;
expect( formatter.format( '%s%[fxy:%+1a%-1a]F' , 'f(x,y)=' , 5 , 3 ) ).to.be( 'f(x,y)=14' ) ;
expect( formatter.format( '%[unexistant]F' ) ).to.be( '' ) ;
```

'^' should add markup, defaulting to ansi markup.

```js
expect( format( 'this is ^^ a caret' ) ).to.be( 'this is ^ a caret' ) ;
expect( format( 'this is ^_underlined^: this is not' ) )
	.to.be( 'this is ' + ansi.underline + 'underlined' + ansi.reset + ' this is not' + ansi.reset ) ;
expect( format( 'this is ^_underlined^ this is not' ) )
	.to.be( 'this is ' + ansi.underline + 'underlined' + ansi.reset + ' this is not' + ansi.reset ) ;
expect( format( 'this is ^_underlined^:this is not' ) )
	.to.be( 'this is ' + ansi.underline + 'underlined' + ansi.reset + 'this is not' + ansi.reset ) ;
expect( format( 'this is ^Bblue^: this is not' ) )
	.to.be( 'this is ' + ansi.brightBlue + 'blue' + ansi.reset + ' this is not' + ansi.reset ) ;
expect( format( 'this is ^Bblue^ this is not' ) )
	.to.be( 'this is ' + ansi.brightBlue + 'blue' + ansi.reset + ' this is not' + ansi.reset ) ;
```

should expose a stand-alone markup only method.

```js
expect( string.markup( 'this is ^^ a caret' ) ).to.be( 'this is ^ a caret' ) ;
expect( string.markup( 'this is ^_underlined^: this is not' ) )
	.to.be( 'this is ' + ansi.underline + 'underlined' + ansi.reset + ' this is not' + ansi.reset ) ;
expect( string.markup( 'this is ^_underlined^ this is not' ) )
	.to.be( 'this is ' + ansi.underline + 'underlined' + ansi.reset + ' this is not' + ansi.reset ) ;
expect( string.markup( 'this is ^_underlined^:this is not' ) )
	.to.be( 'this is ' + ansi.underline + 'underlined' + ansi.reset + 'this is not' + ansi.reset ) ;
expect( string.markup( 'this is ^Bblue^: this is not' ) )
	.to.be( 'this is ' + ansi.brightBlue + 'blue' + ansi.reset + ' this is not' + ansi.reset ) ;
expect( string.markup( 'this is ^Bblue^ this is not' ) )
	.to.be( 'this is ' + ansi.brightBlue + 'blue' + ansi.reset + ' this is not' + ansi.reset ) ;

// format syntax should be ignored
expect( string.markup( 'this is ^Bblue^ this is not %d' , 5 ) )
	.to.be( 'this is ' + ansi.brightBlue + 'blue' + ansi.reset + ' this is not %d' + ansi.reset ) ;
```

should expose a stand-alone markup only method.

```js
var wwwFormatter = {
	endingMarkupReset: true ,
	markupReset: function( markupStack ) {
		var str = '</span>'.repeat( markupStack.length ) ;
		markupStack.length = 0 ;
		return str ;
	} ,
	markup: {
		":": function( markupStack ) {
			var str = '</span>'.repeat( markupStack.length ) ;
			markupStack.length = 0 ;
			return str ;
		} ,
		" ": function( markupStack ) {
			var str = '</span>'.repeat( markupStack.length ) ;
			markupStack.length = 0 ;
			return str + ' ' ;
		} ,
		
		"+": '<span style="font-weight:bold">' ,
		"b": '<span style="color:blue">'
	}
} ;

var markup = string.markupMethod.bind( wwwFormatter ) ;
var format = string.formatMethod.bind( wwwFormatter ) ;

expect( markup( 'this is ^^ a caret' ) ).to.be( 'this is ^ a caret' ) ;
expect( markup( 'this is ^+bold^: this is not' ) )
	.to.be( 'this is <span style="font-weight:bold">bold</span> this is not' ) ;
expect( markup( 'this is ^+bold^ this is not' ) )
	.to.be( 'this is <span style="font-weight:bold">bold</span> this is not' ) ;
expect( markup( 'this is ^+bold^:this is not' ) )
	.to.be( 'this is <span style="font-weight:bold">bold</span>this is not' ) ;
expect( markup( 'this is ^b^+blue bold' ) )
	.to.be( 'this is <span style="color:blue"><span style="font-weight:bold">blue bold</span></span>' ) ;

expect( format( 'this is ^b^+blue bold' ) )
	.to.be( 'this is <span style="color:blue"><span style="font-weight:bold">blue bold</span></span>' ) ;
```

<a name="escape-collection"></a>
# Escape collection
escape.control() should escape control characters.

```js
expect( string.escape.control( 'Hello\n\t... world!' ) ).to.be( 'Hello\\n\\t... world!' ) ;
expect( string.escape.control( 'Hello\\n\\t... world!' ) ).to.be( 'Hello\\n\\t... world!' ) ;
expect( string.escape.control( 'Hello\\\n\\\t... world!' ) ).to.be( 'Hello\\\\n\\\\t... world!' ) ;
expect( string.escape.control( 'Hello\\\\n\\\\t... world!' ) ).to.be( 'Hello\\\\n\\\\t... world!' ) ;

expect( string.escape.control( 'Nasty\x00chars\x1bhere\x7f!' ) ).to.be( 'Nasty\\x00chars\\x1bhere\\x7f!' ) ;
```

escape.shellArg() should escape a string so that it will be suitable as a shell command's argument.

```js
//console.log( 'Shell arg:' , string.escape.shellArg( "Here's my shell's argument" ) ) ;
expect( string.escape.shellArg( "Here's my shell's argument" ) ).to.be( "'Here'\\''s my shell'\\''s argument'" ) ;
```

escape.jsSingleQuote() should escape a string so that it will be suitable as a JS string code.

```js
expect( string.escape.jsSingleQuote( "A string with 'single' quotes" ) ).to.be( "A string with \\'single\\' quotes" ) ;
expect( string.escape.jsSingleQuote( "A string with 'single' quotes\nand new\nlines" ) ).to.be( "A string with \\'single\\' quotes\\nand new\\nlines" ) ;
```

escape.jsDoubleQuote() should escape a string so that it will be suitable as a JS string code.

```js
expect( string.escape.jsDoubleQuote( 'A string with "double" quotes' ) ).to.be( 'A string with \\"double\\" quotes' ) ;
expect( string.escape.jsDoubleQuote( 'A string with "double" quotes\nand new\nlines' ) ).to.be( 'A string with \\"double\\" quotes\\nand new\\nlines' ) ;
```

escape.regExp() should escape a string so that it will be suitable as a literal string into a regular expression pattern.

```js
//console.log( 'String in RegExp:' , string.escape.regExp( "(This) {is} [my] ^$tring^... +doesn't+ *it*? |yes| \\no\\ /maybe/" ) ) ;
expect( string.escape.regExp( "(This) {is} [my] ^$tring^... +doesn't+ *it*? |yes| \\no\\ /maybe/" ) )
	.to.be( "\\(This\\) \\{is\\} \\[my\\] \\^\\$tring\\^\\.\\.\\. \\+doesn't\\+ \\*it\\*\\? \\|yes\\| \\\\no\\\\ \\/maybe\\/" ) ;
```

escape.regExpReplacement() should escape a string so that it will be suitable as a literal string into a regular expression replacement.

```js
expect( string.escape.regExpReplacement( "$he love$ dollar$ $$$" ) ).to.be( "$$he love$$ dollar$$ $$$$$$" ) ;

expect(
	'$he love$ dollar$ $$$'.replace(
		new RegExp( string.escape.regExp( '$' ) , 'g' ) ,
		string.escape.regExpReplacement( '$1' )
	) 
).to.be( "$1he love$1 dollar$1 $1$1$1" ) ;
```

escape.html() should escape a string so that it will be suitable as HTML content.

```js
//console.log( string.escape.html( "<This> isn't \"R&D\"" ) ) ;
expect( string.escape.html( "<This> isn't \"R&D\"" ) ).to.be( "&lt;This&gt; isn't \"R&amp;D\"" ) ;
```

escape.htmlAttr() should escape a string so that it will be suitable as an HTML tag attribute's value.

```js
//console.log( string.escape.htmlAttr( "<This> isn't \"R&D\"" ) ) ;
expect( string.escape.htmlAttr( "<This> isn't \"R&D\"" ) ).to.be( "&lt;This&gt; isn't &quot;R&amp;D&quot;" ) ;
```

escape.htmlSpecialChars() should escape all HTML special characters.

```js
//console.log( string.escape.htmlSpecialChars( "<This> isn't \"R&D\"" ) ) ;
expect( string.escape.htmlSpecialChars( "<This> isn't \"R&D\"" ) ).to.be( "&lt;This&gt; isn&#039;t &quot;R&amp;D&quot;" ) ;
```

<a name="camel-case"></a>
# Camel case
.toCamelCase() should transform a string composed of alphanum - minus - underscore to a camelCase string.

```js
expect( string.toCamelCase( 'one-two-three' ) ).to.be( 'oneTwoThree' ) ;
expect( string.toCamelCase( 'one_two_three' ) ).to.be( 'oneTwoThree' ) ;
expect( string.toCamelCase( 'OnE-tWo_tHree' ) ).to.be( 'oneTwoThree' ) ;
expect( string.toCamelCase( 'ONE-TWO-THREE' ) ).to.be( 'oneTwoThree' ) ;
expect( string.toCamelCase( 'a-b-c' ) ).to.be( 'aBC' ) ;
```

.toCamelCase() edge cases.

```js
expect( string.toCamelCase( '' ) ).to.be( '' ) ;
expect( string.toCamelCase() ).to.be( '' ) ;
expect( string.toCamelCase( 'u' ) ).to.be( 'u' ) ;
expect( string.toCamelCase( 'U' ) ).to.be( 'u' ) ;
expect( string.toCamelCase( 'U-b' ) ).to.be( 'uB' ) ;
expect( string.toCamelCase( 'U-' ) ).to.be( 'u' ) ;
expect( string.toCamelCase( '-U' ) ).to.be( 'u' ) ;
```

.camelCaseToDashed() should transform a string composed of alphanum - minus - underscore to a camelCase string.

```js
expect( string.camelCaseToDashed( 'oneTwoThree' ) ).to.be( 'one-two-three' ) ;
expect( string.camelCaseToDashed( 'OneTwoThree' ) ).to.be( 'one-two-three' ) ;
expect( string.camelCaseToDashed( 'aBC' ) ).to.be( 'a-b-c' ) ;
```

<a name="latinize"></a>
# Latinize
.latinize() should transform to regular latin letters without any accent.

```js
expect( string.latinize( 'éàèùâêîôûÂÊÎÔÛäëïöüÄËÏÖÜæÆŧøþßðđħł' ) )
                 .to.be( 'eaeuaeiouAEIOUaeiouAEIOUaeAEtothssdhdhl' ) ;
```

<a name="inspect"></a>
# inspect()
should inspect a variable with default options accordingly.

```js
var MyClass = function MyClass() {
	this.variable = 1 ;
} ;

MyClass.prototype.report = function report() { console.log( 'Variable value:' , this.variable ) ; } ;
MyClass.staticFunc = function staticFunc() { console.log( 'Static function.' ) ; } ;

var sparseArray = [] ;
sparseArray[ 3 ] = 'three' ;
sparseArray[ 10 ] = 'ten' ;
sparseArray[ 20 ] = 'twenty' ;
sparseArray.customProperty = 'customProperty' ;

var object = {
	a: 'A' ,
	b: 2 ,
	str: 'Woot\nWoot\rWoot\tWoot' ,
	sub: {
		u: undefined ,
		n: null ,
		t: true ,
		f: false
	} ,
	emptyString: '' ,
	emptyObject: {} ,
	list: [ 'one','two','three' ] ,
	emptyList: [] ,
	sparseArray: sparseArray ,
	hello: function hello() { console.log( 'Hello!' ) ; } ,
	anonymous: function() { console.log( 'anonymous...' ) ; } ,
	class: MyClass ,
	instance: new MyClass() ,
	buf: new Buffer( 'This is a buffer!' )
} ;

object.sub.circular = object ;

Object.defineProperties( object , {
	c: { value: '3' } ,
	d: {
		get: function() { throw new Error( 'Should not be called by the test' ) ; } ,
		set: function( value ) {}
	}
} ) ;

//console.log( '>>>>>' , string.escape.control( string.inspect( object ) ) ) ;
//console.log( string.inspect( { style: 'color' } , object ) ) ;
var actual = string.inspect( object ) ;
var expected = '<Object> <object> {\n    a: "A" <string>(1)\n    b: 2 <number>\n    str: "Woot\\nWoot\\rWoot\\tWoot" <string>(19)\n    sub: <Object> <object> {\n        u: undefined\n        n: null\n        t: true\n        f: false\n        circular: <Object> <object> [circular]\n    }\n    emptyString: "" <string>(0)\n    emptyObject: <Object> <object> {}\n    list: <Array>(3) <object> {\n        [0] "one" <string>(3)\n        [1] "two" <string>(3)\n        [2] "three" <string>(5)\n        length: 3 <number> <-conf -enum>\n    }\n    emptyList: <Array>(0) <object> {\n        length: 0 <number> <-conf -enum>\n    }\n    sparseArray: <Array>(21) <object> {\n        [3] "three" <string>(5)\n        [10] "ten" <string>(3)\n        [20] "twenty" <string>(6)\n        length: 21 <number> <-conf -enum>\n        customProperty: "customProperty" <string>(14)\n    }\n    hello: <Function> hello(0) <function>\n    anonymous: <Function> anonymous(0) <function>\n    class: <Function> MyClass(0) <function>\n    instance: <MyClass> <object> {\n        variable: 1 <number>\n    }\n    buf: <Buffer 54 68 69 73 20 69 73 20 61 20 62 75 66 66 65 72 21> <Buffer>(17)\n    c: "3" <string>(1) <-conf -enum -w>\n    d: <getter/setter> {\n        get: <Function> get(0) <function>\n        set: <Function> set(1) <function>\n    }\n}\n' ;
//console.log( '\n' + expected + '\n\n' + actual + '\n\n' ) ;
expect( actual ).to.be( expected ) ;
//console.log( string.inspect( { style: 'color' } , object ) ) ;
```

should pass the Array circular references bug.

```js
var array = [ [ 1 ] ] ;
expect( string.inspect( array ) ).to.be( '<Array>(1) <object> {\n    [0] <Array>(1) <object> {\n        [0] 1 <number>\n        length: 1 <number> <-conf -enum>\n    }\n    length: 1 <number> <-conf -enum>\n}\n' ) ;
```

<a name="misc"></a>
# Misc
.resize().

```js
expect( string.resize( 'bobby' , 3 ) ).to.be( 'bob' ) ;
expect( string.resize( 'bobby' , 5 ) ).to.be( 'bobby' ) ;
expect( string.resize( 'bobby' , 8 ) ).to.be( 'bobby   ' ) ;
```

<a name="unicode"></a>
# Unicode
unicode.length() should report correctly the length of a string.

```js
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
```

unicode.toArray() should produce an array of character.

```js
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
```

unicode.surrogatePair() should return 0 for single char, 1 for leading surrogate, -1 for trailing surrogate.

```js
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
```

unicode.isFullWidth() should return true if the char is full-width.

```js
expect( string.unicode.isFullWidth( 'a' ) ).to.be( false ) ;
expect( string.unicode.isFullWidth( '＠' ) ).to.be( true ) ;
expect( string.unicode.isFullWidth( '𝌆' ) ).to.be( false ) ;
expect( string.unicode.isFullWidth( '備' ) ).to.be( true ) ;
expect( string.unicode.isFullWidth( '䷆' ) ).to.be( false ) ;
```

