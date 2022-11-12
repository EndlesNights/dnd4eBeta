/**
 * A simple Beta build of D&D4e game system for the Foundry VTT.
 * Author: EndlesNights
 * Software License: GNU GPLv3
 */

// Import Modules
import { DND4EALTUS } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import {libWrapper} from './libWrapper-shim.js';

// import { SimpleItemSheet } from "./item-sheet.js";
import ItemSheet4e from "./item/sheet.js";
import { measureDistances, getBarAttribute } from "./canvas.js";
import { _getInitiativeFormula } from "./combat.js";

import ActorSheet4e from "./actor/actor-sheet.js";
import ActorSheet4eNPC from "./actor/npc-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

// Import Entities
import AbilityTemplate from "./pixi/ability-template.js";
import { Turns } from "./apps/turns.js";
import { Actor4e } from "./actor/actor.js";
import Item4e from "./item/entity.js";

import { Helper, handleApplyEffectToToken } from "./helper.js"

// Import Helpers
import * as chat from "./chat.js";
import * as macros from "./macros.js";
import * as migrations from "./migration.js";
import ActiveEffect4e from "./effects/effects.js";
import ActiveEffectConfig4e from "./effects/effects-config.js";
import {MultiAttackRoll} from "./roll/multi-attack-roll.js";
import {RollWithOriginalExpression} from "./roll/roll-with-expression.js";
import {TokenBarHooks} from "./hooks.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
	console.log(`D&D4eBeta | Initializing Dungeons & Dragons 4th Edition System\n${DND4EALTUS.ASCII}`);

	game.dnd4eAltus = {
		apps: {
			ActiveEffectConfig4e
		},
		config: DND4EALTUS,
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

	game.helper = Helper;
	
	// Define custom Entity classes
	CONFIG.DND4EALTUS = DND4EALTUS;

	DocumentSheetConfig.registerSheet(ActiveEffect, "dnd4eAltus", ActiveEffectConfig4e, {makeDefault :true});
	// DocumentSheetConfig.registerSheet(Actor4e, "dnd4eAltus", ActiveEffectConfig4e, {makeDefault :true});
	CONFIG.ActiveEffect.documentClass = ActiveEffect4e;
	
	CONFIG.Actor.documentClass = Actor4e;
	CONFIG.Item.documentClass = Item4e;

	CONFIG.statusEffects = CONFIG.DND4EALTUS.statusEffect;
	
	// define custom roll extensions
	CONFIG.Dice.rolls.push(MultiAttackRoll);
	CONFIG.Dice.rolls.push(RollWithOriginalExpression);
	
	registerSystemSettings();

	CONFIG.Combat.initiative.formula = "1d20 + @attributes.init.value";
	Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;
	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("dnd4eAltus", ActorSheet4e, {
		types: ["Player Character"],
		label: "Basic Character Sheet",
		makeDefault: true
	});
	Actors.registerSheet("dnd4eAltus", ActorSheet4eNPC, {
		types: ["NPC"],
		label: "NPC Sheet",
		makeDefault: true
	});		

	
	// Setup Item Sheet
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("dnd4eAltus", ItemSheet4e, {makeDefault: true});

	// Preload Handlebars Templates
	preloadHandlebarsTemplates();

	// setup methods that allow for easy integration with token hud
	game.dnd4eAltus.tokenBarHooks = TokenBarHooks
	//legacy, remove after some time when its reasonable for people to have updated token bar
	game.dnd4eAltus.quickSave = (actor) => game.dnd4eAltus.tokenBarHooks.quickSave(actor, null)
});

Hooks.once("setup", function() {

	// Localize CONFIG objects once up-front
	const toLocalize = [
	"abilities", "abilityActivationTypes", "abilityActivationTypesShort", "abilityConsumptionTypes", "actorSizes",
	"creatureOrigin","creatureRole","creatureRoleSecond","creatureType", "conditionTypes", "consumableTypes", "distanceUnits", "durationType",
	"damageTypes", "def", "defensives", "effectTypes", "equipmentTypes", "equipmentTypesArmour", "equipmentTypesArms", "equipmentTypesFeet",
	"equipmentTypesHands", "equipmentTypesHead", "equipmentTypesNeck", "equipmentTypesWaist", "featureSortTypes", "healingTypes", "implement", "itemActionTypes",
	"launchOrder", "limitedUsePeriods", "powerEffectTypes", "powerSource", "powerType", "powerSubtype", "powerUseType", "powerGroupTypes", "powerSortTypes",
	"profArmor", "cloth", "light", "heavy", "shield",
	"weaponProficiencies", "simpleM", "simpleR", "militaryM", "militaryR", "superiorM", "superiorR", "improvisedM", "improvisedR","rangeType", "rangeTypeNoWeapon",
	"saves", "special", "spoken", "script", "skills", "targetTypes", "timePeriods", "vision", "weaponGroup", "weaponProperties", "weaponType",
	"weaponTypes", "weaponHands"
	];

	const noSort = [
		"abilities", "abilityActivationTypes", "currencies", "distanceUnits", "durationType", "damageTypes", "equipmentTypesArms", "equipmentTypesFeet", "equipmentTypesHands", "equipmentTypesHead", "equipmentTypesNeck", "equipmentTypesWaist", "itemActionTypes", "limitedUsePeriods", "powerEffectTypes", "powerGroupTypes", "profArmor", "profWeapon","rangeType", "weaponType", "weaponTypes", "weaponHands"
	];
	
	for ( let o of toLocalize ) {
		const localized = Object.entries(CONFIG.DND4EALTUS[o]).map(e => {
			return [e[0], game.i18n.localize(e[1])];
		});
		if ( !noSort.includes(o) ) localized.sort((a, b) => a[1].localeCompare(b[1]));
		CONFIG.DND4EALTUS[o] = localized.reduce((obj, e) => {
			obj[e[0]] = e[1];
			return obj;
		}, {});
	}



});
Hooks.once("ready",  function() {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => macros.create4eMacro(data, slot));

		// Add socket listener for applying activeEffects on targets that users do not own
		game.socket.on('system.dnd4eAltus', (data) => {
			if(data.operation === 'applyTokenEffect') handleApplyEffectToToken(data);
			else ItemSheet4e._handleShareItem(data);
		});

	// Determine whether a system migration is required and feasible
	if ( !game.user.isGM ) return;
	const cv = game.settings.get("dnd4eAltus", "systemMigrationVersion") || game.world.flags.dnd4eAltus?.version;
	const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
	if ( !cv && totalDocuments === 0 ) return game.settings.set("dnd4eAltus", "systemMigrationVersion", game.system.version);
	if ( cv && !isNewerVersion(game.system.flags.needsMigrationVersion, cv) ) return;
  
	const cmv = game.system.flags.compatibleMigrationVersion || "0.2.85";
	// Perform the migration
	if ( cv && isNewerVersion(cmv, cv) ) {
	  ui.notifications.error(game.i18n.localize("MIGRATION.4eVersionTooOldWarning"), {permanent: true});
	}
	
	migrations.migrateWorld();
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", (app, html, data) => {

	// Display action buttons
	chat.displayChatActionButtons(app, html, data);

	// Highlight critical success or failure die
	chat.highlightCriticalSuccessFailure(app, html, data);

	// hide damage buttons on d20 rolls
	chat.displayDamageOptionButtons(app, html, data)

	// Optionally collapse the content
	if (game.settings.get("dnd4eAltus", "autoCollapseItemCards")) html.find(".card-content").hide();
});

Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
Hooks.on("renderChatLog", (app, html, data) => {
	Item4e.chatListeners(html);
	chat.clickRollMessageDamageChatListener(html);
});

