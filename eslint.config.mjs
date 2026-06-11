import { defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import globals from "globals";
import htmlEslint from "@html-eslint/eslint-plugin";
import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import parser from "@html-eslint/parser";
import path from "node:path";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	globalIgnores(["foundry/**/*"]),
	{
		extends: compat.extends("eslint:recommended"),

		plugins: {
			"@html-eslint": htmlEslint,
			"@stylistic": stylistic,
			"@jsdoc": jsdoc,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				CONFIG: "readonly",
				CONST: "readonly",
				// Global classes
				ActiveEffect: "readonly",
				Actor: "readonly",
				ChatMessage: "readonly",
				Combat: "readonly",
				Combatant: "readonly",
				Color: "readonly",
				Dialog: "readonly",
				Folder: "readonly",
				Handlebars: "readonly",
				Hooks: "readonly",
				Item: "readonly",
				Macro: "readonly",
				PIXI: "readonly",
				ProseMirror: "readonly",
				RegionBehavior: "readonly",
				Roll: "readonly",
				TokenDocument: "readonly",
				WallDocument: "readonly",
				// global namespaces
				$: "readonly", //jQuery alias
				canvas: "readonly",
				DND4E: "readonly",
				foundry: "readonly",
				game: "readonly",
				jQuery: "readonly",
				ui: "readonly",
				// global functions
				fromUuid: "readonly",
				fromUuidSync: "readonly",
				getDocumentClass: "readonly",
				_del: "readonly",
				_replace: "readonly",
				_loc: "readonly",
			},

			ecmaVersion: "latest",
			sourceType: "module",
		},

		rules: {
			// "no-undef": "off",
			"no-unused-vars": 0,
			// "sort-imports": ["warn"],

			"@stylistic/indent": ["error", "tab", {
				SwitchCase: 1,
			}],

			"@stylistic/quotes": ["error", "double"],
			"@stylistic/semi": ["error", "always"],
			"@stylistic/quote-props": ["error", "as-needed"],
			"@stylistic/array-bracket-newline": ["error", "consistent"],
			"@stylistic/key-spacing": "error",
			"@stylistic/comma-dangle": ["error", "always-multiline"],
			"@stylistic/space-in-parens": ["error", "never"],
			"@stylistic/space-infix-ops": 2,
			"@stylistic/keyword-spacing": 2,
			"@stylistic/semi-spacing": 2,
			"@stylistic/no-multi-spaces": 2,
			"@stylistic/no-extra-semi": 2,
			"@stylistic/no-whitespace-before-property": 2,
			"@stylistic/space-unary-ops": 2,

			"@stylistic/no-multiple-empty-lines": ["error", {
				max: 1,
				maxEOF: 0,
			}],

			"@stylistic/object-curly-spacing": ["error", "always"],
			"@stylistic/comma-spacing": ["error"],
			"@stylistic/space-before-blocks": 2,
			"@stylistic/arrow-spacing": 2,
			"@stylistic/eol-last": ["error", "always"],

			"@stylistic/no-mixed-operators": ["error", {
				allowSamePrecedence: true,

				groups: [[
					"==",
					"!=",
					"===",
					"!==",
					">",
					">=",
					"<",
					"<=",
					"&&",
					"||",
					"in",
					"instanceof",
				]],
			}],

			// TODO: actually fill in all the missing documentation QQ
			/*"@jsdoc/require-jsdoc": ["warn", {
				require: { ClassExpression: true, FunctionDeclaration: true, MethodDefinition: true },
				enableFixer: false,
				checkSetters: "no-getter",
				checkConstructors: false,
			}],*/
			//"@jsdoc/require-description": ["warn", { checkConstructors: false, contexts: ["FunctionDeclaration", "ClassDeclaration"] }],
			//"@jsdoc/require-description-complete-sentence": "warn",
		},
	}, {
		files: ["**/*.hbs", "**/*.html"],
		//extends: compat.extends("plugin:@html-eslint/recommended"),

		languageOptions: {
			parser: parser,
		},

		rules: {
			...htmlEslint.configs["recommended-legacy"].rules,
			"@html-eslint/attrs-newline": ["off", {
				closeStyle: "sameline",
				ifAttrsMoreThan: 9,
			}],

			"@html-eslint/indent": ["error", 2],
		},
	},
	{
		files: ["**/*.ts"],
		extends: [js.configs.recommended, tseslint.configs.recommended],

		plugins: {
			"@stylistic": stylistic,
		},

		rules: {
			"@stylistic/space-in-parens": ["error", "never"],
			"@stylistic/key-spacing": "error",
			"@stylistic/type-generic-spacing": "error",
		},
	},
]);
