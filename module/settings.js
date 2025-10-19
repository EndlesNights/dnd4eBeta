import CustomSkillConfig from "./apps/custom-skill-config.js";
import { updateApplyEffectsTooltips } from "./chat.js";

export const registerSystemSettings = function() {

/*************************/
/**  INTERNAL SETTINGS  **/
/*************************/

	// Track the system version upon which point a migration was last applied
	game.settings.register("dnd4e", "systemMigrationVersion", {
		name: "System Migration Version",
		scope: "world",
		config: false,
		type: String,
		default: ""
	});


/*************************/
/**     HOUSE RULES     **/
/*************************/

	// Diagonal movement rule setting
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

	// Resistances/vulnerabilities damage rule setting
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
	
	// Initiative tiebreaker setting
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

	// Currency Carrying Weight
	game.settings.register("dnd4e", "currencyWeight", {
		name: "SETTINGS.4eCurWtN",
		hint: "SETTINGS.4eCurWtL",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	
	// Allows the ability to turn off half levels for: Ability, Defense, Skills and Initiative score values. Somewhat common house rule.
	game.settings.register("dnd4e", "halfLevelOptions", {
		name: "SETTINGS.4eHalfLevelOptionsN",
		hint: "SETTINGS.4eHalfLevelOptionsL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	// Inherent enhancement bonuses to PC's attack, damage and defences.
	game.settings.register("dnd4e", "inhEnh", {
		name: "SETTINGS.4eInhEnhN",
		hint: "SETTINGS.4eInhEnhL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	// Determines when Death Saving Throws are reset
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

	// Disable XP bar for session-based or story-based advancement.
	/*game.settings.register("dnd4e", "disableExperienceTracking", {
	 	name: "SETTINGS.4eNoExpN",
	 	hint: "SETTINGS.4eNoExpL",
	 	scope: "world",
	 	config: true,
	 	default: false,
		type: Boolean,
	});*/
	
	// Custom Skills
	game.settings.registerMenu("dnd4e", "show-custom-skill", {
		name: "SETTINGS.4eShowCustomSkillN",
		label: "SETTINGS.4eShowCustomSkillL",
		hint: "SETTINGS.4eShowCustomSkillH",
		icon: 'fas fa-cog',
		type: CustomSkillConfig,
		restricted: true,
	});

	// Anchor for custom skills input
	game.settings.register("dnd4e", "custom-skills",{
		name: "Custom Skills",
		scope: "world",
		config: false,
		type: Object,
		default: []
	});
	


/*************************/
/** DEFAULT BEHAVIOURS  **/
/*************************/

	// Is Advanced Math Option for NPCs true for new actors
	game.settings.register("dnd4e", "npcMathOptions", {
		name: "SETTINGS.4eNpcMathOptionsN",
		hint: "SETTINGS.4eNpcMathOptionsL",
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});
	
	// Is Auto Generate Power Card Details true for new powers
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

	// Use fast-forward on rolls by default
	game.settings.register("dnd4e", "fastFowardSettings",{
		name: "SETTINGS.4eFastFowardSettingsN",
		hint: "SETTINGS.4eFastFowardSettingsL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});
	
	// Apply effects by selecting or targeting
	game.settings.register("dnd4e", "applyEffectsToSelection",{
		name: "SETTINGS.4eApplyEffectsToSelectionN",
		hint: "SETTINGS.4eApplyEffectsToSelectionL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean,
		onChange: updateApplyEffectsTooltips
	});

	// Confirm deletion of items from sheets
	game.settings.register("dnd4e", "itemDeleteConfirmation",{
		name: "SETTINGS.4eItemDeleteConfirmationN",
		hint: "SETTINGS.4eItemDeleteConfirmationL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});



/*************************/
/**   DISPLAY OPTIONS   **/
/*************************/

	// Collapse Item Card descriptions by default
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
	
	// Prefer stat name or attack bonus in chat card display
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
			"both": "SETTINGS.4eCardAtkDisplayBoth"
		}
	});

	// Show the roll expression formula when making d20 rolls
	game.settings.register("dnd4e", "showRollExpression",{
		name: "SETTINGS.4eShowRollExpressionN",
		hint: "SETTINGS.4eShowRollExpressionL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});

	// Collapse bonuses down when making rolls
	game.settings.register("dnd4e", "collapseSituationalBonus",{
		name: "SETTINGS.4eCollapseSituationalBonusN",
		hint: "SETTINGS.4eCollapseSituationalBonusL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});
	
	// Privacy of ongoing damage reminders/reports
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



/*************************/
/** AUTOMATION SETTINGS **/
/*************************/

	// Automatically roll attack against targeted tokens and report presumed result.
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

	// Show defence values in attack roll chat cards
	game.settings.register("dnd4e", "showDefences",{
		name: "SETTINGS.4eShowDefencesN",
		hint: "SETTINGS.4eShowDefencesL",
		scope: "client",
		config: true,
		default: "none",
		type: String,
		choices: {
			"none": "SETTINGS.4eShowDefencesNone",
			"pcs": "SETTINGS.4eShowDefencesPCs",
			"npcs": "SETTINGS.4eShowDefencesNPCs",
			"all": "SETTINGS.4eShowDefencesAll"
		}
	});

	// Automatically apply effects to targets upen using powers or attacking
	game.settings.register("dnd4e", "autoApplyEffects", {
		name: "SETTINGS.4eAutoApplyEffectsN",
		hint: "SETTINGS.4eAutoApplyEffectsL",
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});

	// Automate universal marking effects
	game.settings.register("dnd4e", "markAutomation",{
		name: "SETTINGS.4eMarkAutomationN",
		hint: "SETTINGS.4eMarkAutomationL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});
	
	// Prompt end-of-turn saves for applied effects
	game.settings.register("dnd4e", "saveReminders",{
		name: "SETTINGS.4eSaveRemindersN",
		hint: "SETTINGS.4eSaveRemindersL",
		scope: "client",
		config: true,
		default: true,
		type: Boolean
	});
	
	// Apply or remind about ongoing damage effects
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



/*************************/
/** DEVELOPER SETTINGS  **/
/*************************/

	// Debug power attack/damage effect bonuses
	game.settings.register("dnd4e", "debugEffectBonus",{
		name: "SETTINGS.4eDebugPowerEffectsN",
		hint: "SETTINGS.4eDebugPowerEffectsL",
		scope: "client",
		config: true,
		default: false,
		type: Boolean
	});



/*************************/
/**      KEYBINDS       **/
/*************************/
	
	// Show player keybind
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
	
};