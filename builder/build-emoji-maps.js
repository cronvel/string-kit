#!/usr/bin/env node

"use strict" ;



// data-by-emoji.json is provided by module 'unicode-emoji-json' (v0.5)
// Github: https://github.com/muan/unicode-emoji-json
const emojiDataMap = require( './emoji-data.json' ) ;

const emoji = require( '../lib/emoji.js' ) ;

const fs = require( 'fs' ) ;
const path = require( 'path' ) ;



var count = 0 ,
	emojiMap = {} ,
	canonicalNameMap = {} ,
	keywordMap = {} ,
	groups = new Set() ,
	keywords = new Set() ;



for ( let [ emojiChar , data ] of Object.entries( emojiDataMap ) ) {
	count ++ ;
	groups.add( data.group ) ;
	let name = emoji.simplifyName( data.name ) ;
	canonicalNameMap[ name ] = emojiChar ;
	emojiMap[ emojiChar ] = name ;

	let emojiKeywords = emoji.splitIntoKeywords( name , true ) ;

	for ( let keyword of emojiKeywords ) {
		keywords.add( keyword ) ;
		if ( ! keywordMap[ keyword ] ) { keywordMap[ keyword ] = [] ; }
		keywordMap[ keyword ].push( emojiChar ) ;
	}
}


console.log( "Count: " , count ) ;
console.log( "Groups: " , groups ) ;
//console.log( "Keywords: " , keywords ) ;
//console.log( "Canonical Name Map: " , canonicalNameMap ) ;
//console.log( "Keyword Map: " , keywordMap ) ;

fs.writeFileSync( '../lib/json-data/emoji-char-to-canonical-name.json' , JSON.stringify( emojiMap ) ) ;
fs.writeFileSync( '../lib/json-data/emoji-canonical-name-to-char.json' , JSON.stringify( canonicalNameMap ) ) ;
fs.writeFileSync( '../lib/json-data/emoji-keyword-to-charlist.json' , JSON.stringify( keywordMap ) ) ;