Hooks.on("canvasInit", function() {

	// Extend Diagonal Measurement
	canvas.grid.diagonalRule = game.settings.get("dnd4eAltus", "diagonalMovement");
	SquareGrid.prototype.measureDistances = measureDistances;

	// Extend Token Resource Bars
	Token.prototype.getBarAttribute = getBarAttribute;
});


Hooks.on("renderTokenHUD", (app, html, data) => {
//Display name of status effect when mousning over
const message = `
<div class="status-effect-title" id="displayStatLine" >STATUS EFFECT</div>

<script>
var statusName
$(".effect-control ").hover(
	function(eventObj) {
		statusName = eventObj.target.title;
		document.getElementById("displayStatLine").innerHTML = statusName;
		eventObj.target.title = '';
		document.getElementById("displayStatLine").classList.add("active");
	},
	function(eventObj) {
		eventObj.target.title = statusName;
		document.getElementById("displayStatLine").innerHTML = '';
		document.getElementById("displayStatLine").classList.remove("active");
	}
);
</script>
`

html.find('.effect-control').last().after(message);
});

/**
 * Before passing changes to the parent ActiveEffect class,
 * we want to make some modifications to make the effect
 * rolldata aware.
 * 
 * @param {*} wrapped   The next call in the libWrapper chain
 * @param {Actor} owner     The Actor that is affected by the effect
 * @param {Object} change    The changeset to be applied with the Effect
 * @returns 
 */
const apply = (wrapped, owner, change) => {
	
  const stringDiceFormat = /\d+d\d+/;
    
  // If the user wants to use the rolldata format
  // for grabbing data keys, why stop them?
  // This is purely syntactic sugar, and for folks
  // who copy-paste values between the key and value
  // fields.
  if (change.key.indexOf('@') === 0)
    change.key = change.key.replace('@', '');

  // If the user entered a dice formula, I really doubt they're 
  // looking to add a random number between X and Y every time
  // the Effect is applied, so we treat dice formulas as normal
  // strings.
  // For anything else, we use Roll.replaceFormulaData to handle
  // fetching of data fields from the actor, as well as math
  // operations.  
  if (!change.value.match(stringDiceFormat))
    change.value = Roll.replaceFormulaData(change.value, owner.getRollData());

  // If it'll evaluate, we'll send the evaluated result along 
  // for the change.
  // Otherwise we just send along the exact string we were given. 
  try {
    change.value = Roll.safeEval(change.value).toString();
  } catch (e) { /* noop */ }

  return wrapped(owner, change);
}

Hooks.once('init', async function() {

	libWrapper.register(
		'dnd4eAltus',
		'ActiveEffect.prototype.apply',
		apply
	);

	libWrapper.register(
		'dnd4eAltus',
		'MeasuredTemplate.prototype._getCircleShape',
		AbilityTemplate._getCircleSquareShape
	);

	libWrapper.register(
		'dnd4eAltus',
		'MeasuredTemplate.prototype._refreshRulerText',
		AbilityTemplate._refreshRulerBurst
	);

	libWrapper.register(
		'dnd4eAltus',
		'TemplateLayer.prototype._onDragLeftStart',
		AbilityTemplate._onDragLeftStart
	)
	
	libWrapper.register(
		'dnd4eAltus',
		'Combat.prototype.nextTurn',
		Turns._onNextTurn
	)
});

Hooks.on("getSceneControlButtons", function(controls){
	//create addtioanl button in measure templates for burst
	controls[1].tools.splice(controls[2].tools.length-1,0,{
		name: "rectCenter",
		title: "Square Template from the Center",
		icon: "fas fa-external-link-square-alt",
		onClick: toggled => canvas.templates._setWallCollision = toggled
  })
})

