/**
 * A simple  build of D&D4e game system for the Foundry VTT.
 * Author: EndlesNights
 * Software License: GNU GPLv3
 */

// Import Modules
import { DND4E } from "./config.js";
import { registerSystemSettings } from "./settings.js";

// import Sheets
import ItemSheet4e from "./item/item-sheet.js";
import ActorSheet4e from "./actor/actor-sheet.js";
import ActorSheet4eNPC from "./actor/npc-sheet.js";
import ActorSheet4eHazard from "./actor/hazard-sheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

import Combat4e from "./combat.js";

// Import Documents
import { MeasuredTemplate4e, TemplateLayer4e} from "./canvas/ability-template.js";
import { default as TokenRuler4e } from "./canvas/ruler.js";
import { Actor4e } from "./actor/actor.js";
import { default as TokenDocument4e } from "./documents/token.js";
import { default as Token4e } from "./canvas/token.js";
import Item4e from "./item/item.js";
import ItemDirectory4e from "./apps/item/item-directory.js";

import { default as DifficultTerrainRegionBehaviorType } from "./regionBehavoirs/difficult-terrain.js";
import { default as TerrainData4e } from "./regionBehavoirs/terrain-data.js";
import { default as DifficultTerrainConfig} from "./apps/regionBehaviors/difficult-terrain-config.js"

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
import Combatant4e from "./combatant.js";
import Roll4e from "./dice/Roll.js";
import CharacterData from "./data/actor/character.js";
import NPCData from "./data/actor/npc.js";
import HazardData from "./data/actor/hazard.js";
import BackpackData from "./data/item/backpack.js";
import ConsumableData from "./data/item/consumable.js";
import EquipmentData from "./data/item/equipment.js";
import FeatureData from "./data/item/feature.js";
import LootData from "./data/item/loot.js";
import PowerData from "./data/item/power.js";
import RitualData from "./data/item/ritual.js";
import ToolData from "./data/item/tool.js";
import WeaponData from "./data/item/weapon.js";

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

	foundry.applications.apps.DocumentSheetConfig.registerSheet(ActiveEffect, "dnd4e", ActiveEffectConfig4e, {makeDefault :true});
	// DocumentSheetConfig.registerSheet(Actor4e, "dnd4e", ActiveEffectConfig4e, {makeDefault :true});
	CONFIG.ActiveEffect.documentClass = ActiveEffect4e;
	CONFIG.ActiveEffect.legacyTransferral = false;
	CONFIG.Item.collection = Items4e;
	CONFIG.Actor.documentClass = Actor4e;
	CONFIG.Item.documentClass = Item4e;
	CONFIG.Combatant.documentClass = Combatant4e;
	CONFIG.Combat.documentClass = Combat4e;

	CONFIG.MeasuredTemplate.objectClass = MeasuredTemplate4e;

	CONFIG.Canvas.layers.templates.layerClass = TemplateLayer4e;

	CONFIG.statusEffects = Object.entries(CONFIG.DND4E.statusEffect).reduce((arr, [id, data]) => {
		const newEffect = {
			id,
			...data
		};
		arr.push(newEffect);
		return arr;
	}, []);
	
	// define custom roll extensions
	CONFIG.Dice.rolls = [Roll4e];
	CONFIG.Dice.rolls.push(MultiAttackRoll);
	CONFIG.Dice.rolls.push(RollWithOriginalExpression);
	
	CONFIG.ui.items = ItemDirectory4e;

	CONFIG.Token.objectClass = Token4e;
	CONFIG.Token.documentClass = TokenDocument4e;
	CONFIG.Token.movement.TerrainData = TerrainData4e;
	CONFIG.Token.rulerClass = TokenRuler4e;

	CONFIG.Token.movement.actions.charge = {
		"label": "DND4E.TOKEN.MOVEMENT.ACTIONS.charge.label",
		"icon": "fa-solid fa-person-walking",
		"img": "systems/dnd4e/icons/ui/charging-bull.svg",
		"order": 1,
		"teleport": false,
		"measure": true,
		"walls": "move",
		"visualize": true,
		"deriveTerrainDifficulty": null
	},
	CONFIG.Token.movement.actions.shift = {
		"label": "DND4E.TOKEN.MOVEMENT.ACTIONS.shift.label",
		"icon": "fa-solid fa-person-walking",
		"img": "systems/dnd4e/icons/ui/suspicious.svg",
		"order": 2,
		"teleport": false,
		"measure": true,
		"walls": "move",
		"visualize": true,
		"deriveTerrainDifficulty": null
	},
	CONFIG.Token.movement.actions.climb.order = 3;
	CONFIG.Token.movement.actions.swim.order = 4;
	CONFIG.Token.movement.actions.burrow.order = 5;
	CONFIG.Token.movement.actions.fly.order = 6;
	CONFIG.Token.movement.actions.teleport = {
		"label": "DND4E.TOKEN.MOVEMENT.ACTIONS.teleport.label",
		"icon": "fa-solid fa-person-from-portal",
		"img": "icons/svg/teleport.svg",
		"order": 7,
		"teleport": true,
		"measure": true,
		"walls": "move",
		"visualize": true
	},
	delete CONFIG.Token.movement.actions.blink;
	delete CONFIG.Token.movement.actions.crawl;
	delete CONFIG.Token.movement.actions.jump;

	// System data types
	CONFIG.Actor.dataModels = {
		"Player Character": CharacterData,
		NPC: NPCData,
		Hazard: HazardData
	};
	CONFIG.Item.dataModels = {
		backpack: BackpackData,
		consumable: ConsumableData,
		equipment: EquipmentData,
		feature: FeatureData,
		loot: LootData,
		power: PowerData,
		ritual: RitualData,
		tool: ToolData,
		weapon: WeaponData
	};

	// foundry.data.regionBehaviors.DifficultTerrainRegionBehaviorType = DifficultTerrainRegionBehaviorType;
	// CONFIG.RegionBehavior.documentClass = RegionBehavior4e
	CONFIG.RegionBehavior.dataModels.difficultTerrain = DifficultTerrainRegionBehaviorType;
	// Object.assign(CONFIG.RegionBehavior.dataModels, { DifficultTerrainRegionBehaviorType });
	// HighlightRegionShader = DifficultTerrainShader4e;

	CONFIG.RegionBehavior.typeLabels.difficultTerrain = "DND4E.difficultTerrain.Label";//"DND4E.difficultTerrain.Label";
	CONFIG.RegionBehavior.typeIcons.difficultTerrain = "difficult-terrain-icon";

	registerSystemSettings();

	CONFIG.Combat.initiative.formula = "1d20 + @attributes.init.value";
	// Register sheet application classes
	foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
	foundry.documents.collections.Actors.registerSheet("dnd4e", ActorSheet4e, {
		types: ["Player Character"],
		label: game.i18n.localize("SHEET.Character.Basic"),
		makeDefault: true
	});
	foundry.documents.collections.Actors.registerSheet("dnd4e", ActorSheet4eNPC, {
		types: ["NPC"],
		label: game.i18n.localize("SHEET.NPC"),
		makeDefault: true
	});
	foundry.documents.collections.Actors.registerSheet("dnd4e", ActorSheet4eHazard, {
		types: ["Hazard"],
		label: game.i18n.localize("SHEET.Hazard"),
		makeDefault: true
	});

	foundry.applications.apps.DocumentSheetConfig.unregisterSheet(RegionBehavior, "core", foundry.applications.sheets.RegionBehaviorConfig, {
		types: ["difficultTerrain"]
	});
	foundry.applications.apps.DocumentSheetConfig.registerSheet(RegionBehavior, "dnd4e", DifficultTerrainConfig, {
		label: "DND4E.difficultTerrain.Label",
		types: ["difficultTerrain"]
	});

	
	// Setup Item Sheet
	foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
	foundry.documents.collections.Items.registerSheet("dnd4e", ItemSheet4e, {
		makeDefault: true,
		label: game.i18n.localize("SHEET.Item"),
		types: ["weapon", "equipment", "consumable", "tool", "loot", "ritual", "power", "feature", "backpack"]

	});
	
	// Items.registerSheet("dnd4e", ContainerItemSheet,{
	// 	makeDefault: true,
	// 	label: "Container Sheet",//game.i18n.localize("SHEET.Item"),
	// 	types: ["backpack"]
	// });


	// Add conditional CSS
	var head = document.getElementsByTagName('HEAD')[0];

	// Preload Handlebars Templates
	preloadHandlebarsTemplates();

	// setup methods that allow for easy integration with token hud
	game.dnd4e.tokenBarHooks = TokenBarHooks
	//legacy, remove after some time when its reasonable for people to have updated token bar
	game.dnd4e.quickSave = (actor) => game.dnd4e.tokenBarHooks.quickSave(actor, null)

	customSKillSetUp();

	 // Set up token movement actions
  	TokenDocument4e.registerMovementActions();
	
	// Custom movement cost aggregator
	CONFIG.Token.movement.costAggregator = (results, distance, segment) => {
		return Math.max(...results.map(i => i.cost));
	};
});

