/**
 * A simple  build of D&D4e game system for the Foundry VTT.
 * Author: EndlesNights
 * Software License: GNU GPLv3
 */

// Import Modules
import { DND4E } from "./config.mjs";
import * as applications from "./applications/_module.mjs";
import * as canvas from "./canvas/_module.mjs";
import * as data from "./data/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as rolls from "./rolls/_module.mjs";

// Import Helpers
import * as compatibility from "./compatibility/_module.mjs";
import * as utils from "./utils/utils.mjs";
import * as helpers from "./helpers/_module.mjs";

globalThis.dnd4e = {
	applications,
	canvas,
	compatibility,
	data,
	documents,
	helpers,
	rolls,
	utils,
	CONFIG: DND4E,
};

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
	console.log(`D&D4e | Initializing Dungeons & Dragons 4th Edition System\n${DND4E.ASCII}`);
	
	// Define custom Entity classes
	CONFIG.DND4E = DND4E;

	foundry.applications.apps.DocumentSheetConfig.registerSheet(ActiveEffect, "dnd4e", applications.sheets.ActiveEffectConfig4e, {
		makeDefault: true,
		label: _loc("SHEET.ActiveEffect"),
	});

	CONFIG.ActiveEffect.legacyTransferral = false;
	CONFIG.Item.collection = documents.collections.Items4e;

	CONFIG.ActiveEffect.documentClass = documents.ActiveEffect4e;
	CONFIG.Actor.documentClass = documents.Actor4e;
	CONFIG.Item.documentClass = documents.Item4e;
	CONFIG.ChatMessage.documentClass = documents.ChatMessage4e;
	CONFIG.Combatant.documentClass = documents.Combatant4e;
	CONFIG.Combat.documentClass = documents.Combat4e;
	CONFIG.Token.documentClass = documents.TokenDocument4e;

	CONFIG.ActiveEffect.expiryAction = "delete";
	CONFIG.ActiveEffect.expiryEvents.dayEnd = "DND4E.DurationEndOfDay";
	CONFIG.ActiveEffect.expiryEvents.save = "DND4E.DurationSaveEnd";

	// define custom roll extensions
	CONFIG.Dice.rolls = [rolls.Roll4e, rolls.RollWithOriginalExpression, rolls.MultiAttackRoll];
	CONFIG.Dice.functions.scale = utils.scaleFn;
	
	CONFIG.ui.items = applications.sidebar.tabs.ItemDirectory4e;

	CONFIG.Token.objectClass = canvas.placeables.Token4e;

	CONFIG.Token.movement.TerrainData = data.TerrainData4e;
	CONFIG.Token.rulerClass = canvas.placeables.tokens.TokenRuler4e;

	CONFIG.Token.movement.actions.shift = {
		label: "DND4E.TOKEN.MOVEMENT.ACTIONS.shift.label",
		icon: "fa-solid fa-person-walking",
		img: "systems/dnd4e/icons/ui/shift.svg",
		order: 2,
		teleport: false,
		measure: true,
		walls: "move",
		visualize: true,
		deriveTerrainDifficulty: null,
	},
	CONFIG.Token.movement.actions.climb.order = 3;
	CONFIG.Token.movement.actions.swim.order = 4;
	CONFIG.Token.movement.actions.burrow.order = 5;
	CONFIG.Token.movement.actions.fly.order = 6;
	CONFIG.Token.movement.actions.teleport = {
		label: "DND4E.TOKEN.MOVEMENT.ACTIONS.teleport.label",
		icon: "fa-solid fa-person-from-portal",
		img: "icons/svg/teleport.svg",
		order: 7,
		teleport: true,
		measure: true,
		walls: "move",
		visualize: true,
	},
	delete CONFIG.Token.movement.actions.blink;
	delete CONFIG.Token.movement.actions.crawl;
	delete CONFIG.Token.movement.actions.jump;

	// System data types
	CONFIG.ActiveEffect.dataModels = {
		base: data.activeEffect.ActiveEffectData,
	};
	CONFIG.Actor.dataModels = {
		"Player Character": data.actor.CharacterData,
		NPC: data.actor.NPCData,
		Hazard: data.actor.HazardData,
	};
	CONFIG.Item.dataModels = {
		backpack: data.item.BackpackData,
		consumable: data.item.ConsumableData,
		equipment: data.item.EquipmentData,
		feature: data.item.FeatureData,
		loot: data.item.LootData,
		power: data.item.PowerData,
		ritual: data.item.RitualData,
		tool: data.item.ToolData,
		weapon: data.item.WeaponData,
	};

	CONFIG.RegionBehavior.dataModels.applyActiveEffect4e = data.regionBehavior.ApplyActiveEffect4eRegionBehaviorType;
	CONFIG.RegionBehavior.dataModels.damagingRegion = data.regionBehavior.DamagingRegionRegionBehaviorType;
	CONFIG.RegionBehavior.dataModels.difficultTerrain = data.regionBehavior.DifficultTerrainRegionBehaviorType;

	CONFIG.RegionBehavior.typeLabels.applyActiveEffect4e = "DND4E.applyActiveEffect4e.Label";
	CONFIG.RegionBehavior.typeIcons.applyActiveEffect4e = "fa-solid fa-person-rays";
	CONFIG.RegionBehavior.typeLabels.damagingRegion = "DND4E.damagingRegion.Label";
	CONFIG.RegionBehavior.typeIcons.damagingRegion = "fas fa-burst";
	CONFIG.RegionBehavior.typeLabels.difficultTerrain = "DND4E.difficultTerrain.Label";
	CONFIG.RegionBehavior.typeIcons.difficultTerrain = "difficult-terrain-icon";

	helpers.settings.registerSystemSettings();

	CONFIG.Combat.initiative.formula = "1d20 + @attributes.init.value";
	// Register sheet application classes
	foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
	foundry.documents.collections.Actors.registerSheet("dnd4e", applications.sheets.ActorSheet4e, {
		types: ["Player Character"],
		label: _loc("SHEET.Character.Basic"),
		makeDefault: true,
	});
	foundry.documents.collections.Actors.registerSheet("dnd4e", applications.sheets.ActorSheet4eNPC, {
		types: ["NPC"],
		label: _loc("SHEET.NPC"),
		makeDefault: true,
	});
	foundry.documents.collections.Actors.registerSheet("dnd4e", applications.sheets.ActorSheet4eHazard, {
		types: ["Hazard"],
		label: _loc("SHEET.Hazard"),
		makeDefault: true,
	});

	foundry.applications.apps.DocumentSheetConfig.unregisterSheet(RegionBehavior, "core", foundry.applications.sheets.RegionBehaviorConfig, {
		types: ["difficultTerrain"],
	});
	foundry.applications.apps.DocumentSheetConfig.registerSheet(RegionBehavior, "dnd4e", applications.sheets.DifficultTerrainConfig, {
		label: "DND4E.difficultTerrain.Label",
		types: ["difficultTerrain"],
	});
	
	// Setup Item Sheet
	foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
	foundry.documents.collections.Items.registerSheet("dnd4e", applications.sheets.ItemSheet4e, {
		makeDefault: true,
		label: _loc("SHEET.Item"),
		types: ["weapon", "equipment", "consumable", "tool", "loot", "ritual", "power", "feature", "backpack"],

	});
	
	// Items.registerSheet("dnd4e", ContainerItemSheet,{
	// 	makeDefault: true,
	// 	label: "Container Sheet",//_loc("SHEET.Item"),
	// 	types: ["backpack"]
	// });

	// Add conditional CSS
	var head = document.getElementsByTagName("HEAD")[0];

	// Preload Handlebars Templates
	utils.registerHandlebarsHelpers();
	helpers.templates.preloadHandlebarsTemplates();

	helpers.customization.customSkillSetup();

	helpers.customization.customStatusSetup();
	CONFIG.statusEffects = Object.entries(CONFIG.DND4E.statusEffect).reduce((arr, [id, data]) => {
		const newEffect = {
			id,
			...data,
		};
		arr.push(newEffect);
		return arr;
	}, []);

	// Set up token movement actions
	documents.TokenDocument4e.registerMovementActions();
	
	// Custom movement cost aggregator
	CONFIG.Token.movement.costAggregator = (results, distance, segment) => {
		return Math.max(...results.map(i => i.cost));
	};

	// Enrichers
	// Register enrichers
	CONFIG.TextEditor.enrichers = [
		applications.ux.enrichers.roll,
		applications.ux.enrichers.lookup,
	];
});

