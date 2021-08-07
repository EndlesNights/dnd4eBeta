export const registerSystemSettings = function() {

	/**
	 * Track the system version upon which point a migration was last applied
	 */
	game.settings.register("dnd4eAltus", "systemMigrationVersion", {
		name: "System Migration Version",
		scope: "world",
		config: false,
		type: String,
		default: ""
	});

	/**
	 * Register resting variants
	 */
	// game.settings.register("dnd4eAltus", "restVariant", {
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
	game.settings.register("dnd4eAltus", "diagonalMovement", {
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
	game.settings.register("dnd4eAltus", "initiativeDexTiebreaker", {
		name: "SETTINGS.4eInitTBN",
		hint: "SETTINGS.4eInitTBL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Require Currency Carrying Weight
	 */
	game.settings.register("dnd4eAltus", "currencyWeight", {
		name: "SETTINGS.4eCurWtN",
		hint: "SETTINGS.4eCurWtL",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});

	// /**
	//  * Option to disable XP bar for session-based or story-based advancement.
	//  */
	// game.settings.register("dnd4eAltus", "disableExperienceTracking", {
	// 	name: "SETTINGS.4eNoExpN",
	// 	hint: "SETTINGS.4eNoExpL",
	// 	scope: "world",
	// 	config: true,
	// 	default: false,
	// 	type: Boolean,
	// });

	/**
	 * Option to automatically collapse Item Card descriptions
	 */
	game.settings.register("dnd4eAltus", "autoCollapseItemCards", {
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

	game.settings.register("dnd4eAltus", "automationCombat",{
		name: "SETTINGS.4eAutomationCombatN",
		hint: "SETTINGS.4eAutomationCombatL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
		onChange: s => {
			ui.chat.render();
		}
	});


	// /**
	//  * Option to allow GMs to restrict polymorphing to GMs only.
	//  */
	// game.settings.register('dnd4eAltus', 'allowPolymorphing', {
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
	// game.settings.register('dnd4eAltus', 'polymorphSettings', {
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
