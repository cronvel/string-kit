inspect:  <Object> <object> {
    a : "A" <string>
    b : 2 <number>
    sub : <Object> <object> {
        u : <undefined>
        n : <null>
        t : <true>
        f : <false>
        circular : <Object> <object> [circular]
    }
    empty : <Object> <object> {}
    list : <Array> <object> {
        [0] : "one" <string>
        [1] : "two" <string>
        [2] : "three" <string>
        length< (-conf -enum)> : 3 <number>
    }
    emptyList : <Array> <object> {
        length< (-conf -enum)> : 0 <number>
    }
}

inspect:  [35mObject[39m [3m[90mobject[39m[23m {
    [32ma[39m : "[34mA[39m" [3m[90mstring[39m[23m
    [32mb[39m : [36m2[39m [3m[90mnumber[39m[23m
    [32msub[39m : [35mObject[39m [3m[90mobject[39m[23m {
        [32mu[39m : [3m[90mundefined[39m[23m
        [32mn[39m : [3m[90mnull[39m[23m
        [32mt[39m : [3m[90mtrue[39m[23m
        [32mf[39m : [3m[90mfalse[39m[23m
        [32mcircular[39m : [35mObject[39m [3m[90mobject[39m[23m [circular]
    }
    [32mempty[39m : [35mObject[39m [3m[90mobject[39m[23m {}
    [32mlist[39m : [35mArray[39m [3m[90mobject[39m[23m {
        [[34m0[39m] : "[34mone[39m" [3m[90mstring[39m[23m
        [[34m1[39m] : "[34mtwo[39m" [3m[90mstring[39m[23m
        [[34m2[39m] : "[34mthree[39m" [3m[90mstring[39m[23m
        [32mlength[39m[3m[90m (-conf -enum)[39m[23m : [36m3[39m [3m[90mnumber[39m[23m
    }
    [32memptyList[39m : [35mArray[39m [3m[90mobject[39m[23m {
        [32mlength[39m[3m[90m (-conf -enum)[39m[23m : [36m0[39m [3m[90mnumber[39m[23m
    }
}

# TOC
   - [format()](#format)
   - [inspect()](#inspect)
   - [Escape](#escape)
<a name=""></a>
 
<a name="format"></a>
# format()
should perform basic examples.

```js
expect( format( 'Hello world' ) ).to.be( 'Hello world' ) ;
expect( format( 'Hello %s' , 'world' ) ).to.be( 'Hello world' ) ;
expect( format( 'Hello %s %s, how are you?' , 'Joe' , 'Doe' ) ).to.be( 'Hello Joe Doe, how are you?' ) ;
expect( format( 'I have %i cookies.' , 3 ) ).to.be( 'I have 3 cookies.' ) ;
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

should perform well the argument's number feature.

```js
expect( format( '%s%s%s' , 'A' , 'B' , 'C' ) ).to.be( 'ABC' ) ;
expect( format( '%+1s%-1s%s' , 'A' , 'B' , 'C' ) ).to.be( 'BAC' ) ;
expect( format( '%3s%s' , 'A' , 'B' , 'C' ) ).to.be( 'CBC' ) ;
```

format.count() should count the number of arguments found.

```js
expect( format.count( 'blah blih blah' ) ).to.be( 0 ) ;
expect( format.count( '%i %s' ) ).to.be( 2 ) ;
```

when using a filter object as the *this* context, the %[functionName] format should use a custom function to format the input.

```js
var filters = {
	fixed: function() { return 'F' ; } ,
	double: function( str ) { return '' + str + str ; } ,
	fxy: function( a , b ) { return '' + ( a * a + b ) ; }
} ;

expect( format.call( filters , '%[fixed]%s%s%s' , 'A' , 'B' , 'C' ) ).to.be( 'FABC' ) ;
expect( format.call( filters , '%s%[fxy:%a%a]' , 'f(x,y)=' , 5 , 3 ) ).to.be( 'f(x,y)=28' ) ;
expect( format.call( filters , '%s%[fxy:%+1a%-1a]' , 'f(x,y)=' , 5 , 3 ) ).to.be( 'f(x,y)=14' ) ;
```

<a name="inspect"></a>
# inspect()
should.

```js
console.log( 'inspect: ' , inspect( { proto: true, depth: 3 } , object ) ) ;
console.log( 'inspect: ' , inspect( { style: 'color', proto: true, depth: 3 } , object ) ) ;
```

<a name="escape"></a>
# Escape