/* --------------------------------------------- */

/**
 * Perform one-time pre-localization and sorting of some configuration objects
 */
Hooks.once("i18nInit", function() {
	utils.performPreLocalization(CONFIG.DND4E);
});

Hooks.once("ready", function() {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	// Hooks.on("hotbarDrop", (bar, data, slot) => macros.create4eMacro(data, slot));
	Hooks.on("hotbarDrop", (bar, data, slot) => {
		if (["Item", "ActiveEffect"].includes(data.type)) {
			helpers.macros.create4eMacro(data, slot);
			return false;
		}
	});

	// Add socket listener for applying activeEffects on targets that users do not own
	game.socket.on("system.dnd4e", (data) => {
		if (data.operation === "applyTokenEffect") utils.handleApplyEffectToToken(data);
		else if (data.operation === "deleteTokenEffect") utils.handleDeleteEffectToToken(data);
		else if (data.operation === "promptEoTSaves") utils.handlePromptEoTSaves(data);
		else if (data.operation === "autoDoTs") utils.handleAutoDoTs(data);
		else if (data.operation === "refreshSaveEffects") utils.handleRefreshSaveEffects(data);
		else if (data.operation === "refreshDayEndEffects") utils.handleRefreshDayEndEffects(data);
		else applications.sheets.ItemSheet4e._handleShareItem(data);
	});

	// Determine whether a system migration is required and feasible
	if (!game.user.isGM) return;
	const cv = game.settings.get("dnd4e", "systemMigrationVersion") || game.world.flags.dnd4e?.version;
	const totalDocuments = game.actors.size + game.scenes.size + game.items.size;
	if (!cv && (totalDocuments === 0)) return game.settings.set("dnd4e", "systemMigrationVersion", game.system.version);
	if (cv && !foundry.utils.isNewerVersion(game.system.flags.needsMigrationVersion, cv)) return;
  
	const cmv = game.system.flags.compatibleMigrationVersion || "0.2.85";
	// Perform the migration
	if (cv && foundry.utils.isNewerVersion(cmv, cv)) {
		ui.notifications.error(_loc("MIGRATION.4eVersionTooOldWarning"), { permanent: true });
	}

	data.migration.migrateWorld(cv);
});

