/**
 * A simple  build of D&D4e game system for the Foundry VTT.
 * Author: EndlesNights
 * Software License: GNU GPLv3
 */

// Import Modules
import { DND4E } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import {libWrapper} from './libWrapper-shim.js';

// import Sheets
import ItemSheet4e from "./item/item-sheet.js";
import ContainerItemSheet from "./item/container-sheet.js";
import ActorSheet4e from "./actor/actor-sheet.js";
import ActorSheet4eNPC from "./actor/npc-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

import { measureDistances, getBarAttribute } from "./canvas.js";
import { _getInitiativeFormula } from "./combat.js";

// Import Documents
import AbilityTemplate from "./pixi/ability-template.js";
import { Turns } from "./apps/turns.js";
import { Actor4e } from "./actor/actor.js";
import Item4e from "./item/item-document.js";
import ItemDirectory4e from "./apps/item/item-directory.js";

import { Helper, handleApplyEffectToToken, handleDeleteEffectToToken, handlePromptEoTSaves, handleAutoDoTs } from "./helper.js";

// Import Helpers
import * as chat from "./chat.js";
import * as macros from "./macros.js";
import * as migrations from "./migration.js";
import ActiveEffect4e from "./effects/effects.js";
import ActiveEffectConfig4e from "./effects/effects-config.js";
import {MultiAttackRoll} from "./roll/multi-attack-roll.js";
import {RollWithOriginalExpression} from "./roll/roll-with-expression.js";
import {TokenBarHooks} from "./hooks.js";
import { customSKillSetUp } from "./skills/custom-skills.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
	console.log(`D&D4e | Initializing Dungeons & Dragons 4th Edition System\n${DND4E.ASCII}`);

	game.dnd4e = {
		apps: {
			ActiveEffectConfig4e
		},
		config: DND4E,
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
	CONFIG.DND4E = DND4E;

	DocumentSheetConfig.registerSheet(ActiveEffect, "dnd4e", ActiveEffectConfig4e, {makeDefault :true});
	// DocumentSheetConfig.registerSheet(Actor4e, "dnd4e", ActiveEffectConfig4e, {makeDefault :true});
	CONFIG.ActiveEffect.documentClass = ActiveEffect4e;
	CONFIG.ActiveEffect.legacyTransferral = false;
	
	CONFIG.Actor.documentClass = Actor4e;
	CONFIG.Item.documentClass = Item4e;

	CONFIG.statusEffects = CONFIG.DND4E.statusEffect;
	
	// define custom roll extensions
	CONFIG.Dice.rolls.push(MultiAttackRoll);
	CONFIG.Dice.rolls.push(RollWithOriginalExpression);
	
	CONFIG.ui.items = ItemDirectory4e;

	registerSystemSettings();

	CONFIG.Combat.initiative.formula = "1d20 + @attributes.init.value";
	Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;
	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("dnd4e", ActorSheet4e, {
		types: ["Player Character"],
		label: game.i18n.localize("SHEET.Character.Basic"),
		makeDefault: true
	});
	Actors.registerSheet("dnd4e", ActorSheet4eNPC, {
		types: ["NPC"],
		label: game.i18n.localize("SHEET.NPC"),
		makeDefault: true
	});		

	
	// Setup Item Sheet
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("dnd4e", ItemSheet4e, {
		makeDefault: true,
		label: game.i18n.localize("SHEET.Item"),
		types: ["weapon", "equipment", "consumable", "tool", "loot", "classFeats", "feat", "raceFeats", "pathFeats", "destinyFeats", "ritual", "power"]

	});
	
	Items.registerSheet("dnd4e", ContainerItemSheet,{
		makeDefault: true,
		label: "Container Sheet",//game.i18n.localize("SHEET.Item"),
		types: ["backpack"]
	});


	// Add conditional CSS
	var head = document.getElementsByTagName('HEAD')[0];
	
	if (game.settings.get("dnd4e","darkMode")){
		var link = document.createElement('link');
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.href = './systems/dnd4e/styles/dnd4e-DarkMode.css';
		//Append link element to HTML head
		head.appendChild(link);
	}

	// Preload Handlebars Templates
	preloadHandlebarsTemplates();

	// setup methods that allow for easy integration with token hud
	game.dnd4e.tokenBarHooks = TokenBarHooks
	//legacy, remove after some time when its reasonable for people to have updated token bar
	game.dnd4e.quickSave = (actor) => game.dnd4e.tokenBarHooks.quickSave(actor, null)

	customSKillSetUp();
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
	"weaponTypes", "weaponHands", "autoanimationHook"
	];

	const noSort = [
		"abilities", "abilityActivationTypes", "currencies", "distanceUnits", "durationType", "damageTypes", "equipmentTypesArms", "equipmentTypesFeet", "equipmentTypesHands", "equipmentTypesHead", "equipmentTypesNeck", "equipmentTypesWaist", "itemActionTypes", "limitedUsePeriods", "powerEffectTypes", "powerGroupTypes", "profArmor", "profWeapon","rangeType", "weaponType", "weaponTypes", "weaponHands"
	];
	
	for ( let o of toLocalize ) {
		const localized = Object.entries(CONFIG.DND4E[o]).map(e => {
			return [e[0], game.i18n.localize(e[1])];
		});
		if ( !noSort.includes(o) ) localized.sort((a, b) => a[1].localeCompare(b[1]));
		CONFIG.DND4E[o] = localized.reduce((obj, e) => {
			obj[e[0]] = e[1];
			return obj;
		}, {});
	}	

});
Hooks.once("ready",  function() {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => macros.create4eMacro(data, slot));

		// Add socket listener for applying activeEffects on targets that users do not own
		game.socket.on('system.dnd4e', (data) => {
			if(data.operation === 'applyTokenEffect') handleApplyEffectToToken(data);
			else if(data.operation === 'deleteTokenEffect') handleDeleteEffectToToken(data);
			else if(data.operation === 'promptEoTSaves') handlePromptEoTSaves(data);
			else if(data.operation === 'autoDoTs') handleAutoDoTs(data);
			else ItemSheet4e._handleShareItem(data);
		});

	// Determine whether a system migration is required and feasible
	if ( !game.user.isGM ) return;
	const cv = game.settings.get("dnd4e", "systemMigrationVersion") || game.world.flags.dnd4e?.version;
	const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
	if ( !cv && totalDocuments === 0 ) return game.settings.set("dnd4e", "systemMigrationVersion", game.system.version);
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
	if (game.settings.get("dnd4e", "autoCollapseItemCards")) html.find(".card-content").hide();
});