/* --------------------------------------------- */

/**
 * Perform one-time pre-localization and sorting of some configuration objects
 */
Hooks.once("i18nInit", function() {
	performPreLocalization(CONFIG.DND4E);
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

Hooks.on("renderChatMessageHTML", (message, html, data) => {
	// Display action buttons
	chat.displayChatActionButtons(message, html, data);

	// Highlight critical success or failure die
	chat.highlightCriticalSuccessFailure(message, html, data);

	// hide damage buttons on d20 rolls
	chat.displayDamageOptionButtons(message, html, data)

	// Optionally collapse the content
	if (game.settings.get("dnd4e", "autoCollapseItemCards")) html.querySelectorAll(".card-content").forEach(el => el.style.display = "none");	

	// Mask tiebreaker digits in initiave roll display
	try{
		if(message.flags.core?.initiativeRoll === true || message.flags?.dnd4e?.roll?.type == "init"){
			if(html){
				const insertPart = Helper.initTooltip(message.content);
				html.innerHTML = html.innerHTML.replace(/(<h4 class=\"dice-total\">)[0-9|.]+(<\/h4>)/g,`$1${insertPart}$2`);
			}
		}
	}catch(e){
		console.error(`Inititiave display mask failed in chat message. ${e}`);
	}

});

Hooks.on("getChatMessageContextOptions", chat.addChatMessageContextOptions);

Hooks.on("renderChatLog", (app, html, context) => {
	// Revert Foundy's bizarre decision to force light theme in chat
	try{
		const colourScheme = game.settings.get(`core`,`uiConfig`).colorScheme?.interface || null;
		if(colourScheme === 'dark'){			
			const newHTML = html.innerHTML.replace(/<ol class=\"chat-log plain themed theme-light/g,'<ol class=\"chat-log plain themed theme-dark');
			if(newHTML != html.innerHTML){
				html.innerHTML = newHTML;
			}
		}
	}catch(e){
		console.error(`Failed to update chat log theme. ${e}`);
	}
	
	//Item listeners
	Item4e.chatListeners(html);
	chat.chatMessageListener(html);	
});

// Also activate buttons on popout messages
Hooks.on("renderChatPopout", (app, html, data) => {
	Item4e.chatListeners(html);
	chat.chatMessageListener(html);
});

Hooks.on("renderTokenHUD", (app, html, data) => {
	// inject element and script for displaying name of status effect when mousing over
	const messageTemplate = document.createElement("template");
	messageTemplate.innerHTML = `
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
		`;
	const messageElement = messageTemplate.content.children[0];

	html.querySelectorAll(".effect-control").forEach(el => {
		el.addEventListener("mouseenter", (eventObj) => {
			messageElement.innerHTML = eventObj.target.getAttribute("data-tooltip-text");
			messageElement.classList.add("active");
		});
		el.addEventListener("mouseleave", (eventObj) => {
			messageElement.innerHTML = "";
			messageElement.classList.remove("active");
		});
	});
	[...html.querySelectorAll(".effect-control")].at(-1).after(messageElement);
});

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

Hooks.on('renderCombatTracker', (app,html,context) => {
	// Mask initaitive tiebreaker digits in combat tracker
	if (!app?.viewed) return // Skip entirely if there's no currently viewed combat
	try{
		html.querySelectorAll('.token-initiative').forEach((el) => {
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

// Compatibility hook for Aura Effects to prevent aura effects from expiring based on aura origin's turn
Hooks.on('preCreateActiveEffect', async (effect) => {
	if (effect.flags.auraeffects?.fromAura || effect.flags.ActiveAuras?.applied) {
		const updates = {
			'flags.dnd4e.effectData.durationType': "custom",
			'flags.dnd4e.effectData.startTurnInit': null,
			'flags.dnd4e.effectData.durationTurnInit': null,
			'flags.dnd4e.effectData.durationRound': null,
		};
		effect.updateSource(updates);
	}
});

Hooks.on("targetToken", Token4e.onTargetToken);

// TODO: Remove when Foundry bug is fixed
Hooks.on("deleteCombat", combat => {
  if ( !canvas.ready ) return;
  const token = combat.combatant?.token;
  if ( !token?.rendered ) return;
  token.object.renderFlags.set({refreshTurnMarker: true});
});