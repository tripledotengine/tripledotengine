/*
Language: JavaScript
Description: JavaScript (JS) is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.
Category: common, scripting, web
Website: https://developer.mozilla.org/en-US/docs/Web/JavaScript
*/

const ECMA_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
const ECMA_KEYWORDS = [
	"as", // for exports
	"in",
	"of",
	"if",
	"for",
	"while",
	"finally",
	"var",
	"public",
	"private",
	"static",
	"dynamic",
	"inline",
	"override",
	"macro",
	"extern",
	"interface",
	"abstract",
	"enum",
	"typedef",
	"package",
	"new",
	"function",
	"do",
	"return",
	"void",
	"else",
	"break",
	"catch",
	"throw",
	"case",
	"default",
	"try",
	"switch",
	"continue",
	"final",
	"class",
	// JS handles these with a special rule
	// "get",
	// "set",
	"static",
	"import",
	"from",
	"extends"
];
const ECMA_LITERALS = [
	"true",
	"false",
	"null",
];

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
const ECMA_TYPES = [
	// Fundamental objects
	"Object",
	"Function",
	"Boolean",
	// numbers and dates
	"Math",
	"Date",
	"Int",
	"Float",
	// text
	"String",
	"RegExp",
	// Indexed collections
	"Array",
	"Map",
	"Json",
	"Reflect",
];

const ECMA_ERROR_TYPES = [
	"Error",
	"EvalError",
	"InternalError",
	"RangeError",
	"ReferenceError",
	"SyntaxError",
	"TypeError",
	"URIError"
];

const ECMA_BUILT_IN_GLOBALS = [
];

const ECMA_BUILT_IN_VARIABLES = [
	"this",
	"super",
	"trace",
];

const ECMA_BUILT_INS = [].concat(
	ECMA_BUILT_IN_GLOBALS,
	ECMA_TYPES,
	ECMA_ERROR_TYPES
);