Hooks.on("getChatLogEntryContext", chat.addChatMessageContextOptions);
Hooks.on("renderChatLog", (app, html, data) => {
	Item4e.chatListeners(html);
	chat.chatMessageListener(html);
});

Hooks.on("canvasInit", function() {

	// Extend Diagonal Measurement
	canvas.grid.diagonalRule = game.settings.get("dnd4e", "diagonalMovement");
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


Hooks.once('init', async function() {

	libWrapper.register(
		'dnd4e',
		'MeasuredTemplate.prototype._computeShape',
		AbilityTemplate._computeShape
	);

	libWrapper.register(
		'dnd4e',
		'MeasuredTemplate.prototype._refreshRulerText',
		AbilityTemplate._refreshRulerBurst
	);

	libWrapper.register(
		'dnd4e',
		'TemplateLayer.prototype._onDragLeftStart',
		AbilityTemplate._onDragLeftStart
	)
	
	libWrapper.register(
		'dnd4e',
		'Combat.prototype.nextTurn',
		Turns._onNextTurn
	)

	libWrapper.register(
		'dnd4e',
		'ChatLog.prototype._onDiceRollClick',
		chat._onDiceRollClick
	)

	libWrapper.register(
		'dnd4e',
		'ChatLog.prototype._processDiceCommand',
		chat._processDiceCommand
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