/* -------------------------------------------- */
/*  Other Hooks                                 */
/* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", (message, html, data) => {
	// Display action buttons
	helpers.chat.displayChatActionButtons(message, html, data);

	// Highlight critical success or failure die
	helpers.chat.highlightCriticalSuccessFailure(message, html, data);

	// hide damage buttons on d20 rolls
	helpers.chat.displayDamageOptionButtons(message, html, data);

	// Optionally collapse the content
	if (game.settings.get("dnd4e", "autoCollapseItemCards")) html.querySelectorAll(".card-content").forEach(el => el.style.display = "none");	

	// Mask tiebreaker digits in initiave roll display
	try {
		if ((message.flags.core?.initiativeRoll === true) || (message.flags?.dnd4e?.roll?.type == "init")) {
			if (html) {
				const insertPart = utils.initTooltip(message.content);
				html.innerHTML = html.innerHTML.replace(/(<h4 class="dice-total">)[0-9|.]+(<\/h4>)/g, `$1${insertPart}$2`);
			}
		}
	} catch(e) {
		console.error(`Inititiave display mask failed in chat message. ${e}`);
	}

	//Item listeners
	documents.Item4e.chatListeners(html);
	helpers.chat.chatMessageListener(html);
});

Hooks.on("getChatMessageContextOptions", helpers.chat.addChatMessageContextOptions);

Hooks.on("renderChatLog", (app, element, context) => {
	// Revert Foundy's bizarre decision to force light theme in chat
	try {
		const chatScheme = game.settings.get("dnd4e", "chatScheme");
		const UIchoice = game.settings.get("core", "uiConfig").colorScheme?.interface || null;
		if ((chatScheme === "dark") || ((chatScheme === "auto") && (UIchoice === "dark"))) {
			const chatLog = element.querySelector(".chat-log");
			chatLog.classList.add("theme-dark");
			chatLog.classList.remove("theme-light");
		}
	} catch(e) {
		console.error(`Failed to update chat log theme. ${e}`);
	}	
});

// Also activate buttons on popout messages
Hooks.on("renderChatPopout", (app, html, data) => {
	documents.Item4e.chatListeners(html);
	helpers.chat.chatMessageListener(html);
});

Hooks.on("renderCombatTracker", (app, html, context) => {
	// Mask initaitive tiebreaker digits in combat tracker
	if (!app?.viewed) return; // Skip entirely if there's no currently viewed combat
	try {
		html.querySelectorAll(".token-initiative").forEach((el) => {
			let combatant = app.viewed.combatants.get(el.parentElement.dataset.combatantId);
			if (combatant?.initiative) {
				const insertPart = utils.initTooltip(combatant.initiative);
				el.innerHTML = insertPart;
			}
		});
	} catch(e) {
		console.error(`Inititiave display mask failed in combat tracker. ${e}`);
	}
});

Hooks.on("createRegion", async (regionDoc) => {
	if (!regionDoc.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return;
	const originUuid = regionDoc.getFlag("dnd4e", "origin");
	const actorUuid = regionDoc.getFlag("dnd4e", "actorUuid");
	// Item may be deleted from the actor when we get here, so get the item data from the template if we have to
	const flagDocument = await fromUuid(originUuid) || regionDoc.getFlag("dnd4e", "item");
	if (!flagDocument || (flagDocument.system.autoTarget.mode === "none")) return;
	if (!actorUuid) return;
	const token = utils.tokenForActor(await fromUuid(actorUuid));
	if (!token) return;
	let tokens = new Set();
	for (const token of game.canvas.scene.tokens) {
		if (token.testInsideRegion(regionDoc)) tokens.add(token);
	}
	if (!tokens.size) return;
	const disposition = token.document.disposition;
	const excludeUser = !flagDocument.system.autoTarget.includeSelf || (flagDocument.system.autoTarget.mode === "enemies");
	const targets = new Set();
	for (let targetToken of tokens) {
		if ((excludeUser && (targetToken.actor.uuid === actorUuid)) || targetToken.actor.statuses.has("dead")) continue;
		switch (flagDocument.system.autoTarget.mode) {
			case "all":
				targets.add(targetToken.id);
				break;
			case "allies":
				if (targetToken.disposition === disposition) {
					targets.add(targetToken.id);
				}
				break;
			case "enemies":
				if (targetToken.disposition === -1 * disposition) {
					targets.add(targetToken.id);
				}
				break;
		}
	}
	game.canvas.tokens.setTargets(targets);
});

Hooks.on("targetToken", canvas.placeables.Token4e.onTargetToken);

// TODO: Remove when Foundry bug is fixed
Hooks.on("deleteCombat", combat => {
	if (!canvas.ready) return;
	const token = combat.combatant?.token;
	if (!token?.rendered) return;
	token.object.renderFlags.set({ refreshTurnMarker: true });
});
