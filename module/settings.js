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
		default: true,
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

	/**
	 * Determins if the Advanced Math Options for NPC's is set during their generation
	 */

	 game.settings.register("dnd4eAltus", "npcMathOptions", {
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
	// game.settings.register("dnd4eAltus", "disableExperienceTracking", {
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
	 game.settings.register("dnd4eAltus", "powerAutoGenerateLableOption", {
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

	/**
	 * Option to automaticly roll attack rolls agianst targeted tokens defence values, and determin if the attack is a hit/miss.
	 */
	game.settings.register("dnd4eAltus", "automationCombat",{
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

	/**
	 * show the roll expression formula when making d20 rolls
	 */
	game.settings.register("dnd4eAltus", "showRollExpression",{
		name: "SETTINGS.4eShowRollExpressionN",
		hint: "SETTINGS.4eShowRollExpressionL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});

	/**
	 * collapse bonuses down when making rolls
	 */
	game.settings.register("dnd4eAltus", "collapseSituationalBonus",{
		name: "SETTINGS.collapseSituationalBonusN",
		hint: "SETTINGS.collapseSituationalBonusL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
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
