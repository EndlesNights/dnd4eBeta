import { DND4E } from "../config.js";
import { SecondWindDialog } from "../apps/second-wind.js";
import { ActionPointDialog } from "../apps/action-point.js";
import { ShortRestDialog } from "../apps/short-rest.js";
import { LongRestDialog } from "../apps/long-rest.js";
import { DeathSaveDialog } from "../apps/death-save.js";
import { SaveThrowDialog } from "../apps/save-throw.js";
import { AttributeBonusDialog } from "../apps/attribute-bonuses.js";
import { CustomRolldDescriptions } from "../apps/custom-roll-descriptions.js";
import { MovementDialog } from "../apps/movement-dialog.js";
import { EncumbranceDialog } from "../apps/encumbrance-dialog.js";
import { HealMenuDialog } from "../apps/heal-menu-dialog.js";
import TraitSelector from "../apps/trait-selector.js";
import TraitSelectorValues from "../apps/trait-selector-sense.js";
import ConBonConfig from "../apps/con-bon-config.js";
// import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ActiveEffect4e from "../effects/effects.js";
import HPOptions from "../apps/hp-options.js";
import { Helper } from "../helper.js";
import {ActionPointExtraDialog} from "../apps/action-point-extra.js";
import Item4e from "../item/item.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class ActorSheet4e extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
	#dragDrop;
	#expandedItemIds;

	get dragDrop() {
		return this.#dragDrop;
	}

	constructor(...args) {
		super(...args);

		/**
		 * Track the set of item filters which are applied
		 * @type {Set}
		 */
		this._filters = {
			inventory: new Set(),
			powers: new Set(),
			features: new Set(),
			rituals: new Set()
		};

		this.#dragDrop = this.#createDragDropHandlers();
		this.#expandedItemIds = new Set();
	}

	static DEFAULT_OPTIONS = {
		classes: ["dnd4e","actor","default"],
		position: {
			width: 844,
			height: 967
		},
		window: {
			resizable: true
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false
		},
		dragDrop: [
			{dragSelector: ".item-list .item", dropSelector: null}
		],
		actions: {
			displayActorArt: ActorSheet4e.#onDisplayActorArt,
			itemSummary: ActorSheet4e.#onItemSummary,
			cycleSkillProficiency: { handler: ActorSheet4e.#onCycleSkillProficiency, buttons: [0, 2] },
			editImage: ActorSheet4e.#onEditImage,
			rollSkillCheck: ActorSheet4e.#onRollSkillCheck,
			rollPassiveCheck: ActorSheet4e.#onRollPassiveCheck,
			rollAbilityCheck: ActorSheet4e.#onRollAbilityCheck,
			rollDefenceCheck: ActorSheet4e.#onRollDefenceCheck,
			hpOptions: ActorSheet4e.#onHPOptions,
			abilityBonus: ActorSheet4e.#onAbilityBonus,
			skillBonus: ActorSheet4e.#onSkillBonus,
			deathSaveBonus: ActorSheet4e.#onDeathSaveBonus,
			savingThrowBonus: ActorSheet4e.#onSavingThrowBonus,
			surgeBonus: ActorSheet4e.#onSurgeBonus,
			surgeEnv: ActorSheet4e.#onSurgeEnv,
			secondWindBonus: ActorSheet4e.#onSecondWindBonus,
			defencesBonus: ActorSheet4e.#onDefencesBonus,
			initiativeBonus: ActorSheet4e.#onInitiativeBonus,
			passiveBonus: ActorSheet4e.#onPassiveBonus,
			modifiersBonus: ActorSheet4e.#onModifiersBonus,
			resistancesBonus: ActorSheet4e.#onResistancesBonus,
			movementDialog: ActorSheet4e.#onMovementDialog,
			customRollDescriptions: ActorSheet4e.#onCustomRolldDescriptions,
			secondWind: ActorSheet4e.#onSecondWind,
			healMenu: ActorSheet4e.#onHealMenuDialog,
			actionPoint: ActorSheet4e.#onActionPointDialog,
			actionPointExtra: ActorSheet4e.#onActionPointExtraDialog,
			shortRest: ActorSheet4e.#onShortRest,
			longRest: ActorSheet4e.#onLongRest,
			deathSave: ActorSheet4e.#onDeathSave,
			savingThrow: ActorSheet4e.#onSavingThrow,
			rollInitiative: ActorSheet4e.#onrollInitiative,
			traitSelector: ActorSheet4e.#onTraitSelector,
			traitSelectorWeapon: ActorSheet4e.#onTraitSelectorWeapon,
			traitSelectorSenses: ActorSheet4e.#onTraitSelectorSenses,
			listStringInput: ActorSheet4e.#onListStringInput,
			itemCreate: ActorSheet4e.#onItemCreate,
			itemEdit: ActorSheet4e.#onItemEdit,
			itemDelete: ActorSheet4e.#onItemDelete,
			itemImport: ActorSheet4e.#onItemImport,
			itemToggle: ActorSheet4e.#onItemToggle,
			itemRoll: ActorSheet4e.#onItemRoll,
			itemRecharge: ActorSheet4e.#onItemRecharge,
			powerCreate: ActorSheet4e.#onPowerCreate,
			manageActiveEffect: ActorSheet4e.#onManageActiveEffect,
			convertCurrency: ActorSheet4e.#onConvertCurrency,
			// TODO V14: Test this when the Active Effect sheet is updated:
			rollEffectSave: ActorSheet4e.#onRollEffectSave,
			encumbranceDialog: ActorSheet4e.#onEncumbranceDialog,
			conBonConfig: ActorSheet4e.#onConBonConfig
		}
	}

	static PARTS = {
		sheet: {
			template: "systems/dnd4e/templates/actors/actor-sheet.hbs",
			scrollable: [
				".inventory",
				".features",
				".powers",
				".section--sidebar",
				".section--tabs-content",
				"section.tab"
			],
			templates: [
				"systems/dnd4e/templates/actors/tabs/biography.hbs",
				"systems/dnd4e/templates/actors/tabs/details.hbs",
				"systems/dnd4e/templates/actors/tabs/inventory.hbs",
				"systems/dnd4e/templates/actors/tabs/features.hbs",
				"systems/dnd4e/templates/actors/tabs/powers.hbs",
				"systems/dnd4e/templates/actors/tabs/rituals.hbs",
				"systems/dnd4e/templates/actors/tabs/effects.hbs",
				"templates/generic/tab-navigation.hbs"
			]
		}
	}

	static TABS = {
		sheet: {
			tabs: [
				{id: "biography", label: "DND4E.Sheet.Biography"},
				{id: "details", label: "DND4E.Sheet.Details"},
				{id: "inventory", label: "DND4E.Sheet.Inventory"},
				{id: "features", label: "DND4E.Sheet.Features"},
				{id: "powers", label: "DND4E.Sheet.Powers"},
				{id: "rituals", label: "DND4E.Sheet.Rituals"},
				{id: "effects", label: "DND4E.Sheet.Effects"}
			],
			initial: "powers"
		}
	}

	/* -------------------------------------------- */

	_filterHelper(target, listSelector) {
		const filter = target.value.toUpperCase();
		const lists = this.element.querySelectorAll(listSelector);

		for (const list of lists) {
			const lis = list.querySelectorAll("li");
			for (const li of lis) {
				const el = li.querySelector(".item-title");
				const textValue = (el?.textContent || el?.innerText) ?? "";
				li.style.display = textValue.toUpperCase().includes(filter) ? "" : "none";
			}
		}
	}

	async _onRender(context, options) {
		await super._onRender(context, options);

		this.#dragDrop.forEach((d) => d.bind(this.element));

		// Removed: on focus <input>, auto-select everything in it

		this.element.querySelector("#filterInput-feat")?.addEventListener("input", (ev) => {
			this._filterHelper(ev.target, ".feature-list");
		});

		this.element.querySelector("#filterInput-power")?.addEventListener("input", (ev) => {
			this._filterHelper(ev.target, ".power-list");
		});

		this.element.querySelector("#filterInput-ritual")?.addEventListener("input", (ev) => {
			this._filterHelper(ev.target, ".ritual-list")
		})

		// TODO: AppV2 this stuff properly (add to `DEFAULT_OPTIONS.actions` and set `data-action` on the proper elements)

		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		const html = this.element;
	
		if ( this.actor.isOwner ) {
			//Inventory & Item management
			html.querySelectorAll('.item-uses input').forEach(el => el.addEventListener("change", this._onUsesChange.bind(this)));
			
			html.querySelectorAll('.item-roll').forEach(el => {
				el.addEventListener("mouseenter", this._onItemHoverEntry.bind(this));
				el.addEventListener("mouseleave", this._onItemHoverExit.bind(this));
			});
			
			// Context Menus
			new CONFIG.ux.ContextMenu(html, ".item-list .item", [], {onOpen: this._onItemContext.bind(this), jQuery: false, fixed: true});
		}

		//Disables and adds warning to input fields that are being modfied by active effects
		for ( const override of this._getAllActorOverrides(["system.details.surges.value"]) ) {
			html.querySelectorAll(`input[name="${override}"],select[name="${override}"]`).forEach((el) => {
				el.disabled = true;
				el.dataset.tooltip = "DND4E.ActiveEffectOverrideWarning";
			});
		}
	}
	
	_initializeApplicationOptions(options) {
		options = super._initializeApplicationOptions(options);
		const numCustomSkills = game.settings.get("dnd4e", "custom-skills")?.length;
		if (numCustomSkills) {
			options.position.height += numCustomSkills * 27;
		}
		return options;
	}

	#createDragDropHandlers() {
		return (this.options.dragDrop ?? []).map((d) => {
			d.permissions = {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this),
			};
			d.callbacks = {
				dragstart: this._onDragStart.bind(this),
				dragover: this._onDragOver.bind(this),
				drop: this._onDrop.bind(this),
			};
			return new foundry.applications.ux.DragDrop.implementation(d);
		});
	}

	_onDragStart(event) {
		const docRow = event.currentTarget.closest("li");
		if ("link" in event.target.dataset) return;

		if (!docRow) return;

		const dragData = this._getEmbeddedDocument(docRow)?.toDragData();
		if (!dragData) return;

		event.dataTransfer?.setData("text/plain", JSON.stringify(dragData));
	}

	_getEmbeddedDocument(target) {
		const docRow = target.closest("li[data-item-id], li[data-effect-id]");
		if (!docRow) return;
		if (docRow.dataset.itemId) {
			return this.document.items.get(docRow.dataset.itemId);
		} else {
			const parentId = docRow.dataset.parentId;
			const parent =
				parentId && (parentId !== this.document.id)
					? this.document.items.get(parentId)
					: this.document;
			return parent.effects.get(docRow.dataset.effectId);
		}
	}

	_onChangeForm(formConfig, event) {
		const input = event.target;
		if (input.dataset?.dtype !== "Number") {
			return super._onChangeForm(formConfig, event);
		}

		const value = input.value;

		if(/^[0-9]+$/.test(value)) {
			return super._onChangeForm(formConfig, event);
		}
		
		if(!/^[\-=+ 0-9]+$/.test(value)) {
			input.value = foundry.utils.getProperty(this.actor, input.name)
			return super._onChangeForm(formConfig, event);
		}

		if ( ["+"].includes(value[0]) ) {
			let delta = parseFloat(value.replace(/[^0-9]/g, ""));
			input.value = foundry.utils.getProperty(this.actor, input.name) + delta ?? foundry.utils.getProperty(this.actor, input.name);
		} else if ( ["-"].includes(value[0]) ) {
			let delta = parseFloat(-value.replace(/[^0-9]/g, ""));
			input.value = foundry.utils.getProperty(this.actor, input.name) + delta ?? foundry.utils.getProperty(this.actor, input.name);
		} else if ( value[0] === "=" ) {
			input.value = value.replace(/[^\-0-9]/g, "");
		} else{
			input.value = foundry.utils.getProperty(this.actor, input.name)
		}
		return super._onChangeForm(formConfig, event);
	}

  /* -------------------------------------------- */

  /**
   * A set of item types that should be prevented from being dropped on this type of actor sheet.
   * @type {Set<string>}
   */
   static unsupportedItemTypes = new Set();

  /* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		const actor = this.actor;
		const actorData = actor.system;
		actorData.details.isBloodied = actor.system.details.isBloodied;

		const isOwner = this.actor.isOwner;

		foundry.utils.mergeObject(context, {
			owner: isOwner,
			limited: this.actor.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: isOwner ? "editable" : "locked",
			isCharacter: actor.type === "Player Character",
			isNPC: actor.type === "NPC",
			isCreature: ["NPC","Player Character"].includes(actor.type),
			isCombatant: ["NPC","Player Character","Hazard"].includes(actor.type),
			hasWealth: ["NPC","Player Character"].includes(actor.type),
			hasSpeed: ["NPC","Player Character"].includes(actor.type),
			config: CONFIG.DND4E,
			// rollData: this.actor.getRollData(),
			actor,
			actorData,
			system: actorData
		});

		context.items = actor.items
			.filter(i => !this.actor.items.has(i.system.container))
			.sort((a, b) => (a.sort || 0) - (b.sort || 0))
			.map(i => i.toObject(false));

		for (let i of context.items) {
			const item = actor.items.get(i._id);
			i.keywords = item.keywords;
			i.labels = item.labels;
			i.chatData = await item.getChatData({secrets: actor.isOwner})
			if (item.type === "power" && item.system.autoGenChatPowerCard) {
				let attackBonus = null;
				if(item.hasAttack){
					attackBonus = await item.getAttackBonus();
				}
				let detailsText = Helper._preparePowerCardData(i.chatData, CONFIG, actor, attackBonus);
				i.detailsText = await foundry.applications.ux.TextEditor.implementation.enrichHTML(detailsText, {
					async: true,
					relativeTo: actor
				});
			}
			i.collapsed = !this.#expandedItemIds.has(i._id); 
		}

		this._prepareItems(context);

		context.effects = ActiveEffect4e.prepareActiveEffectCategories(actor.getActiveEffects());

		if (context.isCombatant) {
			context.skills = this._prepareSkills();
			
			if(Object.entries(game.dnd4e.config.coreSkills).length != Object.entries(context.skills).length){
				const skillNames = Object.keys(context.skills);

				// Sort the skill names based on the label property
				skillNames.sort((a, b) => context.skills[a].label?.localeCompare(context.skills[b].label));
				
				const sortedSkills = skillNames.reduce((acc, skillName) => {
				  acc[skillName] = context.skills[skillName];
				  return acc;
				}, {});
				
				context.skills = sortedSkills;
			}

			for ( let [d, def] of Object.entries(actorData.defences)) {
				def.label = def.label ? def.label: DND4E.defensives[d].abbreviation;
			}

			for ( let [a, abl] of Object.entries(actorData.abilities)) {
				abl.label = abl.label ? abl.label: DND4E.abilities[a];
			}
			
			this._prepareDataSave(actorData.details,
				{"saves": CONFIG.DND4E.saves}
			);
		}

		if (context.isCharacter) {
			context.armourProfs = this._prepareDataProfs(actorData.details?.armourProf,
				{"profArmor": CONFIG.DND4E.profArmor}
			);
			context.weaponProfs = this._prepareDataProfs(actorData.details?.weaponProf,
				{ weapons:Object.assign(
					CONFIG.DND4E.weaponProficiencies,
					CONFIG.DND4E.simpleM,
					CONFIG.DND4E.simpleR,
					CONFIG.DND4E.militaryM,
					CONFIG.DND4E.militaryR,
					CONFIG.DND4E.superiorM,
					CONFIG.DND4E.superiorR,
					CONFIG.DND4E.improvisedM,
					CONFIG.DND4E.improvisedR
				)}
			);
			context.implementProfs = this._prepareDataProfs(actorData.details?.implementProf, 
			{ implement:Object.assign(
					CONFIG.DND4E.implementProficiencies
				)}
			);
			// Resources
			actorData.resources = ["primary", "secondary", "tertiary"].reduce((obj, r) => {
				const res = actorData.resources[r] || {};
				res.name = r;
				res.placeholder = game.i18n.localize("DND4E.Resource"+r.titleCase());
				if (res.max <= 0 && !res.label) {
					delete res.max;
					delete res.value;
				} else if (res.value < 0) {
					res.value = 0;
				}
				obj[r] = res
				return obj;
			}, {});
		}

		if (context.hasWealth) {
			context.currencyGoldSum = this._currencyGoldSumLabel();
		}

		if (context.isCreature) {
			actorData.size = DND4E.actorSizes;

			context.senses = this._prepareDataSenses();
			
			context.languages = this._prepareDataLanguages();
	
			context.biographyHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(context.system.biography, {
				secrets: isOwner,
				async: true,
				relativeTo: actor
			});
		}

		if (context.hasSpeed) {
			this._prepareMovement(context);
		}

		if (actorData.encumbrance) {
			const {value, max} = actorData.encumbrance;
			actorData.encumbrance = {
				...actorData.encumbrance,
				pbc: Math.clamp((value / max) * 100, 0, 99.7),
				pec: Math.clamp((value / max) * 100 - 100, 1, 99.7),
				encumBar: value > max ? "#b72b2b" : "#6c8aa5"
			};
		}

		context.system = actorData;

		context.systemFields = actor.system.schema.fields;

		return context;
	}

	_prepareDataSenses() {
		const map = {special: CONFIG.DND4E.special};
		const senses = foundry.utils.deepClone(this.actor.system.senses);
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = senses[l];
			if ( !trait ) continue;
			let values = Object.keys(trait).map((key) => [key, trait[key]])
			trait.selected = values.reduce((obj, l) => {
				if (!l[1].value) return obj;
				obj[l[0]] = l[1].range != "" ? `${choices[l[0]]} ${l[1].range} sq` : choices[l[0]];
				return obj;
			}, {});
			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
		}
		return senses;
	}
	
	_prepareDataLanguages() {
		const map = {"spoken": CONFIG.DND4E.spoken, "script": CONFIG.DND4E.script}
		const languages = foundry.utils.deepClone(this.actor.system.languages);
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = languages[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = Array.from(trait.value);
			}
			trait.selected = values.reduce((obj, l) => {
				obj[l] = choices[l];
				return obj;
			}, {});

			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
		}
		return languages;
	}

	_prepareDataProfs(data, map){
		const profs = foundry.utils.deepClone(data);
		for ( let [l, choices] of Object.entries(map) ) {

			let values = [];
			if ( profs.value ) {
				values = Array.from(profs.value);
			}
			profs.selected = values.reduce((obj, l) => {
				obj[l] = choices[l];
				return obj;
			}, {});
			profs.selected

			// Add custom entry
			if ( profs.custom ) {
				profs.custom.split(";").forEach((c, i) => profs.selected[`custom${i+1}`] = c.trim());
			}
			profs.cssClass = !foundry.utils.isEmpty(profs.selected) ? "" : "inactive";
		}
		return profs;
	}

	_prepareItems(data) {
		//define different item datasets
		const inventory = this.#configItemToDisplayConfig(DND4E.inventoryTypes);
		const features = this.#configItemToDisplayConfig(DND4E.featureTypes);
		const powers = this._generatePowerGroups();
		const rituals = this.#configItemToDisplayConfig(DND4E.ritualTypes);
		
		// Partition items by category
		let [items, pow, feats, rits] = data.items.reduce((arr, item) => {
			// Item details
			item.img ||= DEFAULT_TOKEN;
			item.isStack = Number.isNumeric(item.system.quantity) && (item.system.quantity !== 1);

			//Causing error in v10, only getter no setter now.
			// item.hasTarget = !!item.data.target && !(["none",""].includes(item.data.target.type));
			// item.hasTarget = !!item.system.target && !(["none",""].includes(item.system.target.type));
			
			//item.isDepleted = item.isOnCooldown && (item.system.uses?.per && (item.system.uses?.value > 0));

			// Item toggle state
			this._prepareItemToggleState(item);

			// Classify items into types
			if ( Object.keys(inventory).includes(item.type ) ) arr[0].push(item);
			// else if ( Object.keys(powers).includes(item.type ) ) arr[1].push(item);
			else if ( item.type === "feature" ) arr[2].push(item);
			else if ( item.type === "ritual" ) arr[3].push(item);
			else if ( item.type === "power" ) arr[1].push(item);
			return arr;
		}, [[], [], [], [], []]);

		// Apply active item filters
		items = this._filterItems(items, this._filters.inventory);
		pow = this._filterItems(pow, this._filters.powers);
		feats = this._filterItems(feats, this._filters.features);
		rits = this._filterItems(rits, this._filters.rituals);

		// Organize items
		for ( let i of items ) {
			const item = this.actor.items.get(i._id);
			i.system.quantity = item.system.quantity || 0;
			i.system.weight = item.system.weight || 0;
			i.totalWeight = item.totalWeight;
			i.totalWeightLabel = i.totalWeight.toNearest(0.01);
			i.system.preparedMaxUses = item.system.preparedMaxUses;
			this._checkItemAvailable(i);
			i.hasUses = item.system.uses && (item.system.preparedMaxUses > 0) && (item.system.uses.per != '');
			i.isDepleted = i.hasUses && (item.system.uses.value === 0);
			i.isUnavailable = i.isDepleted || i.system.notAvailable || (['weapon','equipment'].includes(item.type) && !item.system.equipped) ;
			inventory[i.type].items.push(i);
		}

		for ( let f of feats ) {
			features[f.system.featureType].items.push(f);
		}

		for ( let p of pow ) {
			const power = this.actor.items.get(p._id);
			p.system.preparedMaxUses = power.system.preparedMaxUses;
			this._checkItemAvailable(p);
			p.hasUses = power.system.uses && (power.system.preparedMaxUses > 0) && (power.system.uses.per != '');
			p.isDepleted = p.hasUses && p.system.uses.value === 0;
			p.isUnavailable = p.isDepleted || p.system.notAvailable;
			powers[this._groupPowers(p,powers)].items.push(p);
		}
		
		for ( let r of rits ) {
			const ritual = this.actor.items.get(r._id);
			this._checkItemAvailable(r);
			r.isUnavailable = r.system?.notAvailable || false;
			rituals[r.system.category].items.push(r);
		}

		data.inventory = Object.values(inventory);
		data.powers = Object.values(powers);
		data.features = Object.values(features);
		data.rituals = Object.values(rituals);

		for (const [key, group] of Object.entries(powers)) {
			group.items?.forEach(item => {
				this._preparePowerRangeText(item);
			});
		}

		this._sortInventory(inventory);
		this._sortPowers(powers);
		this._sortFeatures(features);
		this._sortRituals(rituals);

	}

	_prepareSkills() {
		return Object.fromEntries(Object.entries(this.actor.system.skills).map(([s, skl]) => ([s, {
			...skl,
			icon: this._getTrainingIcon(skl.training),
			hover: game.i18n.localize(DND4E.trainingLevels[skl.training]),
			label: skl.label ?? DND4E.skills[s]?.label
		}])));
	}
	
	_prepareMovement(data) {
		if (!data.hasSpeed) return;
		data.moveDisplay = `${parseInt(data.system.movement.walk.value)} ${game.i18n.localize("DND4E.Movement.Unit")}`;
		if(data.system.movement.walk?.traits && this.actor.type != "Player Character") data.moveDisplay += ` (${data.system.movement.walk.traits})`;
		data.moveTip = `<p style="text-align:left">
		${parseInt(data.system.movement.walk.value)} ${game.i18n.localize("DND4E.Movement.Unit")} ${game.i18n.format('DND4E.Movement.SpeedType',{mode: game.i18n.localize("DND4E.Movement.Walk")})}`;
		if(data.system.movement.walk?.traits) data.moveTip += ` (${data.system.movement.walk.traits})`;
		data.moveTip += `<br />+${parseInt(data.system.movement.run.value)} ${game.i18n.localize("DND4E.Movement.Unit")} ${game.i18n.localize("DND4E.Movement.Run")}`;
		if(data.system.movement.run?.traits) data.moveTip += ` (${data.system.movement.run.traits})`;
		data.moveTip += `<br />${parseInt(data.system.movement.charge.value)} ${game.i18n.localize("DND4E.Movement.Unit")} ${game.i18n.format('DND4E.Movement.SpeedType',{mode: game.i18n.localize("DND4E.Movement.Charge")})}`;
		if(data.system.movement.charge?.traits) data.moveTip += ` (${data.system.movement.charge.traits})`;
		data.moveTip += `<br />${parseInt(data.system.movement.shift.value)} ${game.i18n.localize("DND4E.Movement.Unit")} ${game.i18n.format('DND4E.Movement.SpeedType',{mode: game.i18n.localize("DND4E.Movement.Shift")})}`;
		if(data.system.movement.shift?.traits) data.moveTip += ` (${data.system.movement.shift.traits})`;
		/*if(data.system.movement.burrow.value) data.moveTip += `<br>${parseInt(data.system.movement.burrow.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedBurrowing")}`;
		if(data.system.movement.climb.value) data.moveTip += `<br>${parseInt(data.system.movement.climb.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedClimbing")}`;
		if(data.system.movement.fly.value) data.moveTip += `<br>${parseInt(data.system.movement.fly.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedFlying")}`;
		if(data.system.movement.swim.value) data.moveTip += `<br>${parseInt(data.system.movement.swim.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedSwimming")}`
		if(data.system.movement.teleport.value) data.moveTip += `<br>${parseInt(data.system.movement.teleport.value)} ${game.i18n.localize("DND4E.MovementUnit")} ${game.i18n.localize("DND4E.MovementSpeedTeleporting")}`*/;

		const moveModes = ['burrow','climb','fly','swim','teleport'];
		for (let m of moveModes){
			if(data.system.movement[m].value > 0){
				data.moveTip += `<br />${parseInt(data.system.movement[m].value)} ${game.i18n.localize("DND4E.Movement.Unit")} ${game.i18n.format('DND4E.Movement.SpeedType',{mode: CONFIG.DND4E.movementTypes[m].label})}`;
				if(data.system.movement[m]?.traits) data.moveTip += ` (${data.system.movement[m].traits})`;
				if(this.actor.type != "Player Character"){
					data.moveDisplay += `, <span class="move-mode">${CONFIG.DND4E.movementTypes[m].label} ${parseInt(data.system.movement[m].value)} ${game.i18n.localize("DND4E.Movement.Unit")}`;
					if(data.system.movement[m]?.traits) data.moveDisplay += ` (${data.system.movement[m].traits})`;
					data.moveDisplay += `</span>`;
				}
			}
		}
		if(this.actor.type != "Player Character" && data.system.movement.shift.value > 1) data.moveDisplay += `, <span class="move-mode">${game.i18n.localize('DND4E.Movement.Shift')} ${parseInt(data.system.movement.shift.value)} ${data.system.movement.shift.traits ? data.system.movement.shift.traits : '' }</span>`;

		if(data.system.movement.custom){
			const moveCustom = [];
			data.system.movement.custom.split(";").forEach((c, i) => (c ? moveCustom[i] = c.trim() : null) );
			data.moveCustom = moveCustom;
			moveCustom.forEach((c) => {
				if(this.actor.type === "Player Character"){
					data.moveTip += `<br />${c.trim()}`;
				}else{
					data.moveDisplay += `, <span class="move-extra">${c.trim()}</span>`;
				}
			});
		}
		if(data.system.movement.ignoredDifficultTerrain){
			let terrainString = '';
			data.system.movement.ignoredDifficultTerrain.forEach((t) => {
				const terrainLabel = CONFIG.DND4E.ignoredDifficultTerrainTypes[t].label;
				if(terrainString !='') terrainString += `, `;
				if(this.actor.type === "Player Character"){
					terrainString += `${terrainLabel}`;
				}else{
					terrainString += `<span class="move-modifier">${terrainLabel}</span>`;
				}
			});
			if(terrainString !=''){
				if(this.actor.type === "Player Character"){
					data.moveTip += `<br />(${terrainString})`;
				}else{					
					data.moveDisplay += ` (${terrainString})`;
				}
			}
		}
	}	

	_compareValues(key, order = 'asc') {
		return function innerSort(a, b) {
			if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {	
				let varA;
				let varB;
				if (DND4E.sortValues[key]) {
					varA = DND4E.sortValues[key][a[key]];
					varB = DND4E.sortValues[key][b[key]];
				}
				else {
					varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
					varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
				}
	
				let comparison = 0;
				if (varA > varB) {
					comparison = 1;
				}
				else if (varA < varB) {
					comparison = -1;
				}
				else if( varA === varB){
					comparison = a.name.toUpperCase().localeCompare(b.name.toUpperCase());
				}
				return (order === 'desc') ? (comparison * -1) : comparison;
			} else if (a.system.hasOwnProperty(key) && b.system.hasOwnProperty(key)) {
				let varA;
				let varB;
				if (DND4E.sortValues[key]) {
					varA = DND4E.sortValues[key][a.system[key]];
					varB = DND4E.sortValues[key][b.system[key]];
				}
				else {
					varA = (typeof a.system[key] === 'string') ? a.system[key].toUpperCase() : a.system[key];
					varB = (typeof b.system[key] === 'string') ? b.system[key].toUpperCase() : b.system[key];
				}
				let comparison = 0;
				if (varA > varB) {
					comparison = 1;
				}
				else if (varA < varB) {
					comparison = -1;
				}
				else if( varA === varB){
					// comparison = a.name.toUpperCase().localeCompare(b.name.toUpperCase());
					if(a.sort > b.sort) comparison = 1;
					else if(a.sort < b.sort) comparison = -1;
				}
				return (order === 'desc') ? (comparison * -1) : comparison;
			}
			return 0;

		};
	};

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * Overriders core to fix some minnor issues
   * @param {Event} event
   * @param {Object} itemData
   * @Override
   */
	_onSortItem(event, itemData) {

		// Get the drag source and its siblings
		const source = this.actor.items.get(itemData._id);
		const siblings = this.actor.items.filter(i => {
			return (i.type === source.type) && (i._id !== source._id);
		});

		// Get the drop target
		const dropTarget = event.target.closest("[data-item-id]");
		const targetId = dropTarget ? dropTarget.dataset.itemId : null;
		const target = siblings.find(s => s._id === targetId);

		// Ensure we are only sorting like-types
		if (!target || (source.type !== target.type)) return; // changed from if (target && (source.data.type !== target.data.type)) return;

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(source, {target: target, siblings, sortBefore: (source.sort > target.sort)}); //Changed from const sortUpdates = SortingHelpers.performIntegerSort(source, {target: target, siblings});
		const updateData = sortUpdates.map(u => {
			const update = u.update;
			update._id = u.target._id;
			return update;
		});

		// Perform the update
		return this.actor.updateEmbeddedDocuments("Item", updateData);
	}

	/* -------------------------------------------- */

	_sortInventory(inventory) {
		const sort = this.document.system?.inventorySortTypes || "level";
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(inventory)) {
			group.items.sort((a,b) => a.sort - b.sort);
		}
	}

	/* -------------------------------------------- */

	_sortFeatures(features) {
		const sort = this.document.system.featureSortTypes;
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(features)) {
			group.items.sort(this._compareValues(sort));
		}
	}

	/* -------------------------------------------- */

	_sortPowers(powers) {
		const sort = this.document.system.powerSortTypes || "actionType";
		for (const [keyy, group] of Object.entries(powers)) {
			if(sort === "none"){
				group.items.sort((a,b) => a.sort - b.sort);
			} else {
				group.items.sort(this._compareValues(sort));
			}
		}
	}
	
	_sortRituals(rituals) {
		const sort = this.document.system.ritualSortTypes || "level";
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(rituals)) {
			group.items.sort(this._compareValues(sort));
		}
	}

	/* -------------------------------------------- */

	_groupPowers(power, powerGroups) {
		if(this.document.system.powerGroupTypes === "action" || !this.document.system.powerGroupTypes) {
			if(Object.keys(powerGroups).includes(power.system.actionType) ) return power.system.actionType;
		}
		else if(this.document.system.powerGroupTypes === "actionMod") {
			if(power.system.trigger){
				return "triggered";
			}
			else if(Object.keys(powerGroups).includes(power.system.actionType)){
				return power.system.actionType;
			}	
			return "other";
		}
		else if(this.document.system.powerGroupTypes === "type") {
			if(Object.keys(powerGroups).includes(power.system.powerType) )return power.system.powerType;
		}
		else if(this.document.system.powerGroupTypes === "powerSubtype") {
			if(Object.keys(powerGroups).includes(power.system.powerSubtype) )return power.system.powerSubtype;
		}
		else if(this.document.system.powerGroupTypes === "usage") {
			if(Object.keys(powerGroups).includes(power.system.useType) ) return power.system.useType;
		}
		return "other";
	}

	_generatePowerGroups() {
		const actorData = this.document.system;
		const powerGroupTypes = actorData.powerGroupTypes ?? "usage"
		const groups = DND4E.powerGroupings[powerGroupTypes] ?? DND4E.powerGroupings["usage"]  // paranoid defensive, but ensure we always return something
		return this.#configItemToDisplayConfig(groups)
	}

	#configItemToDisplayConfig = (config) => {
		const displayConfig = {}
		for (const [key, value] of Object.entries(config)) {
			displayConfig[key] = {
				...value,
				items: [],
				dataset: {type: key}
			}
		}
		return displayConfig
	}

	_checkItemAvailable(itemData) {
		if( (!itemData.system.uses.value && itemData.system.preparedMaxUses) || (itemData.type === 'power' && !itemData.system.prepared)) {
			itemData.system.notAvailable = true;
		}
		
		//If there's a consumed asset, check its availability	
		const consume = itemData.system.consume || {};
		if ( consume.type && consume.target && consume.amount) {
			//console.debug(`${itemData.name} has consume type and target: ${consume.type} ${consume.target}`);
			const actor = this.actor;
			const amount =  parseInt(consume.amount) || parseInt(consume.amount) === 0 ? parseInt(consume.amount) : 0;
			//console.debug(`${itemData.name} has consume amount: ${amount}`);

			// Identify the consumed resource and its quantity
			let consumed = null;
			let quantity = 0;
			switch ( consume.type ) {
				case "attribute":
					consumed = foundry.utils.getProperty(actor.system, consume.target);
					quantity = consumed || 0;
					break;
				case "resource":
				case "currency":
				case "ritualcomp":
					consumed = foundry.utils.getProperty(actor, consume.target);
					quantity = consumed || 0;
					break;
				case "ammo":
				case "material":
					consumed = actor.items.get(consume.target);
					quantity = consumed ? consumed.system.quantity : 0;
					break;
				case "charges":
					consumed = actor.items.get(consume.target);
					quantity = consumed ? consumed.system.uses.value : 0;
					break;
			}

			// Mark unavailable if the needed resource is insufficient
			if ( ![null, undefined].includes(consumed) ) {
				let remaining = quantity - amount;
				if ( remaining < 0 ) {
					itemData.system.notAvailable = true;
				}
			}
		}			
	
	}
  /* -------------------------------------------- */
	/**
   * A helper method to generate the text for the range of difrent powers
   * @param {itemData} itemData
   * @private
   */
	 _preparePowerRangeText(itemData) {
		const rangeData = this.actor.items.get(itemData._id).rangeData();
		itemData.system.rangeText = rangeData.rangeText;
		itemData.system.rangeTextShort = rangeData.rangeTextShort;
		itemData.system.rangeTextBlock = rangeData.rangeTextBlock;
	}
  /* -------------------------------------------- */

  /**
   * A helper method to establish the displayed preparation state for an item
   * @param {Item} item
   * @private
   */
  _prepareItemToggleState(item) {
	const power = ["power","atwill","encounter","daily","utility"];
	if (power.includes(item.type)) {
	  // const isAlways = foundry.utils.getProperty(item.data, "preparation.mode") === "always";
	  const isPrepared =  foundry.utils.getProperty(item.system, "prepared");
	  item.toggleClass = isPrepared ? "active" : "";
	  // if ( isAlways ) item.toggleClass = "fixed";
	  // if ( isAlways ) item.toggleTitle = CONFIG.DND4E.spellPreparationModes.always;
	  // else if ( isPrepared ) item.toggleTitle = CONFIG.DND4E.spellPreparationModes.prepared;
	  if ( isPrepared ) item.toggleTitle = game.i18n.localize("DND4E.PowerPrepared");
	  else item.toggleTitle = game.i18n.localize("DND4E.PowerUnPrepared");
	}
	else {
	  const isActive = foundry.utils.getProperty(item.system, "equipped");
	  item.toggleClass = isActive ? "active" : "";
	  item.toggleTitle = game.i18n.localize(isActive ? "DND4E.Equipped" : "DND4E.Unequipped");
	}
  }
	
	_prepareDataSave(data, map) {
		
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = data[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, l) => {
				obj[l] = l[1] > 0 ? `${choices[l[0]]} +${l[1]}` : l[1] != "" ? `${choices[l[0]]} ${l[1]}` : choices[l[0]];
				// obj[l] = l[1] != "" ? `${choices[l[0]]} ${l[1]}` : choices[l[0]];
				return obj;
			}, {});
			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
			
		}
	}
	
  /* -------------------------------------------- */

  /**
   * Determine whether an Owned Item will be shown based on the current set of filters
   * @return {boolean}
   * @private
   */
  _filterItems(items, filters) {
	return items.filter(item => {
	  const system = item.system;

	  // Action usage
	  for ( let f of ["action", "bonus", "reaction"] ) {
		if ( filters.has(f) ) {
		  if ((system.activation && (system.activation.type !== f))) return false;
		}
	  }

	  // Equipment-specific filters
	  if ( filters.has("equipped") ) {
		if ( system.equipped !== true ) return false;
	  }
	  return true;
	});
  }	

	_getTrainingIcon(level) {
		const icons = {
			0: '<i class="far fa-circle"></i>',
			5: '<i class="fas fa-check"></i>',
			8: '<i class="fas fa-check-double"></i>'
			};
		return icons[level];
	}
	
	/* -------------------------------------------- */
	/**
	 * Retrieve the list of fields that are currently modified by Active Effects on the Actor.
	 * @returns {string[]}
	 * @protected
	 */
	_getActorOverrides() {
		return Object.keys(foundry.utils.flattenObject(this.document.overrides || {}));
	}


		/* -------------------------------------------- */
	/**
	 * Retrieve the list of fields that are directly modified by Active Effects, or indirectly modified via feat, item etc. bonuses.
	 * @param excluded Array of candidate keys to exclude.
	 * @returns {string[]}
	 */
	_getAllActorOverrides(excluded = []) {
		const overrides = new Set(this._getActorOverrides());
		const actorKeys = new Set(Object.keys(foundry.utils.flattenObject(this.actor.toObject(false))));
		const candidateKeys = new Set();
		const accumulatorSuffixes = [".value", ".max"]; // Suffixes used for the accumulation of feat, item etc. bonuses.
		const bonusSuffixes = [/.feat$/, /.item$/, /.power$/, /.race$/, /.untyped$/]; // Suffixes for bonuses.

		// Construct a list of candidate keys
		for (const key of overrides) {
			for (const bonus of bonusSuffixes) {
				// accumulatorSuffixes.forEach(accumulator => candidateKeys.add(key.replace(bonus, accumulator)));
				if(key.includes("system.attributes.hp.")){ //Exception for HP as to not block 
					candidateKeys.add(key.replace(bonus, ".max"));
				} else {
					accumulatorSuffixes.forEach(accumulator => {
						candidateKeys.add(key.replace(bonus, accumulator))
					});
				}
			}
		}

		// Remove excluded keys
		for (const key of excluded) {
			candidateKeys.delete(key);
		}

		// Return keys that exist in the actor
		return Array.from((overrides.union(candidateKeys)).intersection(actorKeys));
	}

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to its roll method
   * @private
	 * @this {ActorSheet4e}
   */
	static async #onItemSummary(event, target) {
		event.preventDefault();
		if (!this.options.viewPermission) return;
		const li = target.closest(".item");
		if (li) {
			li.classList.toggle("collapsed");
			if (li.classList.contains("collapsed")) {
				this.#expandedItemIds.delete(li.dataset.itemId);
			} else {
				this.#expandedItemIds.add(li.dataset.itemId);
			}
		}
	}

  /* -------------------------------------------- */

	static #onDisplayActorArt() {
		const p = new foundry.applications.apps.ImagePopout({src: this.document.img});
		p.render(true);
	}
  
  /* -------------------------------------------- */

	static async #onEditImage() {
		if (!this.actor.isOwner) return;
		const defaultArtwork = this.document.constructor.getDefaultArtwork?.(this.document._source) ?? {};
		const defaultImage = foundry.utils.getProperty(defaultArtwork, 'img');
		const fp = new CONFIG.ux.FilePicker({
			current: this.document.img,
			type: 'image',
			redirectToRoot: defaultImage ? [defaultImage] : [],
			callback: (path) => this.document.update({ img: path }),
			top: this.position.top + 40,
			left: this.position.left + 10
		});
		await fp.browse();
	}

  /* -------------------------------------------- */

  /**
   * Handle toggling the state of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  static #onItemToggle(event, target) {
		if (!this.actor.isOwner) return;	
		event.preventDefault();
		const itemId = target.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		const power = ["power","atwill","encounter","daily","utility"];
		const attr = power.includes(item.type) ? "system.prepared" : "system.equipped";
		return item.update({[attr]: !foundry.utils.getProperty(item, attr)});
  }

  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
	static #onItemCreate(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const type = target.dataset.type;
		const subType = target.dataset?.subtype || null;
		const itemData = {
			name: game.i18n.format("DND4E.ItemNew", {type: type.capitalize()}),
			type: type,
			system: foundry.utils.duplicate(target.dataset)
		};
		if(type === 'feature' && subType){
			itemData.system.featureType = subType;
		}else if(type === 'ritual' && subType){
			itemData.system.category = subType;
		}
		//console.debug(itemData)
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	static async #onItemImport(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const {json=null} = await foundry.applications.api.Dialog.input({
			window: {
				title: `${this.actor.name} - JSON Item Importer`
			},
			content: `<p>${game.i18n.localize("DND4EUI.ImportJSONInput")}</p>
			<input name=json type="text"/>`,
			ok: {
				label: "DND4EUI.ImportJSONUpload"
			}
		});
		if (!json) return;
		let obj;
		try {
			obj = JSON.parse(json);
		} catch(err) {
			console.error(err);
			return ui.notifications.error("Invalid input, JSON formatting did not validate!");
		}
		if (!Item.TYPES.includes(obj.type)) {
			return ui.notifications.error(`Invalid Item type of "${obj.type}"`);
		}
		obj._id ??= foundry.utils.randomID(16);
		await this.actor.createEmbeddedDocuments("Item", [obj]);
	}

	static #onPowerCreate(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const type = target.dataset.type;
		const itemData = {
			name: `${game.i18n.format("DND4E.ItemNew", {type: type.capitalize()})} Power`,
			type: "power",
			system: foundry.utils.duplicate(target.dataset)
		};

		if(this.document.system.powerGroupTypes === "action" || !this.document.system.powerGroupTypes) {
			itemData.system.actionType = type;
		}
		else if(this.document.system.powerGroupTypes === "type") {
			itemData.system.powerType = type;
		}
		else if(this.document.system.powerGroupTypes === "usage") {
			itemData.system.useType = type;
			if(["encounter", "daily", "recharge", "item"].includes(type)) {
				itemData.system.uses = {
					value: 1,
					max: 1,
					per: ["encounter", "charges", "round"].includes(type)  ? "enc" : "day"
					// per: type === "encounter" ? "enc" : "day"
				};
			}
		}

		itemData.system.autoGenChatPowerCard = game.settings.get("dnd4e", "powerAutoGenerateLableOption");
		
		if(this.actor.type === "NPC"){
			
			itemData.system.weaponType = "none";
			itemData.system.weaponUse = "none";

			itemData.system.attack = {
				formula:"5 + @atkMod",
				ability:"form"
			};
			itemData.system.hit  = {
				formula:"@powBase + @dmgMod",
				critFormula:"@powMax",
				baseDiceType: "d8",
				detail: "1d8 damage."
			};
		}

		if(game.settings.get("dnd4e", "halfLevelOptions")){
			if(this.actor.type === "NPC"){
				itemData.system.attack.formula = ""; 
			} else {
				itemData.system.attack = {
					formula:"@wepAttack + @powerMod + @atkMod"
				}
			}
		}
		
		Helper.debugLog(itemData)
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	static #onManageActiveEffect(event, target) {
		if (!this.actor.isOwner) return;
		ActiveEffect4e.onManageActiveEffect(event, target, this.actor)
	}

  /* -------------------------------------------- */

  /**
   * Handle editing an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  static #onItemEdit(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const li = target.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		item.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  static async #onItemDelete(event, target) {
		if (!this.actor.isOwner) return;	
		event.preventDefault();
		const li = target.closest(".item");
		const item = this.actor.items.get(li.dataset.itemId);
		if ( item )  {
			let shouldDelete = true;
			if (game.settings.get("dnd4e", "itemDeleteConfirmation")) {
				shouldDelete = await foundry.applications.api.Dialog.confirm({
					window: {
						title: game.i18n.format("DND4E.DeleteConfirmTitle", {name: item.name}),
					},
					content: game.i18n.format("DND4E.DeleteConfirmContent", {name: item.name}),
					yes: {default: true}
				});
			}
			if (shouldDelete) return item.delete();
		}
  }
  
  /* -------------------------------------------- */

  /**
   * Change the uses amount of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
	async _onUsesChange(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		const uses = Math.clamp(0, parseInt(event.target.value), item.system.preparedMaxUses);
		event.target.value = uses;
		return item.update({ 'system.uses.value': uses });
	}
  
	/* -------------------------------------------- */
  
	/**
	*Opens dialog config window for HP options 
	*turns on/off auto calculation of HP based on class stats
	*keep or reset tempHP on short rest.
	*/
	static #onHPOptions(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();

		new HPOptions({ document: this.actor }).render(true)
	}
	
	/* -------------------------------------------- */
	/**
	* Opens bonuses dialog config window for selected Skills
	*/
	
	static #onSkillBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const skillName = target.parentElement.dataset.skill;
		const targetSkill = `system.skills.${skillName}`;
		const options = { document: this.actor, target: targetSkill, label: `${game.i18n.format('DND4E.SkillBonusTitle', { skill: this.actor.system.skills[skillName].label } ) }`, skill: true };
		new AttributeBonusDialog(options).render(true);
	}
	/* -------------------------------------------- */

	static #onAbilityBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const abilityId = target.parentElement.dataset.ability;
		const targetAbility = `system.abilities.${abilityId}.check`;
		const options = { document: this.actor, target: targetAbility, label: `${game.i18n.format('DND4E.AbilityCheckBonusTitle', { ability: this.actor.system.abilities[abilityId].label } ) }` };
		new AttributeBonusDialog(options).render(true);
	}

	static #onDeathSaveBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.deathsavebon`, label: game.i18n.localize('DND4E.DeathSavingThrowBonus')};
		new AttributeBonusDialog(options).render(true);		
	}
	
	static #onSurgeBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.surgeBon`, label: game.i18n.localize('DND4E.HealingSurgeBonus') };
		new AttributeBonusDialog(options).render(true);		
	}
	
	static #onSurgeEnv(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.surgeEnv`, label: `${game.i18n.localize('DND4E.HealingSurges')} ${game.i18n.localize('DND4E.SurgeEnv')}`};
		new AttributeBonusDialog(options).render(true);		
	}

	static #onSecondWindBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.secondwindbon`, label: game.i18n.localize('DND4E.SecondWindBonus'), secondWind: true };
		new AttributeBonusDialog(options).render(true);		
	}
	
	static #onDefencesBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const defName = target.parentElement.dataset.defence;
		const targetDef = `system.defences.${defName}`;
		const options = { document: this.actor, target: targetDef, label: `${game.i18n.format('DND4E.DefenceBonus',{def:this.actor.system.defences[defName].label})}`, ac: (defName ==="ac")  };
		new AttributeBonusDialog(options).render(true);		
	}
	
	static #onInitiativeBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const options = { document: this.actor, target: `system.attributes.init`, label: game.i18n.localize('DND4E.InitiativeBonus'), init: true };
		new AttributeBonusDialog(options).render(true);		
	}
	
	static #onMovementDialog(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		new MovementDialog({document: this.actor}).render(true)
	}
	
	static #onConBonConfig(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		new ConBonConfig({document: this.actor}).render(true)
	}

	static #onHealMenuDialog(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		new HealMenuDialog({document: this.actor}).render(true)
	}

	static #onEncumbranceDialog(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		new EncumbranceDialog({document: this.actor}).render(true);
	}

	static #onPassiveBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const passName = target.parentElement.dataset.passive;
		const skillName = this.actor.system.passive[passName].skill;
		const targetPassive = `system.passive.${passName}`;
		const options = { document: this.actor, target: targetPassive, label: `${game.i18n.format('DND4E.PasBonus',{skill: this.actor.system.skills[skillName].label})}` };
		new AttributeBonusDialog(options).render(true);		
	}	

	static #onModifiersBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const modifierName = target.parentElement.dataset.modifiers;
		const targetMod = `system.modifiers.${modifierName}`;
		const options = { document: this.actor, target: targetMod, label: this.actor.system.modifiers[modifierName].label };
		new AttributeBonusDialog(options).render(true);
	}	

	static #onResistancesBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const resName = target.parentElement.dataset.res;
		const targetRes = `system.resistances.${resName}`;
		const options = { document: this.actor, target: targetRes, label: `${game.i18n.format('DND4E.DamResVulnBonus',{type: this.actor.system.resistances[resName].label})}` };
		new AttributeBonusDialog(options).render(true);
	}
	
	static #onCustomRolldDescriptions(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const options = {data: this.actor};
		new CustomRolldDescriptions({document: this.actor}).render(true, options);
	}
	/**
	* Opens dialog window to spend Second Wind
	*/
	static #onSecondWind(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.secondWind(event,{isFF});
		}
		new SecondWindDialog(this.actor).render(true);		
	}
	
	/* -------------------------------------------- */

	static #onActionPointDialog(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.actionPoint(event,{isFF});
		}
		new ActionPointDialog(this.actor).render(true);
	}

	static #onActionPointExtraDialog(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		new ActionPointExtraDialog(this.actor).render(true);
	}

	/**
	*Opens dialog window to short rest.
	*Spend n number of healin surges,
	*reset encounter powers, action point ussage, second wind ussage.
	*/
	static #onShortRest(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.shortRest(event,{isFF});
		}
		new ShortRestDialog(this.actor).render(true);
	}
	
	/* -------------------------------------------- */
  
	/**
	*Opens dialog window to long rest.
	*reset HP, surges, encounter powers, daily powers, magic item use, actions points set to default.
	*/
	static #onLongRest(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.longRest(event,{isFF});
		}
		new LongRestDialog(this.actor).render(true)
	}

	static #onDeathSave(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.rollDeathSave(event,{isFF});
		}
		new DeathSaveDialog(this.actor).render(true);
	}

	static #onrollInitiative(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		return this.actor.rollInitiative({createCombatants: true},{event: event});
	}

	static #onSavingThrow(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const isFF = Helper.isRollFastForwarded(event);
		if(isFF){
			return this.actor.rollSave(event,{isFF});
		}
		return new SaveThrowDialog({document: this.actor}).render(true);
	}

	static #onSavingThrowBonus(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const options = { document: this.actor, target: `system.details.saves`, label: game.i18n.localize('DND4E.SavingThrowBonus') };
		new AttributeBonusDialog(options).render(true);	
	}

	static #onCycleSkillProficiency(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const skillId = target.parentElement.dataset.skill;

		// Get the current level and the array of levels
		const level = this.document.system.skills[skillId].training;
		const levels = [0, 5, 8];
		let idx = levels.indexOf(level);

		let value;
		// Toggle next level - forward on click, backwards on right
		if ( event.button === 0 ) {
			value = levels[(idx === levels.length - 1) ? 0 : idx + 1];
		} else {
			value = levels[(idx === 0) ? levels.length - 1 : idx - 1];
		}

		this.document.update({[`system.skills.${skillId}.training`] : value});

		// Update the field value and save the form
		this.submit({preventClose: true});
	}

	static #onItemRoll(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		event.stopPropagation();
		const itemId = target.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		this._onItemRoll(item);
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	 * @private
	 */
	_onItemRoll(item, variance={}) {
		console.debug(variance)

		if ( item.type === "power") {
			const fastForward = Helper.isRollFastForwarded(event);
			return this.actor.usePower(item, {
				'configureDialog': !fastForward, 
				'fastForward': fastForward,
				//Temporary traits from special roll modes
				'variance': variance
			});
		}
		// Otherwise roll the Item directly
		return item.roll();
	}

	async _onItemHoverEntry(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		
		if (item && item.type === "power" && item.hasAttack) {
			const bonus = await item.getAttackBonus();

			const d = {"ac": game.i18n.localize('DND4E.DefAC'), "ref": game.i18n.localize('DND4E.DefRef'), "wil": game.i18n.localize('DND4E.DefWil'), "fort": game.i18n.localize('DND4E.DefFort')};
			const defence = d[item.system.attack.def];

			if (bonus && defence){
				game.tooltip.activate(event.target, {text: `+ ${String(bonus)} ${game.i18n.localize('DND4E.VS')} ${defence}`, direction: "RIGHT"});
			}
		}
	}

	_onItemHoverExit(event) {
		event.preventDefault();
		game.tooltip.deactivate();
	}

	/* -------------------------------------------- */

	static #onRollEffectSave(event, target){
		if (!this.actor.isOwner) return;
		event.preventDefault();
		console.debug("roll Save Throw v Effect!");
		const effectId = target.closest(".item").dataset.effectId;
		const effect = this.actor.effects.get(effectId);	
		const saveDC = effect.flags.dnd4e?.effectData?.saveDC || 10;
		const isFF = Helper.isRollFastForwarded(event);
		
		if(isFF){
			return this.actor.rollSave(event,{isFF,"effectSave":true,"dc":saveDC,"effectId":effectId});
		}

		let save = new SaveThrowDialog({"document":this.actor,"effectSave":true,"saveDC":saveDC,"effectId":effectId}).render(true);

		// console.debug(save)
		// console.debug(effectId);
		// console.debug(this.actor.effects.get(effectId));
	}
	/* -------------------------------------------- */

	static async #onItemRecharge(event, target){
		event.preventDefault();
		const itemId = target.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);

		if ( item.type === "power") {

			if(item.system.rechargeRoll || (!item.system.rechargeRoll && !item.system.rechargeCondition)){
				const r = new Roll("1d6");
				r.options.async = true;
				r.dice[0].options.recharge = true;
				r.dice[0].options.critical = item.system.rechargeRoll || 6;
				r.dice[0].options.fumble = r.dice[0].options.critical -1;
				// r.evaluate({async: false});
				await r.evaluate();
	
				let flav = `${game.i18n.format('DND4E.PowerRechargeFail',{type: item.name})}`;
				if(r.total >= r.dice[0].options.critical){
					this.document.updateEmbeddedDocuments("Item", [{_id:itemId, "system.uses.value": item.system.preparedMaxUses}]);
					flav = `${game.i18n.format('DND4E.PowerRechargeSuccess',{type: item.name})}`;
				}

				r.toMessage({
					user: game.user.id,
					speaker: {actor: this.document, alias: this.document.name},
					flavor: flav,
					rollMode: game.settings.get("core", "rollMode"),
					'flags.dnd4e':{
						'roll':{'type': "other", 'itemId': this.id},
						'messageType': `recharge`
					}
				});

			} else if (item.system.rechargeCondition) {

				this.document.updateEmbeddedDocuments("Item", [{_id:itemId, "system.uses.value": item.system.preparedMaxUses}]);

				ChatMessage.create({
					user: game.user.id,
					speaker: {actor: this.document, alias: this.document.name},
					flavor: `${item.name}—${game.i18n.localize('DND4E.PowerRecharge')}`,
					content: `${game.i18n.format('DND4E.PowerRechargeSuccessCondition',{type: item.name,condition:item.system.rechargeCondition})}`,
					'flags.dnd4e':{
						'messageType': `recharge`
					}
				});
			}
		}
		return;
	}

  /* -------------------------------------------- */

	/**
	 * Handle mouse click events to convert currency to the highest possible denomination
	 * @param {MouseEvent} event    The originating click event
	 * @private
	 */
	static async #onConvertCurrency(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		let shouldConvert = await foundry.applications.api.Dialog.confirm({
			window: {title: `${game.i18n.localize("DND4E.CurrencyConvert")}`},
			content: `<p>${game.i18n.localize("DND4E.CurrencyConvertHint")}</p>`
		});
		if (shouldConvert) return this.convertCurrency();
	}


	/**
	 * Returns the sum amount in GP that the character is currently holding
	 * @private
	 */
	_currencyGoldSumLabel(){
		let goldSum = 0;
		for(const [type,value] of Object.entries(this.actor.system.currency)){
			goldSum += value * CONFIG.DND4E.currencyConversion[type]?.gp;
		}
		return game.i18n.localize("DND4E.GoldWealth") + (Math.round(goldSum*100)/100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
	}
  /* -------------------------------------------- */

  /**
   * Convert all carried currency to the highest possible denomination to reduce the number of raw coins being
   * carried by an Actor.
   * @return {Promise<Actor4e>}
   */
  convertCurrency() {
		const curr = foundry.utils.duplicate(this.actor.system.currency);
		const convert = CONFIG.DND4E.currencyConversion;
		for ( let [c, t] of Object.entries(convert) ) {
			let change = Math.floor(curr[c] / t.each);
			curr[c] -= (change * t.each);
			curr[t.into] += change;
		}
		return this.document.update({"system.currency": curr});
  }
  
  /* -------------------------------------------- */

  /**
   * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
	static #onTraitSelector(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const label = target.getAttribute('data-app-title') || "Label error";
		const choices = CONFIG.DND4E[target.dataset.options];
		const options = { name: target.dataset.target, window: {title: label}, choices};
		new TraitSelector({document: this.actor, ...options}).render(true);
	}

	static #onTraitSelectorWeapon(event, target){
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const label = target.getAttribute('data-app-title') || "Label error";
		const choices = CONFIG.DND4E.weaponProficienciesMap;
		const options = { name: target.dataset.target, window: {title: label}, choices, datasetOptions: target.dataset.options, config:CONFIG};
		new TraitSelector({document: this.actor, ...options}).render(true);
	}

	static #onTraitSelectorSenses(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const label = target.getAttribute('data-app-title') || "Label error";
		const choices = CONFIG.DND4E[target.dataset.options];
		const options = { name: target.dataset.target, window: {title: label}, choices };
		new TraitSelectorValues({document: this.actor, ...options}).render(true);
	}
	
	static async #onListStringInput(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const label = target.getAttribute('data-app-title') || "Label error";
		const currValue = foundry.utils.getProperty(this.actor, target.dataset.target) ?? [];
		const {traits=""} = await foundry.applications.api.Dialog.input({
			id: "trait-selector",
			classes: ["dnd4e"],
			window: {
				title: `${this.actor.name} - ${label}`,
				resizable: true
			},
			position: {
				width: 320,
				height: "auto"
			},
			content: `
			<div class="form-group stacked">
				<label>${game.i18n.localize("DND4EUI.StringEnterValues")}:</label>
				<input type="text" name="traits" value="${currValue.join(";")}" data-dtype="String"/>
			</div>
			`,
			ok: {
				label: "DND4E.TraitSave",
				icon: "far fa-save"
			}
		});
		if (traits === null) return;
		const newValue = traits.split(";").map(i => i.trim()).filter(i => i);
		await this.actor.update({
			[target.dataset.target]: newValue
		});
	}

  /* -------------------------------------------- */

  /** @override */
  setPosition(options={}) {
	const position = super.setPosition(options);
	// const sheetBody = this.element.find(".sheet-body");
	// const bodyHeight = position.height - 345;
	// sheetBody.css("height", bodyHeight);
	return position;
  }

	/* -------------------------------------------- */

	/**
	 * Handle rolling a Skill check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	static #onRollSkillCheck(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const skillId = target.parentElement.dataset.skill;
		this.actor.rollSkill(skillId, {event: event});
	}
  /* -------------------------------------------- */
  
  /**
   * Handle posting a chat message for displaying passive skills.
   * @param {Event} event   The originating click event
   * @private
   */
	static #onRollPassiveCheck(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const passName = target.parentElement.dataset.passive;
		const skillName = this.actor.system.passive[passName].skill;

		ChatMessage.create({
			user: game.user.id,
			speaker: {actor: this.document, alias: this.document.name},
			content: `${game.i18n.format('DND4E.PasCheck',{skill:this.actor.system.skills[skillName].label})}: <strong>${this.document.system.passive[passName].value}</strong>`
		});	
	}


	/* -------------------------------------------- */

	/**
	 * Handle activation of a context menu for an embedded Item or ActiveEffect document.
	 * Dynamically populate the array of context menu options.
	 * @param {HTMLElement} element       The HTML element for which the context menu is activated
	 * @protected
	 */
	_onItemContext(element) {

		// Active Effects
		if ( element.classList.contains("effect") ) {
			const effect = Array.from(this.actor.allApplicableEffects()).find( e => e.id === element.dataset.effectId);
			if ( !effect ) return;
			ui.context.menuItems = this._getActiveEffectContextOptions(effect);
			Hooks.call("DND4E.getActiveEffectContextOptions", effect, ui.context.menuItems);
		}

		// Items
		else {
			const item = this.actor.items.get(element.dataset.itemId);
			if ( !item ) return;
			ui.context.menuItems = this._getItemContextOptions(item);
			Hooks.call("DND4E.getItemContextOptions", item, ui.context.menuItems);
		}
	}

	/* -------------------------------------------- */

	/**
	 * Prepare an array of context menu options which are available for owned ActiveEffect documents.
	 * @param {ActiveEffect4e} effect         The ActiveEffect for which the context menu is activated
	 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the ActiveEffect
	 * @protected
	 */	

	/* -------------------------------------------- */
	_getActiveEffectContextOptions(effect) {
		return [
			{
				name: "DND4E.ContextMenuActionEdit",
				icon: "<i class='fas fa-edit fa-fw'></i>",
				callback: () => effect.sheet.render(true)
			},
			{
				name: "DND4E.ContextMenuActionDuplicate",
				icon: "<i class='fas fa-copy fa-fw'></i>",
				callback: () => effect.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: effect.name})}, {save: true})
			},
			{
				name: "DND4E.ContextMenuActionDelete",
				icon: "<i class='fas fa-trash fa-fw'></i>",
				callback: () => effect.deleteDialog()
			},
			{
				name: effect.disabled ? "DND4E.ContextMenuActionEnable" : "DND4E.ContextMenuActionDisable",
				icon: effect.disabled ? "<i class='fas fa-check fa-fw'></i>" : "<i class='fas fa-times fa-fw'></i>",
				callback: () => effect.update({disabled: !effect.disabled})
			}
		];
	}

	/**
	 * Prepare an array of context menu options which are available for owned Item documents.
	 * @param {Item4e} item                   The Item for which the context menu is activated
	 * @returns {ContextMenuEntry[]}          An array of context menu options offered for the Item
	 * @protected
	 */
	_getItemContextOptions(item) {
		// Standard Options
		const options = [
		{
			name: "DND4E.ContextMenuActionToChat",
			icon: "<i class='fas fa-share-from-square fa-fw'></i>",
			callback: () => item.toChat()
		},
		{
			name: "DND4E.ContextMenuActionEdit",
			icon: "<i class='fas fa-edit fa-fw'></i>",
			callback: () => item.sheet.render(true)
		},
		{
			name: "DND4E.ContextMenuActionDuplicate",
			icon: "<i class='fas fa-copy fa-fw'></i>",
			condition: () => !["race", "background", "class", "subclass"].includes(item.type),
			callback: () => item.clone({name: game.i18n.format("DOCUMENT.CopyOf", {name: item.name})}, {save: true})
		},
		{
			name: "DND4E.ContextMenuActionDelete",
			icon: "<i class='fas fa-trash fa-fw'></i>",
			callback: () => item.deleteDialog()
		}
		];

		// Toggle Attunement State
		if ( ("attunement" in item.system) && (item.system.attunement !== CONFIG.DND4E.attunementTypes.NONE) ) {
			const isAttuned = item.system.attunement === CONFIG.DND4E.attunementTypes.ATTUNED;
			options.push({
				name: isAttuned ? "DND4E.ContextMenuActionUnattune" : "DND4E.ContextMenuActionAttune",
				icon: "<i class='fas fa-sun fa-fw'></i>",
				callback: () => item.update({
					"system.attunement": CONFIG.DND4E.attunementTypes[isAttuned ? "REQUIRED" : "ATTUNED"]
				})
			});
		}

		// Toggle Equipped State
		if ( "equipped" in item.system ) options.push({
			name: item.system.equipped ? "DND4E.ContextMenuActionUnequip" : "DND4E.ContextMenuActionEquip",
			icon: "<i class='fas fa-shield-alt fa-fw'></i>",
			callback: () => item.update({"system.equipped": !item.system.equipped})
		});

		// Toggle Prepared State
		if ( ("prepared" in item.system)) options.push({
			name: item.system?.prepared ? "DND4E.ContextMenuActionUnprepare" : "DND4E.ContextMenuActionPrepare",
			icon: "<i class='fas fa-sun fa-fw'></i>",
			callback: () => item.update({"system.prepared": !item.system.prepared})
		});
		
		// Special Roll Options for Basic and Tagged Attacks
		if ( item.type == 'power' && (item.system?.attack?.isBasic || item.system?.attack?.canCharge)) {
			options.unshift({
				name: game.i18n.localize('DND4E.AttackModeCharge'),
				icon: "<i class='fas fa-angles-right'></i>",
				callback: () => this._onItemRoll(item, {isCharge:true})
			});
		}
		if ( item.type == 'power' && (item.system?.attack?.isBasic || item.system?.attack?.canOpp)) {
			options.unshift({
				name: game.i18n.localize('DND4E.AttackModeOpp'),
				icon: "<i class='fas fa-triangle-exclamation'></i>",
				callback: () => this._onItemRoll(item, {isOpp:true})
			});
		}

		return options;
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling a ability check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	static #onRollAbilityCheck(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		let ability = target.parentElement.dataset.ability;
		this.actor.rollAbility(ability, {event: event});
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling a defences check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	static #onRollDefenceCheck(event, target) {
		if (!this.actor.isOwner) return;
		event.preventDefault();
		const def = target.parentElement.dataset.defence;
		this.actor.rollDef(def, {event: event});
	}

	/* -------------------------------------------- */

	/**
	 * Handle dropping of an item reference or item data onto an Actor Sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
	 * @protected
	 */
	async _onDropItem(event, data) {
		if ( !this.actor.isOwner ) return false;
		const item = await Item.implementation.fromDropData(data);

		// Handle moving out of container & item sorting
		if ( this.actor.uuid === item.parent?.uuid ) {
			if ( item.system.container !== null ) await item.update({"system.container": null});
			return this._onSortItem(event, item.toObject());
		}

		return this._onDropItemCreate(item);
		// return super._onDropItem(event, data);
	}

	/** @override */
	async _onDropFolder(event, data) {
		// return super._onDropFolder(event, data);
		
		if ( !this.actor.isOwner ) return [];
		const folder = await Folder.implementation.fromDropData(data);
		if ( folder.type !== "Item" ) return [];
		const droppedItemData = await Promise.all(folder.contents.map(async item => {
			if ( !(item instanceof Item) ) item = await fromUuid(item.uuid);
			return item;
		}));
		return this._onDropItemCreate(droppedItemData);
	}

	/**
	 * Handle the final creation of dropped Item data on the Actor.
	 * @param {Item4e[]|Item4e} itemData     The item or items requested for creation
	 * @returns {Promise<Item4e[]>}
	 * @protected
	 */
	async _onDropItemCreate(itemData) {
		let items = itemData instanceof Array ? itemData : [itemData];
		const itemsWithoutAdvancement = items.filter(i => !i.system.advancement?.length);
		const multipleAdvancements = (items.length - itemsWithoutAdvancement.length) > 1;
		if ( multipleAdvancements && !game.settings.get("dnd4e", "disableAdvancements") ) {
			ui.notifications.warn(game.i18n.format("DND4E.WarnCantAddMultipleAdvancements"));
			items = itemsWithoutAdvancement;
		}
	
		// Filter out items already in containers to avoid creating duplicates
		const containers = new Set(items.filter(i => i.type === "backpack").map(i => i._id));
		items = items.filter(i => !containers.has(i.system.container));
	
		// Create the owned items & contents as normal
		const toCreate = await Item4e.createWithContents(items, {
			transformFirst: item => this._onDropSingleItem(item.toObject())
		});
		return Item4e.createDocuments(toCreate, {pack: this.actor.pack, parent: this.actor, keepId: true});
	}

	/* -------------------------------------------- */

	/**
	 * Handles dropping of a single item onto this character sheet.
	 * @param {object} itemData					The item data to create.
	 * @returns {Promise<object|boolean>}		The item data to create after processing, or false if the item should not be
	 * 											created or creation has been otherwise handled.
	 * @protected
	 */
	async _onDropSingleItem(itemData) {
		// Clean up data
		this._onDropResetData(itemData);

		// Stack identical consumables
		const stacked = this._onDropStackConsumables(itemData);
		if ( stacked ) return false;

		return itemData;
	}

	/* -------------------------------------------- */

	/**
	 * Reset certain pieces of data stored on items when they are dropped onto the actor.
	 * @param {object} itemData    The item data requested for creation. **Will be mutated.**
	 */
	_onDropResetData(itemData) {
		if ( !itemData.system ) return;
		// ["equipped", "proficient", "prepared"].forEach(k => delete itemData.system[k]);
		// if ( "attunement" in itemData.system ) {
		// 	itemData.system.attunement = Math.min(itemData.system.attunement, CONFIG.DND5E.attunementTypes.REQUIRED);
		// }
	}

	/* -------------------------------------------- */

	/**
	 * Stack identical consumables when a new one is dropped rather than creating a duplicate item.
	 * @param {object} itemData         The item data requested for creation.
	 * @returns {Promise<Item4e>|null}  If a duplicate was found, returns the adjusted item stack.
	 */
	_onDropStackConsumables(itemData) {

		const droppedSourceId = itemData.flags.core?.sourceId;
		if ( itemData.type !== "consumable" || !droppedSourceId ) return null;
		const similarItem = this.actor.items.find(i => {
			const sourceId = i._stats.compendiumSource;
			return sourceId && (sourceId === droppedSourceId) && (i.type === "consumable") && (i.name === itemData.name);
		});
		if ( !similarItem ) return null;
		Helper.debugLog(similarItem.system.quantity)
		Helper.debugLog(itemData.system.quantity)
		return similarItem.update({
			"system.quantity": similarItem.system.quantity + Math.max(itemData.system.quantity, 1)
		});
	}
}
