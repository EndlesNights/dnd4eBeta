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
import ActorSheet4eHazard from "./actor/hazard-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

import { measureDistances, getBarAttribute } from "./canvas.js";
import { _getInitiativeFormula } from "./combat.js";

// Import Documents
import { MeasuredTemplate4e, TemplateLayer4e} from "./pixi/ability-template.js";
import { Ruler4e } from "./pixi/ruler.js";
import { Turns } from "./apps/turns.js";
import { Actor4e } from "./actor/actor.js";
import Item4e from "./item/item-document.js";
import ItemDirectory4e from "./apps/item/item-directory.js";

import { DifficultTerrainRegionBehaviorType, DifficultTerrainShader4e, Region4e } from "./regionBehavoirs/difficult-terrain.js";

import { Helper, handleApplyEffectToToken, handleDeleteEffectToToken, handlePromptEoTSaves, handleAutoDoTs, performPreLocalization} from "./helper.js";

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
import Items4e from "./collection/item-collection.js";

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
			MeasuredTemplate4e
		},
		entities: {
			Actor4e,
			Item4e,
		},
		macros: macros,
		migrations: migrations,
		rollItemMacro: macros.rollItemMacro,
		toggleEffect: macros.toggleEffect
	};

	game.helper = Helper;
	
	// Define custom Entity classes
	CONFIG.DND4E = DND4E;

	DocumentSheetConfig.registerSheet(ActiveEffect, "dnd4e", ActiveEffectConfig4e, {makeDefault :true});
	// DocumentSheetConfig.registerSheet(Actor4e, "dnd4e", ActiveEffectConfig4e, {makeDefault :true});
	CONFIG.ActiveEffect.documentClass = ActiveEffect4e;
	CONFIG.ActiveEffect.legacyTransferral = false;
	CONFIG.Item.collection = Items4e;
	CONFIG.Actor.documentClass = Actor4e;
	CONFIG.Item.documentClass = Item4e;

	CONFIG.statusEffects = CONFIG.DND4E.statusEffect;
	
	// define custom roll extensions
	CONFIG.Dice.rolls.push(MultiAttackRoll);
	CONFIG.Dice.rolls.push(RollWithOriginalExpression);
	
	CONFIG.ui.items = ItemDirectory4e;

	// foundry.data.regionBehaviors.DifficultTerrainRegionBehaviorType = DifficultTerrainRegionBehaviorType;
	// CONFIG.RegionBehavior.documentClass = RegionBehavior4e
	CONFIG.RegionBehavior.dataModels.difficultTerrain = DifficultTerrainRegionBehaviorType;
	HighlightRegionShader = DifficultTerrainShader4e;

	CONFIG.RegionBehavior.typeLabels.difficultTerrain = "DND4E.difficultTerrain.Label";//"DND4E.difficultTerrain.Label";
	CONFIG.RegionBehavior.typeIcons.difficultTerrain = "fa-regular fa-triangle";

	CONFIG.Canvas.rulerClass = Ruler4e;

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
	Actors.registerSheet("dnd4e", ActorSheet4eHazard, {
		types: ["Hazard"],
		label: game.i18n.localize("SHEET.Hazard"),
		makeDefault: true
	});

	
	// Setup Item Sheet
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("dnd4e", ItemSheet4e, {
		makeDefault: true,
		label: game.i18n.localize("SHEET.Item"),
		types: ["weapon", "equipment", "consumable", "tool", "loot", "classFeats", "feat", "raceFeats", "pathFeats", "destinyFeats", "ritual", "power", "feature"]

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

	if(!game.modules.get("lib-wrapper")?.active){
		return console.log("lib-wrapper not active!")
	} else {
		libWrapperInit();
	}

});

/* --------------------------------------------- */

/**
 * Perform one-time pre-localization and sorting of some configuration objects
 */
Hooks.once("i18nInit", function() {
	performPreLocalization(CONFIG.DND4E);
});

