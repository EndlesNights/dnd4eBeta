import CustomSkillConfig from "./apps/custom-skill-config.js";
import { updateApplyEffectsTooltips } from "./chat.js";

export const registerSystemSettings = function() {

	game.settings.registerMenu("dnd4e", "show-custom-skill", {
		name: "SETTINGS.4eShowCustomSkillN",
		label: "SETTINGS.4eShowCustomSkillL",
		hint: "SETTINGS.4eShowCustomSkillH",
		icon: 'fas fa-cog',
		type: CustomSkillConfig,
		restricted: true,
	});

	game.settings.register("dnd4e", "custom-skills",{
		name: "Custom Skills",
		scope: "world",
		config: false,
		type: Object,
		default: []
	});

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
	 * Register resistances and vulnerabilities damage rule setting
	 */
	 game.settings.register("dnd4e", "damageCalcRules", {
		name: "SETTINGS.4eDamageCalcN",
		hint: "SETTINGS.4eDamageCalcL",
		scope: "world",
		config: true,
		default: "errata",
		type: String,
		choices: {
			"errata": "SETTINGS.4eDamageCalcErrata",
			"phb": "SETTINGS.4eDamageCalcPHB",
		},
	});
	/**
	 * Register Initiative formula setting
	 */
	game.settings.register("dnd4e", "initiativeDexTiebreaker", {
		name: "SETTINGS.4eInitTBN",
		hint: "SETTINGS.4eInitTBL",
		scope: "world",
		config: true,
		default: "system",
		type: String,
		choices: {
			"system": "SETTINGS.4eInitTBSys",
			"dex": "SETTINGS.4eInitTBDex",
			"random": "SETTINGS.4eInitTBRand"
		},
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
	 * Determines if the Advanced Math Options for NPCs is set during their generation
	 */

	game.settings.register("dnd4e", "npcMathOptions", {
		name: "SETTINGS.4eNpcMathOptionsN",
		hint: "SETTINGS.4eNpcMathOptionsL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Allows the ability to turn off half levels for: Ability, Defense, Skills and Initiative score values. Somewhat common house rule.
	 */

	game.settings.register("dnd4e", "halfLevelOptions", {
		name: "SETTINGS.4eHalfLevelOptionsN",
		hint: "SETTINGS.4eHalfLevelOptionsL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	/**
	 * Allows the game to use inherent enhancement bonuses to PC's attack, damage and defences.
	 */

	game.settings.register("dnd4e", "inhEnh", {
		name: "SETTINGS.4eInhEnhN",
		hint: "SETTINGS.4eInhEnhL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});


	/**
	 * Determs when Death Saving Throws are reset
	 */
	game.settings.register("dnd4e", "deathSaveRest", {
		name: "SETTINGS.4eDeathSaveRestN",
		hint: "SETTINGS.4eDeathSaveRestL",
		scope: "world",
		config: true,
		default: "short",
		type: Number,
		choices: {
			0: "DND4E.RestShort",
			1: "DND4E.RestLong",
			2: "DND4E.RestLongH",
		}
	});
	
	/**
	 * Are Effects Automaticly Applied to targets targets upen using powers / attacks
	 */
	game.settings.register("dnd4e", "autoApplyEffects", {
		name: "SETTINGS.4eAutoApplyEffectsN",
		hint: "SETTINGS.4eAutoApplyEffectsL",
		scope: "world",
		config: true,
		default: true,
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
	 * Option to automatically roll attack rolls against targeted tokens defence values, and determine if the attack is a hit/miss.
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

	/**
	 * show the roll expression formula when making d20 rolls
	 */
	game.settings.register("dnd4e", "showRollExpression",{
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
	game.settings.register("dnd4e", "collapseSituationalBonus",{
		name: "SETTINGS.4eCollapseSituationalBonusN",
		hint: "SETTINGS.4eCollapseSituationalBonusL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});


	/**
	 * debug power attack / damage effect bonuses
	 */
	game.settings.register("dnd4e", "debugEffectBonus",{
		name: "SETTINGS.4eDebugPowerEffectsN",
		hint: "SETTINGS.4eDebugPowerEffectsL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});


	/**
	 * delete confirmation
	 */
	game.settings.register("dnd4e", "itemDeleteConfirmation",{
		name: "SETTINGS.4eItemDeleteConfirmationN",
		hint: "SETTINGS.4eItemDeleteConfirmationL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});

	game.settings.register("dnd4e", "fastFowardSettings",{
		name: "SETTINGS.4eFastFowardSettingsN",
		hint: "SETTINGS.4eFastFowardSettingsL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});
	
	game.settings.register("dnd4e", "saveReminders",{
		name: "SETTINGS.4eSaveRemindersN",
		hint: "SETTINGS.4eSaveRemindersL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});
	
	game.settings.register("dnd4e", "autoDoTs",{
		name: "SETTINGS.4eAutoDoTsN",
		hint: "SETTINGS.4eAutoDoTsL",
		scope: "client",
		config: true,
		default: "apply",
		type: String,
		choices: {
			"none": "DND4E.None",
			"apply": "SETTINGS.4eAutoDoTsApply",
			"notify": "SETTINGS.4eAutoDoTsNotify"
		}
	});
	
	game.settings.register("dnd4e", "autoDoTsPublic",{
		name: "SETTINGS.4eAutoDoTsPublicN",
		hint: "SETTINGS.4eAutoDoTsPublicL",
		scope: "world",
		config: true,
		default: "all",
		type: String,
		choices: {
			"all": "SETTINGS.4eAutoDoTsPublicAll",
			"none": "SETTINGS.4eAutoDoTsPublicNone",
			"pcs": "SETTINGS.4eAutoDoTsPublicPCs"
		}
	});
	
	game.settings.register("dnd4e", "darkMode",{
		name: "SETTINGS.4eDarkModeN",
		hint: "SETTINGS.4eDarkModeL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
		onChange: foundry.utils.debouncedReload
	});

	game.settings.register("dnd4e", "applyEffectsToSelection",{
		name: "SETTINGS.4eApplyEffectsToSelectionN",
		hint: "SETTINGS.4eApplyEffectsToSelectionL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
		onChange: updateApplyEffectsTooltips
	});

	game.keybindings.register("dnd4e", "permShowPlayer", {
		name: game.i18n.localize("SETTINGS.4epermShowPlayerN"),
		hint: game.i18n.localize("SETTINGS.4epermShowPlayerL"),
		editable: [
			{
				key: "AltLeft"
			}
		],
		precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	});

	// game.keybindings.register("dnd4e", "fastFowardKeyBind", {
	// 	name: game.i18n.localize("SETTINGS.4eFastFowardKeyBindN"),
	// 	hint: game.i18n.localize("SETTINGS.4eFastFowardKeyBindL"),
	// 	editable: [
	// 		{
	// 			key: "Alt"
	// 		},
	// 		{
	// 			key: "Control"
	// 		},
	// 		{
	// 			key: "Shift"
	// 		}
	// 	],
	// 	precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL,
	// });
	
	game.settings.register("dnd4e", "cardAtkDisplay",{
		name: "SETTINGS.4eCardAtkDisplayN",
		hint: "SETTINGS.4eCardAtkDisplayL",
		scope: "client",
		config: true,
		default: "stat",
		type: String,
		choices: {
			"bonus": "SETTINGS.4eCardAtkDisplayBonus",
			"stat": "SETTINGS.4eCardAtkDisplayStat",
			"bothBonus": "SETTINGS.4eCardAtkDisplaybothBonus"
		}
	});

    game.settings.register("dnd4e", "markAutomation",{
		name: "SETTINGS.4eMarkAutomationN",
		hint: "SETTINGS.4eMarkAutomationL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});
};