/** @type LanguageFn */
module.exports = function(hljs) {
	const regex = hljs.regex;

	const IDENT_RE = ECMA_IDENT_RE;

	const KEYWORDS = {
		$pattern: ECMA_IDENT_RE,
		keyword: ECMA_KEYWORDS,
		literal: ECMA_LITERALS,
		built_in: ECMA_BUILT_INS,
		"variable.language": ECMA_BUILT_IN_VARIABLES
	};

	// https://tc39.es/ecma262/#sec-literals-numeric-literals
	const decimalDigits = '[0-9](_?[0-9])*';
	const frac = `\\.(${decimalDigits})`;
	// DecimalIntegerLiteral, including Annex B NonOctalDecimalIntegerLiteral
	// https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
	const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
	const NUMBER = {
		className: 'number',
		variants: [
			// DecimalLiteral
			{ begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))` +
				`[eE][+-]?(${decimalDigits})\\b` },
			{ begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },

			// NonDecimalIntegerLiteral
			{ begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
			{ begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
		],
		relevance: 0
	};

	const SUBST = {
		className: 'subst',
		begin: '\\$\\{',
		end: '\\}',
		keywords: KEYWORDS,
		contains: [] // defined later
	};
	const COMMENT = {
		className: "comment",
		variants: [
			hljs.C_BLOCK_COMMENT_MODE,
			hljs.C_LINE_COMMENT_MODE
		]
	};
	const SUBST_INTERNALS = [
		hljs.APOS_STRING_MODE,
		hljs.QUOTE_STRING_MODE,
		// Skip numbers when they are part of a variable name
		{ match: /\$\d+/ },
		NUMBER,
		// This is intentional:
		// See https://github.com/highlightjs/highlight.js/issues/3288
		// hljs.REGEXP_MODE
	];
	SUBST.contains = SUBST_INTERNALS
		.concat({
			// we need to pair up {} inside our subst to prevent
			// it from ending too early by matching another }
			begin: /\{/,
			end: /\}/,
			keywords: KEYWORDS,
			contains: [
				"self"
			].concat(SUBST_INTERNALS)
		});
	const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
	const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
		// eat recursive parens in sub expressions
		{
			begin: /(\s*)\(/,
			end: /\)/,
			keywords: KEYWORDS,
			contains: ["self"].concat(SUBST_AND_COMMENTS)
		}
	]);
	const PARAMS = {
		className: 'params',
		// convert this to negative lookbehind in v12
		begin: /(\s*)\(/, // to match the params with 
		end: /\)/,
		excludeBegin: true,
		excludeEnd: true,
		keywords: KEYWORDS,
		contains: PARAMS_CONTAINS
	};

	// ES6 classes
	const CLASS_OR_EXTENDS = {
		variants: [
			// class Car extends vehicle
			{
				match: [
					/class/,
					/\s+/,
					IDENT_RE,
					/\s+/,
					/extends/,
					/\s+/,
					regex.concat(IDENT_RE, "(", regex.concat(/\./, IDENT_RE), ")*")
				],
				scope: {
					1: "keyword",
					3: "title.class",
					5: "keyword",
					7: "title.class.inherited"
				}
			},
			// class Car
			{
				match: [
					/class/,
					/\s+/,
					IDENT_RE
				],
				scope: {
					1: "keyword",
					3: "title.class"
				}
			},

		]
	};

	const CLASS_REFERENCE = {
		relevance: 0,
		match:
		regex.either(
			// Hard coded exceptions
			/\bJSON/,
			// Float32Array, OutT
			/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
			// CSSFactory, CSSFactoryT
			/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
			// FPs, FPsT
			/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/,
			// P
			// single letters are not highlighted
			// BLAH
			// this will be flagged as a UPPER_CASE_CONSTANT instead
		),
		className: "title.class",
		keywords: {
			_: [
				// se we still get relevance credit for JS library classes
				...ECMA_TYPES,
				...ECMA_ERROR_TYPES
			]
		}
	};

	const FUNCTION_DEFINITION = {
		variants: [
			{
				match: [
					/function/,
					/\s+/,
					IDENT_RE,
					/(?=\s*\()/
				]
			},
			// anonymous function
			{
				match: [
					/function/,
					/\s*(?=\()/
				]
			}
		],
		className: {
			1: "keyword",
			3: "title.function"
		},
		label: "func.def",
		contains: [ PARAMS ],
		illegal: /%/
	};

	const UPPER_CASE_CONSTANT = {
		relevance: 0,
		match: /\b[A-Z][A-Z_0-9]+\b/,
		className: "variable.constant"
	};

	function noneOf(list) {
		return regex.concat("(?!", list.join("|"), ")");
	}

	const FUNCTION_CALL = {
		match: regex.concat(
			/\b/,
			noneOf([
				...ECMA_BUILT_IN_GLOBALS,
				"super",
				"import"
			].map(x => `${x}\\s*\\(`)),
			IDENT_RE, regex.lookahead(/\s*\(/)),
		className: "title.function",
		relevance: 0
	};

	const PROPERTY_ACCESS = {
		begin: regex.concat(/\./, regex.lookahead(
			regex.concat(IDENT_RE, /(?![0-9A-Za-z$_(])/)
		)),
		end: IDENT_RE,
		excludeBegin: true,
		keywords: "prototype",
		className: "property",
		relevance: 0
	};

	const GETTER_OR_SETTER = {
		match: [
			/get|set/,
			/\s+/,
			IDENT_RE,
			/(?=\()/
		],
		className: {
			1: "keyword",
			3: "title.function"
		},
		contains: [
			{ // eat to avoid empty params
				begin: /\(\)/
			},
			PARAMS
		]
	};

	const FUNC_LEAD_IN_RE = '(\\(' +
		'[^()]*(\\(' +
		'[^()]*(\\(' +
		'[^()]*' +
		'\\)[^()]*)*' +
		'\\)[^()]*)*' +
		'\\)|' + hljs.UNDERSCORE_IDENT_RE + ')\\s*=>';

	const FUNCTION_VARIABLE = {
		match: [
			/var|final/, /\s+/,
			IDENT_RE, /\s*/,
			/=\s*/,
			regex.lookahead(FUNC_LEAD_IN_RE)
		],
		keywords: "async",
		className: {
			1: "keyword",
			3: "title.function"
		},
		contains: [
			PARAMS
		]
	};

	return {
		name: 'Haxe',
		aliases: ['hx', "hscript", "hsc"],
		keywords: KEYWORDS,
		// this will be extended by TypeScript
		exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
		illegal: /#(?![$_A-z])/,
		contains: [
			hljs.SHEBANG({
				label: "shebang",
				binary: "node",
				relevance: 5
			}),
			hljs.APOS_STRING_MODE,
			hljs.QUOTE_STRING_MODE,
			COMMENT,
			// Skip numbers when they are part of a variable name
			{ match: /\$\d+/ },
			NUMBER,
			CLASS_REFERENCE,
			{
				className: 'attr',
				begin: IDENT_RE + regex.lookahead(':'),
				relevance: 0
			},
			FUNCTION_VARIABLE,
			{ // "value" container
				begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
				keywords: 'return throw case',
				relevance: 0,
				contains: [
					COMMENT,
					hljs.REGEXP_MODE,
					{
						className: 'function',
						// we have to count the parens to make sure we actually have the
						// correct bounding ( ) before the =>.  There could be any number of
						// sub-expressions inside also surrounded by parens.
						begin: FUNC_LEAD_IN_RE,
						returnBegin: true,
						end: '\\s*(->|=>)',
						contains: [
							{
								className: 'params',
								variants: [
									{
										begin: hljs.UNDERSCORE_IDENT_RE,
										relevance: 0
									},
									{
										className: null,
										begin: /\(\s*\)/,
										skip: true
									},
									{
										begin: /(\s*)\(/,
										end: /\)/,
										excludeBegin: true,
										excludeEnd: true,
										keywords: KEYWORDS,
										contains: PARAMS_CONTAINS
									}
								]
							}
						]
					},
					{ // could be a comma delimited list of params to a function call
						begin: /,/,
						relevance: 0
					},
					{
						match: /\s+/,
						relevance: 0
					},
				],
			},
			FUNCTION_DEFINITION,
			{
				// prevent this from getting swallowed up by function
				// since they appear "function like"
				beginKeywords: "while if switch catch for"
			},
			{
				// we have to count the parens to make sure we actually have the correct
				// bounding ( ).  There could be any number of sub-expressions inside
				// also surrounded by parens.
				begin: '\\b(?!function)' + hljs.UNDERSCORE_IDENT_RE +
					'\\(' + // first parens
					'[^()]*(\\(' +
						'[^()]*(\\(' +
							'[^()]*' +
						'\\)[^()]*)*' +
					'\\)[^()]*)*' +
					'\\)\\s*\\{', // end parens
				returnBegin:true,
				label: "func.def",
				contains: [
					PARAMS,
					hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE, className: "title.function" })
				]
			},
			// catch ... so it won't trigger the property rule below
			{
				match: /\.\.\./,
				relevance: 0
			},
			PROPERTY_ACCESS,
			// hack: prevents detection of keywords in some circumstances
			// .keyword()
			// $keyword = x
			{
				match: '\\$' + IDENT_RE,
				relevance: 0
			},
			{
				match: [ /\bnew(?=\s*\()/ ],
				className: { 1: "title.function" },
				contains: [ PARAMS ]
			},
			FUNCTION_CALL,
			UPPER_CASE_CONSTANT,
			CLASS_OR_EXTENDS,
			GETTER_OR_SETTER,
			{
				match: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
			}
		]
	};
}