Hooks.once("setup", function() {

	// Localize CONFIG objects once up-front
	const toLocalize = [
	"abilities", "abilityActivationTypesShort", 
	"conditionTypes", "distanceUnits", "durationType",
	"damageTypes", "effectTypes",
	"healingTypes", "implement", "itemActionTypes",
	"powerEffectTypes", "powerSource", "powerType", "powerSubtype", "powerUseType",
	"profArmor", "cloth", "light", "heavy", "shield",
	"weaponProficiencies", "simpleM", "simpleR", "militaryM", "militaryR", "superiorM", "superiorR", "improvisedM", "improvisedR",
	"saves", "special", "spoken", "script", "skills", "targetTypes", "timePeriods", "vision", "weaponGroup", "weaponProperties", "weaponType",
	"weaponTypes", "weaponHands", "autoanimationHook"
	];

	const noSort = [
		"abilities", "currencies", "distanceUnits", "durationType", "damageTypes", "itemActionTypes", "limitedUsePeriods", "powerEffectTypes", "powerGroupTypes", "profArmor", "profWeapon", "weaponType", "weaponTypes", "weaponHands"
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
	// Hooks.on("hotbarDrop", (bar, data, slot) => macros.create4eMacro(data, slot));
	Hooks.on("hotbarDrop", (bar, data, slot) => {
		if ( ["Item", "ActiveEffect"].includes(data.type) ) {
			macros.create4eMacro(data, slot);
			return false;
		}
	});

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
	if ( cv && !foundry.utils.isNewerVersion(game.system.flags.needsMigrationVersion, cv) ) return;
  
	const cmv = game.system.flags.compatibleMigrationVersion || "0.2.85";
	// Perform the migration
	if ( cv && foundry.utils.isNewerVersion(cmv, cv) ) {
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
// Also activate buttons on popout messages
Hooks.on("renderChatPopout", (app, html, data) => {
	Item4e.chatListeners(html);
	chat.chatMessageListener(html);
});

Hooks.on("canvasInit", function() {

	// Extend Diagonal Measurement
	canvas.grid.diagonalRule = game.settings.get("dnd4e", "diagonalMovement");
	//BaseGrid#measureDistances is deprecated. Use BaseGrid#measurePath instead
	foundry.grid.SquareGrid.prototype.measureDistances = measureDistances;

	// Extend Token Resource Bars
	Token.prototype.getBarAttribute = getBarAttribute;
});


Hooks.on("renderTokenHUD", (app, html, data) => {
// inject element and script for displaing name of status effect when mousning over
const message = `
<div class="status-effect-title" id="displayStatLine">STATUS EFFECT</div>

<script>
$(".effect-control ").hover(
	function(eventObj) {
		document.getElementById("displayStatLine").innerHTML = eventObj.target.getAttribute('data-tooltip');
		document.getElementById("displayStatLine").classList.add("active");
	},
	function(eventObj) {
		document.getElementById("displayStatLine").innerHTML = '';
		document.getElementById("displayStatLine").classList.remove("active");
	}
);
</script>
`

html.find('.effect-control').last().after(message);
});


function libWrapperInit() {

	// Collection of Overriders for 4e Measure Templates
	libWrapper.register(
		'dnd4e',
		'MeasuredTemplate.prototype._computeShape',
		MeasuredTemplate4e._computeShape
	);
	libWrapper.register(
		'dnd4e',
		'MeasuredTemplate.prototype._refreshRulerText',
		MeasuredTemplate4e._refreshRulerText
	);
	libWrapper.register(
		'dnd4e',
		'MeasuredTemplate.prototype._refreshShape',
		MeasuredTemplate4e._refreshShape
	);
	libWrapper.register(
		'dnd4e',
		'TemplateLayer.prototype._onDragLeftStart',
		TemplateLayer4e._onDragLeftStart
	)
	libWrapper.register(
		'dnd4e',
		'TemplateLayer.prototype._onDragLeftMove',
		TemplateLayer4e._onDragLeftMove
	)

	libWrapper.register(
		'dnd4e',
		'Region.prototype._draw',
		Region4e._draw
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

}

Hooks.on("getSceneControlButtons", function(controls){
	//sets what the default activeTool is
	const templates = controls.templates;
    templates.activeTool = "burst";

	//create additional buttons in measure templates for Burst and Blast
	const tools = templates.tools;
    for (const key in tools){
        tools[key].order += 2;
    }
    tools.burst = {
		name: "burst",
        order: 1,
		title: "Area Burst (Square from Center)",
		icon: "dnd4e-burst-svg",
	}
	tools.blast = {
		name: "blast",
        order: 2,
		title: "Area Blast (Square from corner)",
		icon: "dnd4e-blast-svg",
	}
});

Hooks.on("renderChatMessage", (message, html, data) => {
	try{
		if(message.flags.core?.initiativeRoll === true || message.flags?.dnd4e?.roll?.type == "init"){
			if(html){
				const insertPart = Helper.initTooltip(message.content);
				html[0].innerHTML = html[0].innerHTML.replace(/(<h4 class=\"dice-total\">)[0-9|.]+(<\/h4>)/g,`$1${insertPart}$2`);
			}
		}
	}catch(e){
		console.error(`Inititiave display mask failed in chat message. ${e}`);
	}
});

Hooks.on('renderCombatTracker', (app,html,context) => {
	if (!app?.viewed) return // Skip entirely if there's no currently viewed combat
	try{
		html.find('.token-initiative').each((i,el) => {
			let combatant = app.viewed.combatants.get(el.parentElement.dataset.combatantId);
			if(combatant?.initiative){
				const insertPart = Helper.initTooltip(combatant.initiative);
				el.innerHTML = insertPart;
			}
		});
	}catch(e){
		console.error(`Inititiave display mask failed in combat tracker. ${e}`);
	}
});

Hooks.on('createMeasuredTemplate', async (templateDoc) => {
	if (game.user.id !== templateDoc.author.id) return;
	const originUuid = templateDoc.getFlag('dnd4e', 'origin');
	// Item may be deleted from the actor when we get here, so get the item data from the template if we have to
	const flagDocument = await fromUuid(originUuid) || templateDoc.getFlag('dnd4e', 'item');
	if (!flagDocument || flagDocument.system.autoTarget.mode === 'none') return;
	// If we just have the template flag's item data because the item was deleted, we'll need to work backward from the item uuid to get the actor
	const actorUuid = flagDocument?.actor?.uuid || originUuid.split('.Item')[0];
	if (!actorUuid) return;
	const token = Helper.tokenForActor(await fromUuid(actorUuid));
	if (!token) return;
	let tokens = Helper.getTokensInTemplate(templateDoc, true);
	if (!tokens.size) return;
	const disposition = token.document.disposition;
	const excludeUser = !flagDocument.system.autoTarget.includeSelf || flagDocument.system.autoTarget.mode === 'enemies';
    const targets = new Set();
	for (let targetToken of tokens) {
		if ((excludeUser && targetToken.actor.uuid === actorUuid) || targetToken.actor.statuses.has('dead')) continue;
		switch (flagDocument.system.autoTarget.mode) {
			case 'all':
					targets.add(targetToken.id);
				break;
			case 'allies':
				if (targetToken.document.disposition === disposition) {
					targets.add(targetToken.id);
				}
				break;
			case 'enemies':
				if (targetToken.document.disposition === -1 * disposition) {
					targets.add(targetToken.id);
				}
				break;
		}
	}
    canvas.tokens.setTargets(targets);
});