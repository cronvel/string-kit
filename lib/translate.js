/*
	The Cedric's Swiss Knife (CSK) - CSK string toolbox

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



/*
	Markup format:
	$<argument's number>[<function>:<argument1>|<argument2>]
	
	Common functions:
	s:		display a literal non-translatable string
	t:		display a translatable string
	num:	display a number using letters
	n:		plural forms
	g:		gender forms
	ng:		plural and gender forms
	
	Arguments:
	number:	a number, used for plural forms or to display as string
	string:	can be a litteral string, or a translatable string
	object:	a translate object, can contains some of those properties:
		s:	a literal non-translatable string
		t:	a translatable string
		n:	number
		g:	gender, one of n,m,f or anything recognized by the language
	
	"Give me $1[num] $1[n:apple|apples]!" , 3	-> "Give me three apples!"
	"Donne-moi $1[num:f] $1[n:pomme|pommes]!" , 1 -> "Donne-moi une pomme!"
	
	"Give me one $1[t]!" , apple 	-> "Give me one apple!"
	"Donne-moi $1[articleIndefini] $1[t]!" , apple	-> "Donne-moi une pomme!"
	
	"Give me two $1[t:2]!" , apple 	-> "Give me one apple!"
	"Donne-moi deux $1[t:2]!" , apple	-> "Donne-moi deux pommes!"
*/

