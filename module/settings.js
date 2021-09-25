export const registerSystemSettings = function() {

	/**
	 * Track the system version upon which point a migration was last applied
	 */
	game.settings.register("dnd4e", "systemMigrationVersion", {
		name: "System Migration Version",
		scope: "world",
		config: false,
		type: String,
		default: ""
	});

	/**
	 * Register resting variants
	 */
	// game.settings.register("dnd4e", "restVariant", {
		// name: "SETTINGS.4eRestN",
		// hint: "SETTINGS.4eRestL",
		// scope: "world",
		// config: true,
		// default: "normal",
		// type: String,
		// choices: {
			// "normal": "SETTINGS.4eRestPHB",
			// "gritty": "SETTINGS.4eRestGritty",
			// "epic": "SETTINGS.4eRestEpic",
		// }
	// });

	/**
	 * Register diagonal movement rule setting
	 */
	game.settings.register("dnd4e", "diagonalMovement", {
		name: "SETTINGS.4eDiagN",
		hint: "SETTINGS.4eDiagL",
		scope: "world",
		config: true,
		default: "555",
		type: String,
		choices: {
			"555": "SETTINGS.4eDiagPHB",
			"5105": "SETTINGS.4eDiagDMG",
			"EUCL": "SETTINGS.4eDiagEuclidean",
		},
		onChange: rule => canvas.grid.diagonalRule = rule
	});

	/**
	 * Register Initiative formula setting
	 */
	game.settings.register("dnd4e", "initiativeDexTiebreaker", {
		name: "SETTINGS.4eInitTBN",
		hint: "SETTINGS.4eInitTBL",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});

	/**
	 * Require Currency Carrying Weight
	 */
	game.settings.register("dnd4e", "currencyWeight", {
		name: "SETTINGS.4eCurWtN",
		hint: "SETTINGS.4eCurWtL",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});

	/**
	 * Determins if the Advanced Math Options for NPC's is set during their generation
	 */

	 game.settings.register("dnd4e", "npcMathOptions", {
		name: "SETTINGS.4eNpcMathOptionsN",
		hint: "SETTINGS.4eNpcMathOptionsL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	// /**
	//  * Option to disable XP bar for session-based or story-based advancement.
	//  */
	// game.settings.register("dnd4e", "disableExperienceTracking", {
	// 	name: "SETTINGS.4eNoExpN",
	// 	hint: "SETTINGS.4eNoExpL",
	// 	scope: "world",
	// 	config: true,
	// 	default: false,
	// 	type: Boolean,
	// });


	/**
	 * Option to automatically generate powers with the Auto Generate Power Card Details set to true or false
	 */
	 game.settings.register("dnd4e", "powerAutoGenerateLableOption", {
		name: "SETTINGS.4ePowerAutoGenerateLableOptionN",
		hint: "SETTINGS.4ePowerAutoGenerateLableOptionL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean,
		onChange: s => {
			ui.chat.render();
		}
	});

	/**
	 * Option to automatically collapse Item Card descriptions
	 */
	game.settings.register("dnd4e", "autoCollapseItemCards", {
		name: "SETTINGS.4eAutoCollapseCardN",
		hint: "SETTINGS.4eAutoCollapseCardL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
		onChange: s => {
			ui.chat.render();
		}
	});

	/**
	 * Option to automaticly roll attack rolls agianst targeted tokens defence values, and determin if the attack is a hit/miss.
	 */
	game.settings.register("dnd4e", "automationCombat",{
		name: "SETTINGS.4eAutomationCombatN",
		hint: "SETTINGS.4eAutomationCombatL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean,
		onChange: s => {
			ui.chat.render();
		}
	});


	// /**
	//  * Option to allow GMs to restrict polymorphing to GMs only.
	//  */
	// game.settings.register('dnd4e', 'allowPolymorphing', {
	// 	name: 'SETTINGS.4eAllowPolymorphingN',
	// 	hint: 'SETTINGS.4eAllowPolymorphingL',
	// 	scope: 'world',
	// 	config: true,
	// 	default: false,
	// 	type: Boolean
	// });

	/**
	 * Remember last-used polymorph settings.
	 */
	// game.settings.register('dnd4e', 'polymorphSettings', {
	// 	scope: 'client',
	// 	default: {
	// 		keepPhysical: false,
	// 		keepMental: false,
	// 		keepSaves: false,
	// 		keepSkills: false,
	// 		mergeSaves: false,
	// 		mergeSkills: false,
	// 		keepClass: false,
	// 		keepFeats: false,
	// 		keepSpells: false,
	// 		keepItems: false,
	// 		keepBio: false,
	// 		keepVision: true,
	// 		transformTokens: true
	// 	}
	// });
};
