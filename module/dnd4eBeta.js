/**
 * A simple Beta build of D&D4e game system for the Foundry VTT.
 * Author: EndlesNights
 * Software License: GNU GPLv3
 */

// Import Modules
import { DND4EBETA } from "./config.js";
import { registerSystemSettings } from "./settings.js";

// import { SimpleItemSheet } from "./item-sheet.js";
import ItemSheet4e from "./item/sheet.js";
import { measureDistances, getBarAttribute } from "./canvas.js";
import { _getInitiativeFormula } from "./combat.js";

import ActorSheet4e from "./actor/actor-sheet.js";
import ActorSheet4eNPC from "./actor/npc-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

// Import Entities
import AbilityTemplate from "./pixi/ability-template.js";
import { Actor4e } from "./actor/actor.js";
import Item4e from "./item/entity.js";

// Import Helpers
import * as chat from "./chat.js";
import * as dice from "./dice.js";
import * as macros from "./macros.js";
import * as migrations from "./migration.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
	console.log(`D&D4eBeta | Initializing Dungeons & Dragons 4th Edition System\n${DND4EBETA.ASCII}`);
	
	game.dnd4eBeta = {
		config: DND4EBETA,
		canvas: {
			AbilityTemplate
		},
		entities: {
			Actor4e,
			Item4e,
		},
		macros: macros,
		migrations: migrations,
		rollItemMacro: macros.rollItemMacro
	};
	
	// Define custom Entity classes
	CONFIG.DND4EBETA = DND4EBETA;
	CONFIG.Actor.documentClass = Actor4e;
	CONFIG.Item.documentClass = Item4e;
	
	// CONFIG.statusEffects = CONFIG.DND4EBETA.statusEffectIcons;
	CONFIG.statusEffects = CONFIG.DND4EBETA.statusEffect;
	
	registerSystemSettings();

	CONFIG.Combat.initiative.formula = "1d20 + @attributes.init.value";
	Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;
	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("dnd4eBeta", ActorSheet4e, {
		types: ["Player Character"],
		label: "Basic Character Sheet",
		makeDefault: true
	});
	Actors.registerSheet("dnd4eBeta", ActorSheet4eNPC, {
		types: ["NPC"],
		label: "NPC Sheet",
		makeDefault: true
	});		

	
	Items.unregisterSheet("core", ItemSheet);
	// Items.registerSheet("dnd4eBeta", SimpleItemSheet, {makeDefault: true});
	Items.registerSheet("dnd4eBeta", ItemSheet4e, {makeDefault: true});

	// Register system settings
	// game.settings.register("dnd4eBeta", "macroShorthand", {
	// 	name: "Shortened Macro Syntax",
	// 	hint: "Enable a shortened macro syntax which allows referencing attributes directly, for example @str instead of @attributes.str.value. Disable this setting if you need the ability to reference the full attribute model, for example @attributes.str.label.",
	// 	scope: "world",
	// 	type: Boolean,
	// 	default: true,
	// 	config: true
	// });
	
	// Preload Handlebars Templates
	preloadHandlebarsTemplates();


		// Define dependency on our own custom vue components for when we need it
		// Dlopen.register('actor-sheet', {
		// 	scripts: "/systems/dnd4eBeta/dist/vue-components.min.js",
		// 	// dependencies: [ "vue-select", "vue-numeric-input" ]
		// });
});

Hooks.once("setup", function() {

	// Localize CONFIG objects once up-front
	const toLocalize = [
	"abilities", "abilityActivationTypes", "abilityActivationTypesShort", "abilityConsumptionTypes", "actorSizes",
	"creatureOrigin","creatureRole","creatureRoleSecond","creatureType", "conditionTypes", "consumableTypes", "distanceUnits", "damageTypes", "def", "defensives", "effectTypes", "equipmentTypes", "equipmentTypesArmour", "equipmentTypesArms", "equipmentTypesFeet", "equipmentTypesHands", "equipmentTypesHead", "equipmentTypesNeck", "equipmentTypesWaist", "itemActionTypes", "launchOrder", "limitedUsePeriods", "powerSource", "powerType", "powerUseType", "powerGroupTypes", "powerSortTypes", "rangeType", "saves", "special", "spoken", "script", "skills", "targetTypes", "timePeriods", "vision", "weaponGroup", "weaponProperties", "weaponType", "weaponTypes", "weaponHands"
	];

	const noSort = [
		"abilities", "abilityActivationTypes", "currencies", "distanceUnits", "damageTypes", "equipmentTypesArms", "equipmentTypesFeet", "equipmentTypesHands", "equipmentTypesHead", "equipmentTypesNeck", "equipmentTypesWaist", "itemActionTypes", "limitedUsePeriods", "rangeType", "weaponType", "weaponTypes", "weaponHands"
	];
	
	// const doLocalize = function(obj) {
		// return Object.entries(obj).reduce((obj, e) => {
			// if (typeof e[1] === "string") obj[e[0]] = game.i18n.localize(e[1]);
			// else if (typeof e[1] === "object") obj[e[0]] = doLocalize(e[1]);
			// return obj;
		// }, {});
	// };
	// for ( let o of toLocalize ) {
		// CONFIG.DND4EBETA[o] = doLocalize(CONFIG.DND4EBETA[o]);
	// }
// });
	for ( let o of toLocalize ) {
		const localized = Object.entries(CONFIG.DND4EBETA[o]).map(e => {
			return [e[0], game.i18n.localize(e[1])];
		});
		if ( !noSort.includes(o) ) localized.sort((a, b) => a[1].localeCompare(b[1]));
		CONFIG.DND4EBETA[o] = localized.reduce((obj, e) => {
			obj[e[0]] = e[1];
			return obj;
		}, {});
	}
});
Hooks.once("ready", function() {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => macros.create4eMacro(data, slot));


	// Determine whether a system migration is required and feasible
	if ( !game.user.isGM ) return;
	const currentVersion = game.settings.get("dnd4eBeta", "systemMigrationVersion");
	// console.log(currentVersion)
	const NEEDS_MIGRATION_VERSION = "0.1.4";
	const COMPATIBLE_MIGRATION_VERSION = 0.80;
	const needsMigration = currentVersion && isNewerVersion(NEEDS_MIGRATION_VERSION, currentVersion);
	if ( !needsMigration ) return;

	// Perform the migration
	// if ( currentVersion && isNewerVersion(COMPATIBLE_MIGRATION_VERSION, currentVersion) ) {
	// 	const warning = `Your DnD5e system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`;
	// 	ui.notifications.error(warning, {permanent: true});
	// }
	// migrations.migrateWorld();
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", (app, html, data) => {

	// Display action buttons
	chat.displayChatActionButtons(app, html, data);

	// Highlight critical success or failure die
	chat.highlightCriticalSuccessFailure(app, html, data);

	// Optionally collapse the content
	if (game.settings.get("dnd4eBeta", "autoCollapseItemCards")) html.find(".card-content").hide();
});
Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
Hooks.on("renderChatLog", (app, html, data) => Item4e.chatListeners(html));

Hooks.on("canvasInit", function() {

	// Extend Diagonal Measurement
	canvas.grid.diagonalRule = game.settings.get("dnd4eBeta", "diagonalMovement");
	SquareGrid.prototype.measureDistances = measureDistances;

	// Extend Token Resource Bars
	Token.prototype.getBarAttribute = getBarAttribute;
});