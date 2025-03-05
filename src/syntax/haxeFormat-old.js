/*
Language: Haxe
Description: Haxe is an open source toolkit based on a modern, high level, strictly typed programming language.
Author: Christopher Kaster <ikasoki@gmail.com> (Based on the actionscript.js language file by Alexander Myadzel)
Contributors: Kenton Hamaluik <kentonh@gmail.com>
Website: https://haxe.org
Category: system
*/

const HaxeScript = {
		IDENT_RE: /[a-zA-Z_$][a-zA-Z0-9_$]*?/,
		BIG_IDENT_RE: /\b[A-Z][a-zA-Z0-9_$]*?\b/,

		KEYWORDS: [
				'abstract',
				"break",
				"case",
				"cast",
				"catch",
				"continue",
				"default",
				"do",
				"dynamic",
				"else",
				"enum",
				"extern",
				"final",
				"for",
				"function",
				"here",
				"if",
				"import",
				"in",
				"inline",
				"is",
				"macro",
				"never",
				"new",
				"override",
				"package",
				"private",
				"get",
				"set",
				"public",
				"return",
				"static",
				"super",
				"switch",
				"this",
				"throw",
				"trace",
				"try",
				"typedef",
				"untyped",
				"using",
				"var",
				"while",
		],


		LITERALS: [
				"true",
				"false",
				"null",
		],

		BUILT_IN_GLOBALS: [
		],

		BUILT_IN_VARIABLES: [
				'this',
				"trace",
				"super"
		]
}

module.exports = function(hljs) {
	const IDENT_RE = HaxeScript.IDENT_RE;
	const BIG_IDENT_RE = HaxeScript.BIG_IDENT_RE;
	const IDENT_FUNC_RETURN_TYPE_RE = /([*]|[a-zA-Z_$][a-zA-Z0-9_$]*?)/;

	// C_NUMBER_RE with underscores and literal suffixes
	const HAXE_NUMBER_RE = /(-?)(\b0[xX][a-fA-F0-9][a-fA-F0-9_]*|\b0[bB][0-1][0-1_]*|(\b\d+(\.[\d][\d_]*)?|\.[\d][\d_]*)(([eE][-+]?\d+)|i32|u32|i64|f64)?)/;

	//const HAXE_BASIC_TYPES = 'Int Float String Bool Dynamic Void Array ';

	const BUILT_INS = [].concat(
		HaxeScript.BUILT_IN_GLOBALS,
		//HaxeScript.TYPES,
		//HaxeScript.ERROR_TYPES
	);

	const KEYWORDS = {
		//$pattern: HaxeScript.IDENT_RE,
		keyword: HaxeScript.KEYWORDS,
		literal: HaxeScript.LITERALS,
		built_in: BUILT_INS,
		"variable.language": HaxeScript.BUILT_IN_VARIABLES
	};

	const SUBST = {
		className: 'subst',
		begin: /\$\{/,
		end: /\}/,
		keywords: KEYWORDS,
		contains: [] // defined later
	};

	return {
		name: 'Haxe',
		aliases: [ 'hx', "hscript", "hsc" ],
		keywords: KEYWORDS,
		contains: [
			{
				className: 'string', // interpolate-able strings
				begin: '\'',
				end: '\'',
				illegal: '\\n',
				contains: [
					hljs.BACKSLASH_ESCAPE,
					SUBST
				]
			},
			hljs.QUOTE_STRING_MODE,
			hljs.C_LINE_COMMENT_MODE,
			hljs.C_BLOCK_COMMENT_MODE,
			{
				className: 'number',
				begin: HAXE_NUMBER_RE,
				relevance: 0
			},
			{
				className: 'variable',
				begin: "\\$" + IDENT_RE,
			},
			{
				className: 'meta', // compiler meta
				begin: /@:?/,
				end: /\(|$/,
				excludeEnd: true,
			},
			{
				className: 'meta', // compiler conditionals
				begin: '#',
				end: '$',
				keywords: { keyword: 'if else elseif end error' }
			},
			{
				className: 'type', // function types
				begin: /:[ \t]*/,
				end: /[^A-Za-z0-9_ \t\->]/,
				excludeBegin: true,
				excludeEnd: true,
				relevance: 0
			},
			{
				className: 'type', // types
				begin: /:[ \t]*/,
				end: /\W/,
				excludeBegin: true,
				excludeEnd: true
			},
			{
				className: 'type', // instantiation
				beginKeywords: 'new',
				end: /\W/,
				excludeBegin: true,
				excludeEnd: true
			},
			{
				className: 'title.class', // enums
				beginKeywords: 'enum',
				end: /\{/,
				contains: [ hljs.TITLE_MODE ]
			},
			{
				className: 'title.class', // abstracts
				begin: '\\babstract\\b(?=\\s*' + hljs.IDENT_RE + '\\s*\\()',
				end: /[\{$]/,
				contains: [
					{
						className: 'type',
						begin: /\(/,
						end: /\)/,
						excludeBegin: true,
						excludeEnd: true
					},
					{
						className: 'type',
						begin: /from +/,
						end: /\W/,
						excludeBegin: true,
						excludeEnd: true
					},
					{
						className: 'type',
						begin: /to +/,
						end: /\W/,
						excludeBegin: true,
						excludeEnd: true
					},
					hljs.TITLE_MODE
				],
				keywords: { keyword: 'abstract from to' }
			},
			{
				className: 'title.class', // classes
				begin: /\b(class|interface) +/,
				end: /[\{$]/,
				excludeEnd: true,
				keywords: 'class interface',
				contains: [
					{
						className: 'keyword',
						begin: /\b(extends|implements) +/,
						keywords: 'extends implements',
						contains: [
							{
								className: 'type',
								begin: IDENT_RE,
								relevance: 0
							}
						]
					},
					hljs.TITLE_MODE
				]
			},
			{
				className: 'title.function',
				beginKeywords: 'function',
				end: /\(/,
				excludeEnd: true,
				illegal: /\S/,
				contains: [ {
						scope: 'hx-function',
						begin: IDENT_RE,
						relevance: 0
				} ]
			},
			{
				className: 'type', // function types
				begin: BIG_IDENT_RE
			},
			/*{
				className: 'hx-function',
				begin: "\\b" + IDENT_RE + "\\b\\(",
				end: /\(/,

				excludeEnd: true,
			}*/
			/*{
				className: 'hx-function',
				begin: /\./,
				excludeBegin: true,
				end: /\(/,
				excludeEnd: true,
				contains: [
						IDENT_RE
				]
			},*/
		],
		illegal: /<\//
	};
}