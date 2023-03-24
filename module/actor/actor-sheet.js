import { DND4EBETA } from "../config.js";
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
import { ItemImporterDialog} from "../apps/item-importer.js"
import { HealMenuDialog } from "../apps/heal-menu-dialog.js";
import TraitSelector from "../apps/trait-selector.js";
import TraitSelectorSense from "../apps/trait-selector-sense.js";
import TraitSelectorSave from "../apps/trait-selector-save.js";
import ListStringInput from "../apps/list-string-input.js";
// import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import ActiveEffect4e from "../effects/effects.js";
import HPOptions from "../apps/hp-options.js";
import { Helper } from "../helper.js";
import {ActionPointExtraDialog} from "../apps/action-point-extra.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export default class ActorSheet4e extends ActorSheet {

	constructor(...args) {
		super(...args);

		/**
		 * Track the set of item filters which are applied
		 * @type {Set}
		 */
		this._filters = {
			inventory: new Set(),
			powers: new Set(),
			features: new Set()
		};
	}


	  /** @inheritdoc */
	  async _updateObject(event, formData) {
		return super._updateObject(event, formData);
	  }
  
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["dnd4eBeta", "sheet", "actor"],
			width: 844,
			height: 915,
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "powers" //initial default tab
			}],
			dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}],
			scrollY: [
				".inventory .inventory-list",
				".features .inventory-list",
				".powers .inventory-list",

				".section--sidebar",
				".section--tabs-content"
			]
		});
  }

  /* -------------------------------------------- */

  /**
   * A set of item types that should be prevented from being dropped on this type of actor sheet.
   * @type {Set<string>}
   */
   static unsupportedItemTypes = new Set();
  /* -------------------------------------------- */

  /** @override */
  get template() {
    return `systems/dnd4e/templates/actor-sheet.html`;
  }

  /* -------------------------------------------- */

	/** @override */
	async getData(options) {

		let isOwner = this.actor.isOwner;

		// const sheetData = super.getData();

		const data = {
			owner: isOwner,
			limited: this.actor.limited,
			options: this.options,
			editable: this.isEditable,
			cssClass: isOwner ? "editable" : "locked",
			isCharacter: this.actor.type === "Player Character",
			isNPC: this.actor.type === "NPC",
			config: CONFIG.DND4EBETA,
			rollData: this.actor.getRollData.bind(this.actor)
		};

		// The Actor's data
		const actor = this.actor
		const actorData = actor.system;
		data.actor = actor;
		data.system = actorData;

		data.items = actor.items;
		for ( let i of data.items ) {
			const item = this.actor.items.get(i._id);
			i.labels = item.labels;
		}
		
		// sheetData.config = CONFIG.DND4EBETA;
		actorData.size = DND4EBETA.actorSizes;
		for ( let [s, skl] of Object.entries(actorData.skills)) {
			skl.ability = actorData.abilities[skl.ability].label.substring(0, 3).toLowerCase();
			skl.icon = this._getTrainingIcon(skl.value);
			skl.hover = game.i18n.localize(DND4EBETA.trainingLevels[skl.value]);
			skl.label = game.i18n.localize(DND4EBETA.skills[s]);
		}
		
		this._prepareDataTraits(actorData.languages, 
			{"spoken": CONFIG.DND4EBETA.spoken, "script": CONFIG.DND4EBETA.script}
		);

		this._prepareDataProfs(actorData.details.armourProf, 
			{"profArmor": CONFIG.DND4EBETA.profArmor}
		);

		this._prepareDataProfs(actorData.details.weaponProf, 
			{ weapons:Object.assign(
				CONFIG.DND4EBETA.weaponProficiencies,
				CONFIG.DND4EBETA.simpleM,
				CONFIG.DND4EBETA.simpleR,
				CONFIG.DND4EBETA.militaryM,
				CONFIG.DND4EBETA.militaryR,
				CONFIG.DND4EBETA.superiorM,
				CONFIG.DND4EBETA.superiorR,
				CONFIG.DND4EBETA.improvisedM,
				CONFIG.DND4EBETA.improvisedR,
				CONFIG.DND4EBETA.implement
			)}
		);
		
		this._prepareDataSense(actorData.senses,
			{"vision": CONFIG.DND4EBETA.vision, "special": CONFIG.DND4EBETA.special}
		);
		
		this._prepareDataSave(actorData.details,
			{"saves": CONFIG.DND4EBETA.saves}
		);

		// Prepare owned items
		this._prepareItems(data);
		
		// Prepare active effects
		// data.effects = prepareActiveEffectCategories(this.actor.effects);
		data.effects = ActiveEffect4e.prepareActiveEffectCategories(actor.effects);

		// Resources
		actorData.resources = ["primary", "secondary", "tertiary"].reduce((obj, r) => {
			const res = actorData.resources[r] || {};
			res.name = r;
			res.placeholder = game.i18n.localize("DND4EBETA.Resource"+r.titleCase());
			if (res && res.value === 0) delete res.value;
			if (res && res.max === 0) delete res.max;
			obj[r] = res
			return obj;
		}, {});

		data.biographyHTML = await TextEditor.enrichHTML(data.system.biography, {
			secrets: isOwner,
			async: true,
			relativeTo: this.actor
		});

		return data;
	}
	
	_prepareDataTraits(data, map) {
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = data[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, l) => {
				obj[l] = choices[l];
				return obj;
			}, {});

			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
		}
	}

	_prepareDataProfs(data, map){
		for ( let [l, choices] of Object.entries(map) ) {

			let values = [];
			if ( data.value ) {
				values = data.value instanceof Array ? data.value : [data.value];
			}
			data.selected = values.reduce((obj, l) => {
				obj[l] = choices[l];
				return obj;
			}, {});
			data.selected

			// Add custom entry
			if ( data.custom ) {
				data.custom.split(";").forEach((c, i) => data.selected[`custom${i+1}`] = c.trim());
			}
			data.cssClass = !isEmpty(data.selected) ? "" : "inactive";
		}
	}

	_prepareItems(data) {
		//define diffrent item datasets
		const inventory = {
			weapon: { label: "DND4EBETA.ItemTypeWeaponPl", items: [], dataset: {type: "weapon"} },
			equipment: { label: "DND4EBETA.ItemTypeEquipmentPl", items: [], dataset: {type: "equipment"} },
			consumable: { label: "DND4EBETA.ItemTypeConsumablePl", items: [], dataset: {type: "consumable"} },
			tool: { label: "DND4EBETA.ItemTypeToolPl", items: [], dataset: {type: "tool"} },
			backpack: { label: "DND4EBETA.ItemTypeContainerPl", items: [], dataset: {type: "backpack"} },
			loot: { label: "DND4EBETA.ItemTypeLootPl", items: [], dataset: {type: "loot"} }
		};
		const powers = this._generatePowerGroups();

		const features = {
			raceFeats: { label: "DND4EBETA.FeatRace", items: [], dataset: {type: "raceFeats"} },
			classFeats: { label: "DND4EBETA.FeatClass", items: [], dataset: {type: "classFeats"} },
			pathFeats: { label: "DND4EBETA.FeatPath", items: [], dataset: {type: "pathFeats"} },
			destinyFeats: { label: "DND4EBETA.FeatDestiny", items: [], dataset: {type: "destinyFeats"} },
			feat: { label: "DND4EBETA.FeatLevel", items: [], dataset: {type: "feat"} },
			ritual: { label: "DND4EBETA.FeatRitual", items: [], dataset: {type: "ritual"} }
		};
		
		// Partition items by category
		let [items, pow, feats] = data.items.reduce((arr, item) => {
			// Item details
			item.img = item.img || DEFAULT_TOKEN;
			item.isStack = Number.isNumeric(item.system.quantity) && (item.system.quantity !== 1);

			// Item usage
			item.hasUses = item.system.uses && (item.system.preparedMaxUses > 0);
			// item.isOnCooldown = item.system.recharge && !!item.system.recharge.value && (item.system.recharge.charged === false);
			item.isDepleted = item.isOnCooldown && (item.system.uses?.per && (item.system.uses?.value > 0));
			//Causing error in v10, only getter no setter now.
			// item.hasTarget = !!item.data.target && !(["none",""].includes(item.data.target.type));
			// item.hasTarget = !!item.system.target && !(["none",""].includes(item.system.target.type));

			// Item toggle state
			this._prepareItemToggleState(item);

			// Classify items into types
			if ( Object.keys(inventory).includes(item.type ) ) arr[0].push(item);
			// else if ( Object.keys(powers).includes(item.type ) ) arr[1].push(item);
			else if ( item.type === "power") arr[1].push(item);
			else if ( Object.keys(features).includes(item.type ) ) arr[2].push(item);
			return arr;
		}, [[], [], [], []]);

		// Apply active item filters
		items = this._filterItems(items, this._filters.inventory);
		pow = this._filterItems(pow, this._filters.powers);
		feats = this._filterItems(feats, this._filters.features);

		// Organize items
		for ( let i of items ) {
			i.system.quantity = i.system.quantity || 0;
			i.system.weight = i.system.weight || 0;
			i.totalWeight = Math.round(i.system.quantity * i.system.weight * 10) / 10;
			inventory[i.type].items.push(i);
		}

		for ( let f of feats ) {
			features[f.type].items.push(f);
		}

		for ( let p of pow ) {
			powers[this._groupPowers(p,powers)].items.push(p);
		}

		data.inventory = Object.values(inventory);
		data.powers = Object.values(powers);
		data.features = Object.values(features);

		for (const [key, group] of Object.entries(powers)) {
			group.items?.forEach(item => {
				this._preparePowerRangeText(item);
				this._checkPowerAvailable(item);
			});
		}

		this._sortinventory(inventory);
		this._sortPowers(powers);
		this._sortFeatures(features);

		data.moveTitle = `
${parseInt(data.system.movement.walk.value)} ${game.i18n.localize("DND4EBETA.MovementUnit")} ${game.i18n.localize("DND4EBETA.MovementSpeedWalking")}
${parseInt(data.system.movement.run.value)} ${game.i18n.localize("DND4EBETA.MovementUnit")} ${game.i18n.localize("DND4EBETA.MovementSpeedRunning")}
${parseInt(data.system.movement.charge.value)} ${game.i18n.localize("DND4EBETA.MovementUnit")} ${game.i18n.localize("DND4EBETA.MovementSpeedCharging")}
${parseInt(data.system.movement.climb.value)} ${game.i18n.localize("DND4EBETA.MovementUnit")} ${game.i18n.localize("DND4EBETA.MovementSpeedClimbing")}
${parseInt(data.system.movement.shift.value)} ${game.i18n.localize("DND4EBETA.MovementUnit")} ${game.i18n.localize("DND4EBETA.MovementSpeedShifting")}`;

		if(data.system.movement.custom){
			const moveCustom = [];
			data.system.movement.custom.split(";").forEach((c, i) => (c ? moveCustom[i] = c.trim() : null) );
			data.system.moveCustom = moveCustom;
			moveCustom.forEach((c) => data.moveTitle += `\n${c.trim()}`);
		}
	}

	_compareValues(key, order = 'asc') {
		return function innerSort(a, b) {
			if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {	
				const varA = (typeof a[key] === 'string') ? a[key].toUpperCase() : a[key];
				const varB = (typeof b[key] === 'string') ? b[key].toUpperCase() : b[key];
	
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

				const varA = (typeof a.system[key] === 'string') ? a.system[key].toUpperCase() : a.system[key];
				const varB = (typeof b.system[key] === 'string') ? b.system[key].toUpperCase() : b.system[key];
	
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

	_sortinventory(inventory) {
		const sort = this.object.system.featureSortTypes;
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(inventory)) {
			group.items.sort((a,b) => a.sort - b.sort);
		}
	}

	/* -------------------------------------------- */

	_sortFeatures(feats) {
		const sort = this.object.system.featureSortTypes;
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(feats)) {
			group.items.sort(this._compareValues(sort));
		}
	}

	/* -------------------------------------------- */

	_sortPowers(powers) {
		const sort = this.object.system.powerSortTypes;
		for (const [keyy, group] of Object.entries(powers)) {
			if(sort === "none"){
				group.items.sort((a,b) => a.sort - b.sort);
			} else {
				group.items.sort(this._compareValues(sort));
			}
		}
	}

	_groupPowers(power, powerGroups) {
		if(this.object.system.powerGroupTypes === "action" || this.object.system.powerGroupTypes == undefined) {
			if(Object.keys(powerGroups).includes(power.system.actionType) ) return power.system.actionType;
		}
		if(this.object.system.powerGroupTypes === "type") {
			if(Object.keys(powerGroups).includes(power.system.powerType) )return power.system.powerType;
		}
		if(this.object.system.powerGroupTypes === "powerSubtype") {
			if(Object.keys(powerGroups).includes(power.system.powerSubtype) )return power.system.powerSubtype;
		}
		if(this.object.system.powerGroupTypes === "usage") {
			if(Object.keys(powerGroups).includes(power.system.useType) ) return power.system.useType;
		}
		return "other";
	}
	_generatePowerGroups() {
		const actorData = this.object.system;
		if(actorData.powerGroupTypes === "action" || actorData.powerGroupTypes == undefined) {
			return {
				standard: { label: "DND4EBETA.ActionStandard", items: [], dataset: {type: "standard"} },
				move: { label: "DND4EBETA.ActionMove", items: [], dataset: {type: "move"} },
				minor: { label: "DND4EBETA.ActionMinor", items: [], dataset: {type: "minor"} },
				free: { label: "DND4EBETA.ActionFree", items: [], dataset: {type: "free"} },
				reaction: { label: "DND4EBETA.ActionReaction", items: [], dataset: {type: "reaction"} },
				interrupt: { label: "DND4EBETA.ActionInterrupt", items: [], dataset: {type: "interrupt"} },
				opportunity: { label: "DND4EBETA.ActionOpportunity", items: [], dataset: {type: "opportunity"} },
				other: { label: "DND4EBETA.Other", items: [], dataset: {type: "other"} },
			};
		}
		else if(actorData.powerGroupTypes === "type") {
			return {
				inherent: { label: "DND4EBETA.Inherent", items: [], dataset: {type: "inherent"} },
				class: { label: "DND4EBETA.Class", items: [], dataset: {type: "class"} },
				race: { label: "DND4EBETA.Race", items: [], dataset: {type: "race"} },
				paragon: { label: "DND4EBETA.Paragon", items: [], dataset: {type: "paragon"} },
				epic: { label: "DND4EBETA.Epic", items: [], dataset: {type: "epic"} },
				theme: { label: "DND4EBETA.Theme", items: [], dataset: {type: "theme"} },
				feat: { label: "DND4EBETA.Feat", items: [], dataset: {type: "feat"} },
				item: { label: "DND4EBETA.PowerItem", items: [], dataset: {type: "item"} },
				other: { label: "DND4EBETA.Other", items: [], dataset: {type: "other"} },
			};
		}
		else if(actorData.powerGroupTypes === "powerSubtype") {
			return {
				attack: { label: "DND4EBETA.PowerAttack", items: [], dataset: {type: "attack"} },
				utility: { label: "DND4EBETA.PowerUtil", items: [], dataset: {type: "utility"} },
				feature: { label: "DND4EBETA.PowerFeature", items: [], dataset: {type: "feature"} },
				other: { label: "DND4EBETA.Other", items: [], dataset: {type: "other"} },
			};
		}
		else return { //"usage"
			atwill: { label: "DND4EBETA.PowerAt", items: [], dataset: {type: "atwill"} },
			encounter: { label: "DND4EBETA.PowerEnc", items: [], dataset: {type: "encounter"} },
			daily: { label: "DND4EBETA.PowerDaily", items: [], dataset: {type: "daily"} },
			item: { label: "DND4EBETA.PowerItem", items: [], dataset: {type: "item"} },
			recharge: { label: "DND4EBETA.PowerRecharge", items: [], dataset: {type: "recharge"} },
			other: { label: "DND4EBETA.Other", items: [], dataset: {type: "other"} },
		};
	}

	_checkPowerAvailable(itemData) {
		if( (!itemData.system.uses.value && itemData.system.preparedMaxUses)
			|| !itemData.system.prepared) {
				itemData.system.notAvailable = true;

		}
	}
  /* -------------------------------------------- */
	/**
   * A helper method to generate the text for the range of difrent powers
   * @param {itemData} itemData
   * @private
   */
	 _preparePowerRangeText(itemData) {

		let area;
		if(itemData.system.area) {
			try{
				let areaForm = game.helper.commonReplace(`${itemData.system.area}`, this.actor);
				area = Roll.safeEval(areaForm);
			} catch (e) {
				area = itemData.system.area;
			}
		} else {
			area = 0;
		}

		if(itemData.system.rangeType === "range") {
			itemData.system.rangeText = `Ranged ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = `R`
			itemData.system.rangeTextBlock = `${itemData.system.rangePower}`
		} else if(itemData.system.rangeType === "closeBurst") {
			itemData.system.rangeText = `Close Burst ${area}`
			itemData.system.rangeTextShort = "C-BU"
			itemData.system.rangeTextBlock = `${area}`
		} else if(itemData.system.rangeType === "rangeBurst") {
			itemData.system.rangeText = `Area Burst ${area} within ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = "A-BU"
			itemData.system.rangeTextBlock = `${area} - ${itemData.system.rangePower}`
		} else if(itemData.system.rangeType === "closeBlast") {
			itemData.system.rangeText = `Close Blast ${area}`
			itemData.system.rangeTextShort = "C-BL"
			itemData.system.rangeTextBlock = `${area}`
		} else if(itemData.system.rangeType === "rangeBlast") {
			itemData.system.rangeText = `Area Blast ${area} within ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = "A-BL"
			itemData.system.rangeTextBlock = `${area} - ${itemData.system.rangePower}`
		} else if(itemData.system.rangeType === "wall") {
			itemData.system.rangeText = `Area Wall ${area} within ${itemData.system.rangePower}`
			itemData.system.rangeTextShort = "W"
			itemData.system.rangeTextBlock = `${area} - ${itemData.system.rangePower}`
		} else if(itemData.system.rangeType === "personal") {
			itemData.system.rangeText = "Personal"
			itemData.system.rangeTextShort = "P"
		} else if(itemData.system.rangeType === "special") {
			itemData.system.rangeText = "Special"
			itemData.system.rangeTextShort = "S"
		} else if(itemData.system.rangeType === "touch") {
			itemData.system.rangeTextShort = "M-T";
			if(itemData.system.rangePower == null){
				itemData.system.rangeTextBlock = '';
				itemData.system.rangeText = `Melee Touch`;
			} else {
				itemData.system.rangeText = `Melee Touch ${itemData.system.rangePower}`;
				itemData.system.rangeTextBlock = `${itemData.system.rangePower}`;
			}
		} else if(itemData.system.rangeType === "melee"){
			if(itemData.system.rangePower === undefined || itemData.system.rangePower === null){
				itemData.system.rangeText = `Melee`;
				itemData.system.rangeTextShort = `M`;
			} else {
				itemData.system.rangeText = `Melee ${itemData.system.rangePower}`;
				itemData.system.rangeTextShort = `M`;
				itemData.system.rangeTextBlock = `${itemData.system.rangePower}`
			}
		} else if(itemData.system.rangeType === "reach"){
			itemData.system.rangeText = `Reach ${itemData.system.rangePower}`;
			itemData.system.rangeTextShort = `R`;
			itemData.system.rangeTextBlock = `${itemData.system.rangePower}`
		} else if(itemData.system.rangeType === "weapon") {

			try {
				const weaponUse = Helper.getWeaponUse(itemData.system, this.actor);
				if(weaponUse.system.isRanged) {
					itemData.system.rangeText = `Range Weapon - ${weaponUse.name}`
					itemData.system.rangeTextShort = `W-R`
					itemData.system.rangeTextBlock = `${weaponUse.system.range.value}/${weaponUse.system.range.long}`
				} else {
					itemData.system.rangeText = `Melee Weapon - ${weaponUse.name}`;
					itemData.system.rangeTextShort = "W-M";
					
					if(itemData.system.rangePower == null){
						itemData.system.rangeTextBlock = '';
					} else {
						itemData.system.rangeTextBlock = `${itemData.system.rangePower}`;
					}
				}

			} catch {
				itemData.system.rangeText = "Weapon";
				itemData.system.rangeTextShort = "W-M";
				itemData.system.rangeTextBlock = `${itemData.system.rangePower}`

				if(itemData.system.rangePower == null){
					itemData.system.rangeTextBlock = '';
				} else {
					itemData.system.rangeTextBlock = `${itemData.system.rangePower}`;
				}
			}

		} else {
			itemData.system.rangeText = game.i18n.localize("DND4EBETA.NotAvalible");
			itemData.system.rangeTextShort = game.i18n.localize("DND4EBETA.NotAvalibleShort");
		}
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
	  // const isAlways = getProperty(item.data, "preparation.mode") === "always";
	  const isPrepared =  getProperty(item.system, "prepared");
	  item.toggleClass = isPrepared ? "active" : "";
	  // if ( isAlways ) item.toggleClass = "fixed";
	  // if ( isAlways ) item.toggleTitle = CONFIG.DND4EBETA.spellPreparationModes.always;
	  // else if ( isPrepared ) item.toggleTitle = CONFIG.DND4EBETA.spellPreparationModes.prepared;
	  if ( isPrepared ) item.toggleTitle = game.i18n.localize("DND4EBETA.PowerPrepared");
	  else item.toggleTitle = game.i18n.localize("DND4EBETA.PowerUnPrepared");
	}
	else {
	  const isActive = getProperty(item.system, "equipped");
	  item.toggleClass = isActive ? "active" : "";
	  item.toggleTitle = game.i18n.localize(isActive ? "DND4EBETA.Equipped" : "DND4EBETA.Unequipped");
	}
  }
	_prepareDataSense(data, map) {
		
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = data[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, l) => {
				obj[l] = l[1] != "" ? `${choices[l[0]]} ${l[1]} sq` : choices[l[0]];
				return obj;
			}, {});
			// Add custom entry
			if ( trait.custom ) {
				trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
			}
			trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
			
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
			trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
			
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

  /** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		const inputs = html.find("input");
		inputs.focus(event => event.currentTarget.select());
		inputs.addBack().find('[data-dtype="Number"]').change(this._onChangeInputDelta.bind(this));

		html.find('.skill-training').on("click contextmenu", this._onCycleSkillProficiency.bind(this));

		// Update Inventory Item
		html.find('.item-edit').click(event => {
		const li = $(event.currentTarget).parents(".item");
		const item = this.actor.items.get(li.data("itemId"));
		item.sheet.render(true);
		});


		if ( this.actor.isOwner ) {	
			// Roll Skill Checks
			html.find('.skill-name').click(this._onRollSkillCheck.bind(this));

			html.find('.passive-message').click(this._onRollPassiveCheck.bind(this));
			
			//Roll Abillity Checks
			html.find('.ability-name').click(this._onRollAbilityCheck.bind(this));
			
			//Roll Defence Checks
			html.find('.def-name').click(this._onRollDefenceCheck.bind(this));
			
			//Open HP-Options
			html.find('.health-option').click(this._onHPOptions.bind(this));
			
			//Open Skill-Bonus
			html.find('.skill-bonus').click(this._onSkillBonus.bind(this));
			html.find('.death-save-bonus').click(this._onDeathSaveBonus.bind(this));
			html.find('.roll-save-bonus').click(this._onSavingThrowBonus.bind(this));
			html.find('.surge-bonus').click(this._onSurgeBonus.bind(this));
			html.find('.envimental-loss-bonus').click(this._onSurgeEnv.bind(this));
			html.find('.secondwind-bonus').click(this._onSecondWindBonus.bind(this));
			html.find('.defence-bonus').click(this._onDefencesBonus.bind(this));
			html.find('.init-bonus').click(this._onInitiativeBonus.bind(this));
			html.find('.move-bonus').click(this._onMovementBonus.bind(this));
			html.find('.passive-bonus').click(this._onPassiveBonus.bind(this));
			html.find('.modifiers-bonus').click(this._onModifiersBonus.bind(this));
			html.find('.resistances-bonus').click(this._onResistancesBonus.bind(this));
			
			html.find('.movement-dialog').click(this._onMovementDialog.bind(this));		
			
			html.find('.custom-roll-descriptions').click(this._onCustomRolldDescriptions.bind(this));
			
			//second wind
			html.find('.second-wind').click(this._onSecondWind.bind(this));

			// heal menu
			html.find('.heal-menu').click(this._onHealMenuDialog.bind(this));

			//action point
			html.find('.action-point').click(this._onActionPointDialog.bind(this));
			html.find('.action-point-extra').click(this._onActionPointExtraDialog.bind(this));
			
			//short rest
			html.find('.short-rest').click(this._onShortRest.bind(this));
			
			//long rest
			html.find('.long-rest').click(this._onLongRest.bind(this));		
			
			//death save
			html.find('.death-save').click(this._onDeathSave.bind(this));
			html.find('.roll-save').click(this._onSavingThrow.bind(this));

			//roll init
			html.find('.rollInitiative').click(this._onrollInitiative.bind(this));
			
			// Trait Selector
			html.find('.trait-selector').click(this._onTraitSelector.bind(this));
			html.find('.trait-selector-weapon').click(this._onTraitSelectorWeapon.bind(this));
			html.find('.trait-selector-senses').click(this._onTraitSelectorSense.bind(this));
			html.find('.list-string-input').click(this._onListStringInput.bind(this));
			
			//save throw bonus
			html.find(`.trait-selector-save`).click(this._onTraitSelectorSaveThrow.bind(this));
			
			//Inventory & Item management
			html.find('.item-create').click(this._onItemCreate.bind(this));
			html.find('.item-edit').click(this._onItemEdit.bind(this));
			html.find('.item-delete').click(this._onItemDelete.bind(this));
			html.find('.item-uses input').click(event => event.target.select()).change(this._onUsesChange.bind(this));

			html.find('.power-create').click(this._onPowerItemCreate.bind(this));

			html.find('.item-import').click(this._onItemImport.bind(this));

			// Active Effect management
			// html.find(".effect-control").click(event => onManageActiveEffect(event, this.actor));
			html.find(".effect-control").click(event => ActiveEffect4e.onManageActiveEffect(event, this.actor));
		
			// Item summaries
			html.find('.item .item-name h4').click(event => this._onItemSummary(event));		
			
			// Item State Toggling
			html.find('.item-toggle').click(this._onToggleItem.bind(this));
		
			//convert currency to it's largest form to save weight.
			html.find(".currency-convert").click(this._onConvertCurrency.bind(this));
			
			// Item Rolling
			html.find('.item .item-image').click(event => this._onItemRoll(event));
			html.find('.item .item-recharge').click(event => this._onItemRecharge(event));

			html.find('.effect-save').click(event => this._onRollEffectSave(event));

			html.find('.encumbrance-options').click(this._onEncumbranceDialog.bind(this))
			
		}
	}

  /* -------------------------------------------- */

  /**
   * Handle input changes to numeric form fields, allowing them to accept delta-typed inputs
   * @param event
   * @private
   */
	_onChangeInputDelta(event) {
		const input = event.target;
		const value = input.value;

		if(/^[0-9]+$/.test(value)) {
			return;
		}
		
		if(!/^[\-=+ 0-9]+$/.test(value)) {
			input.value = getProperty(this.actor, input.name)
			return;}

		if ( ["+"].includes(value[0]) ) {
			let delta = parseFloat(value.replace(/[^0-9]/g, ""));
			input.value = getProperty(this.actor, input.name) + delta || getProperty(this.actor, input.name);
		}
		else if ( ["-"].includes(value[0]) ) {
			let delta = parseFloat(-value.replace(/[^0-9]/g, ""));
			input.value = getProperty(this.actor, input.name) + delta || getProperty(this.actor, input.name);
		} else if ( value[0] === "=" ) {
			input.value = value.replace(/[^\-0-9]/g, "");
		} else{
			input.value = getProperty(this.actor, input.name)
		}
	}

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
	async _onItemSummary(event) {
		event.preventDefault();
		const li = $(event.currentTarget).parents(".item")
	    const itemId = li.data("item-id")
	  	if (!itemId)
		{
			console.log("got an item summary event for something without an item id.  Assuming its an effect.")
			return
		}
		const item = this.actor.items.get(itemId)
		const chatData = await item.getChatData({secrets: this.actor.isOwner});


		// Toggle summary
		if ( li.hasClass("expanded") ) {
			let summary = li.children(".item-summary");
			summary.slideUp(200, () => summary.remove());
		} else {
			//generate summary entry here
			if (item.type === "power") {
				let div = $(`<div class="item-summary"></div>`);
				let descrip = $(`<div class="item-description">${chatData.description.value}</div>`);
				div.append(descrip);

				if(item.system.autoGenChatPowerCard){
					let details = $(`<div class="item-details">${Helper._preparePowerCardData(chatData, CONFIG, this.actor.toObject(false))}</div>`);
					div.append(details);
				}

				li.append(div.hide());
				div.slideDown(200);
			} else {
				let div = $(`<div class="item-summary">${chatData.description.value}</div>`);
				let props = $(`<div class="item-properties"></div>`);
				chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
				div.append(props);
				li.append(div.hide());
				div.slideDown(200);
			}
		}
		li.toggleClass("expanded");
	}
  
  /* -------------------------------------------- */

  /**
   * Handle toggling the state of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  _onToggleItem(event) {
	event.preventDefault();
	const itemId = event.currentTarget.closest(".item").dataset.itemId;
	const item = this.actor.items.get(itemId);
	const power = ["power","atwill","encounter","daily","utility"];
	const attr = power.includes(item.type) ? "system.prepared" : "system.equipped";
	return item.update({[attr]: !getProperty(item, attr)});
  }
  /* -------------------------------------------- */

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
	_onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const type = header.dataset.type;
		const itemData = {
			name: game.i18n.format("DND4EBETA.ItemNew", {type: type.capitalize()}),
			type: type,
			data: duplicate(header.dataset)
		};
		delete itemData.data["type"];
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

	async _onItemImport(event) {
		event.preventDefault();
		new ItemImporterDialog(this.actor).render(true);
	}

	_onPowerItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		const type = header.dataset.type;
		const itemData = {
			name: `${game.i18n.format("DND4EBETA.ItemNew", {type: type.capitalize()})} Power`,
			type: "power",
			data: duplicate(header.dataset)
		};

		if(this.object.system.powerGroupTypes === "action" || this.object.system.powerGroupTypes == undefined) {
			itemData.data.actionType = type;
		}
		else if(this.object.system.powerGroupTypes === "type") {
			itemData.data.powerType = type;
		}
		else if(this.object.system.powerGroupTypes === "usage") {
			itemData.data.useType = type;
			if(["encounter", "daily", "recharge", "item"].includes(type)) {
				itemData.data.uses = {
					value: 1,
					max: 1,
					per: ["encounter", "charges", "round"].includes(type)  ? "enc" : "day"
					// per: type === "encounter" ? "enc" : "day"
				};
			}
		}

		itemData.data.autoGenChatPowerCard = game.settings.get("dnd4e", "powerAutoGenerateLableOption");
		
		if(this.actor.type === "NPC"){
			
			itemData.data.weaponType = "none";
			itemData.data.weaponUse = "none";

			itemData.data.attack = {
				formula:"@lvhalf",
				ability:"form"
			};
			itemData.data.hit  = {
				formula:"@powBase",
				critFormula:"@powMax",
				baseDiceType: "d8",
				detail: "1d8 damage."
			};
		}

		if(game.settings.get("dnd4e", "halfLevelOptions")){
			if(this.actor.type === "NPC"){
				itemData.data.attack.formula = ""; 
			} else {
				itemData.data.attack = {
					formula:"@wepAttack + @powerMod + @atkMod"
				}
			}
		}
		
		return this.actor.createEmbeddedDocuments("Item", [itemData]);
	}

  /* -------------------------------------------- */

  /**
   * Handle editing an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemEdit(event) {
	event.preventDefault();
	const li = event.currentTarget.closest(".item");
	const item = this.actor.items.get(li.dataset.itemId);
	item.sheet.render(true);
  }

  /* -------------------------------------------- */

  /**
   * Handle deleting an existing Owned Item for the Actor
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemDelete(event) {
    event.preventDefault();
    const li = event.currentTarget.closest(".item");
    const item = this.actor.items.get(li.dataset.itemId);
    if ( item )  {
		if (game.settings.get("dnd4e", "itemDeleteConfirmation")) {
			return Dialog.confirm({
				title: game.i18n.format("DND4EBETA.DeleteConfirmTitle", {name: item.name}),
				content: game.i18n.format("DND4EBETA.DeleteConfirmContent", {name: item.name}),
				yes: () => { return item.delete() },
				no: () => {},
				defaultYes: true
			});
		}
		else {
			return item.delete();
		}
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
		const uses = Math.clamped(0, parseInt(event.target.value), item.system.preparedMaxUses);
		event.target.value = uses;
		return item.update({ 'system.uses.value': uses });
	}
  
	/* -------------------------------------------- */
  
	/**
	*Opens dialog config window for HP options 
	*turns on/off auto calculation of HP based on class stats
	*keep or reset tempHP on short rest.
	*/
	_onHPOptions(event) {
		event.preventDefault();

		new HPOptions(this.actor).render(true)
	}
	
	/* -------------------------------------------- */
	/**
	* Opens bonuses dialog config window for selected Skills
	*/
	
	_onSkillBonus(event) {
		event.preventDefault();
		const skillName = event.currentTarget.parentElement.dataset.skill;
		const target = `system.skills.${skillName}`;
		const options = {target: target, label: `${this.actor.system.skills[skillName].label} Skill Bonus`, skill: true };
		new AttributeBonusDialog(this.actor, options).render(true);
	}
	/* -------------------------------------------- */

	_onDeathSaveBonus(event) {
		event.preventDefault();
		const options = {target: `system.details.deathsavebon`, label: "Death Savingthrow Bonus" };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	
	_onSurgeBonus(event) {
		event.preventDefault();
		const options = {target: `system.details.surgeBon`, label: "Healing Surge Bonus" };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onSurgeEnv(event) {
		event.preventDefault();
		const options = {target: `system.details.surgeEnv`, label: "Healing Surges Environmental Losses" };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}

	_onSecondWindBonus(event) {
		event.preventDefault();
		const options = {target: `system.details.secondwindbon`, label: "Second Wind Bonus", secondWind: true };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onDefencesBonus(event) {
		event.preventDefault();
		const defName = event.currentTarget.parentElement.dataset.defence;
		const target = `system.defences.${defName}`;
		const options = {target: target, label: `${this.actor.system.defences[defName].label} Defence Bonus`, ac: (defName ==="ac")  };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onInitiativeBonus(event) {
		event.preventDefault();
		const options = {target: `system.attributes.init`, label: "Initiative Bonus", init: true };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onMovementBonus(event) {
		event.preventDefault();
		const moveName = event.currentTarget.parentElement.dataset.movement;
		const target = `system.movement.${moveName}`;
		const options = {target: target, label: `${this.actor.system.movement[moveName].label} Movement Bonus` };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onMovementDialog(event) {
		event.preventDefault();
		new MovementDialog(this.actor).render(true)
	}

	_onHealMenuDialog(event) {
		event.preventDefault();
		new HealMenuDialog(this.actor).render(true)
	}

	_onEncumbranceDialog(event) {
		event.preventDefault();
		new EncumbranceDialog(this.actor).render(true);
	}

	_onPassiveBonus(event) {
		event.preventDefault();
		const passName = event.currentTarget.parentElement.dataset.passive;
		const skillName = this.actor.system.passive[passName].skill;
		const target = `system.passive.${passName}`;
		const options = {target: target, label: `Passive ${this.actor.system.skills[skillName].label} Bonus` };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}	

	_onModifiersBonus(event) {
		event.preventDefault();
		const modifierName = event.currentTarget.parentElement.dataset.modifiers;
		const target = `system.modifiers.${modifierName}`;
		const options = {target: target, label: `${this.actor.system.modifiers[modifierName].label} Bonus` };
		new AttributeBonusDialog(this.actor, options).render(true);
	}	

	_onResistancesBonus(event) {
		event.preventDefault();
		const resName = event.currentTarget.parentElement.dataset.res;
		const target = `system.resistances.${resName}`;
		const options = {target: target, label: `${this.actor.system.resistances[resName].label} Damage Resistances Bonus` };
		new AttributeBonusDialog(this.actor, options).render(true);
	}
	
	_onCustomRolldDescriptions(event) {
		event.preventDefault();
		const options = {data: this.actor};
		new CustomRolldDescriptions(this.actor).render(true, options);
	}
	/**
	* Opens dialog window to spend Second Wind
	*/
	_onSecondWind(event) {
		event.preventDefault();
		new SecondWindDialog(this.actor).render(true);		
	}
	
	/* -------------------------------------------- */

	_onActionPointDialog(event) {
		event.preventDefault();
		new ActionPointDialog(this.actor).render(true);
	}

	_onActionPointExtraDialog(event) {
		event.preventDefault();
		new ActionPointExtraDialog(this.actor).render(true);
	}

	/**
	*Opens dialog window to short rest.
	*Spend n number of healin surges,
	*reset encounter powers, action point ussage, second wind ussage.
	*/
	_onShortRest(event) {
		event.preventDefault();
		const isFF = (event?.shiftKey || event?.altKey || event?.ctrlKey || event?.metaKey);
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
	_onLongRest(event) {
		event.preventDefault();
		const isFF = (event?.shiftKey || event?.altKey || event?.ctrlKey || event?.metaKey);
		if(isFF){
			return this.actor.longRest(event,{isFF});
		}
		new LongRestDialog(this.actor).render(true)
	}

	_onDeathSave(event) {
		event.preventDefault();
		const isFF = (event?.shiftKey || event?.altKey || event?.ctrlKey || event?.metaKey);
		if(isFF){
			return this.actor.rollDeathSave(event,{isFF});
		}
		new DeathSaveDialog(this.actor).render(true);
	}

	_onrollInitiative(event) {
		event.preventDefault();
		return this.actor.rollInitiative({createCombatants: true},{event: event});
	}

	_onSavingThrow(event) {
		event.preventDefault();
		const isFF = (event?.shiftKey || event?.altKey || event?.ctrlKey || event?.metaKey);
		if(isFF){
			return this.actor.rollSave(event,{isFF});
		}
		return new SaveThrowDialog(this.actor).render(true);
	}

	_onSavingThrowBonus(event) {
		event.preventDefault();
		const options = {target: `system.details.saves`, label: "Savingthrow Bonus" };
		new AttributeBonusDialog(this.actor, options).render(true);	
	}

	_onCycleSkillProficiency(event) {
		event.preventDefault();
		const field = $(event.currentTarget).siblings('input[type="hidden"]');

		// Get the current level and the array of levels
		const level = parseFloat(field.val());
		const levels = [0, 5, 8];
		let idx = levels.indexOf(level);

		// Toggle next level - forward on click, backwards on right
		if ( event.type === "click" ) {
			field.val(levels[(idx === levels.length - 1) ? 0 : idx + 1]);
		} else if ( event.type === "contextmenu" ) {
			field.val(levels[(idx === 0) ? levels.length - 1 : idx - 1]);
		}

		// Update the field value and save the form
		this._onSubmit(event);
	}

	/* -------------------------------------------- */

	/**
	 * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
	 * @private
	 */
	_onItemRoll(event) {
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);
		
		if ( item.type === "power") {
			const fastForward = Helper.isUsingFastForwardKey(event);
			return this.actor.usePower(item, {configureDialog: !fastForward, fastForward: fastForward});
		}
		// Otherwise roll the Item directly
		return item.roll();
	}

	/* -------------------------------------------- */

	_onRollEffectSave(event){
		event.preventDefault();
		console.log("rollSave Throw v Effect!");

		const effectId = event.currentTarget.closest(".item").dataset.effectId;
		const effect = this.actor.effects.get(effectId);

		let save = new SaveThrowDialog(this.actor, {effectSave:true, effectId: effectId}).render(true);

		// console.log(save)
		// console.log(effectId);
		// console.log(this.actor.effects.get(effectId));
	}
	/* -------------------------------------------- */

	_onItemRecharge(event){
		event.preventDefault();
		const itemId = event.currentTarget.closest(".item").dataset.itemId;
		const item = this.actor.items.get(itemId);

		if ( item.type === "power") {

			if(item.system.rechargeRoll || (!item.system.rechargeRoll && !item.system.rechargeCondition)){
				const r = new Roll("1d6");
				r.options.async = true;
				r.dice[0].options.recharge = true;
				r.dice[0].options.critical = item.system.rechargeRoll || 6;
				r.dice[0].options.fumble = r.dice[0].options.critical -1;
				r.evaluate({async: false});
	
				let flav = `${item.name} did not recharge.`;
				if(r.total >= r.dice[0].options.critical){
					this.object.updateEmbeddedDocuments("Item", [{_id:itemId, "system.uses.value": item.system.preparedMaxUses}]);
					flav = `${item.name} successfully recharged!`;
				}

				r.toMessage({
					user: game.user.id,
					speaker: {actor: this.object, alias: this.object.name},
					flavor: flav,
					rollMode: game.settings.get("core", "rollMode"),
					messageData: {"flags.dnd4eBeta.roll": {type: "other", itemId: this.id }}
				});

			} else if (item.system.rechargeCondition) {

				this.object.updateEmbeddedDocuments("Item", [{_id:itemId, "system.uses.value": item.system.preparedMaxUses}]);

				ChatMessage.create({
					user: game.user.id,
					speaker: {actor: this.object, alias: this.object.name},
					flavor: `${item.name} successfully recharged! Due to meeting condition ${item.system.rechargeCondition}`
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
  async _onConvertCurrency(event) {
	event.preventDefault();
	return Dialog.confirm({
	  title: `${game.i18n.localize("DND4EBETA.CurrencyConvert")}`,
	  content: `<p>${game.i18n.localize("DND4EBETA.CurrencyConvertHint")}</p>`,
	  yes: () => this.convertCurrency()
	});
  }

  /* -------------------------------------------- */

  /**
   * Convert all carried currency to the highest possible denomination to reduce the number of raw coins being
   * carried by an Actor.
   * @return {Promise<Actor4e>}
   */
  convertCurrency() {
	const curr = duplicate(this.actor.system.currency);
	const convert = CONFIG.DND4EBETA.currencyConversion;
	for ( let [c, t] of Object.entries(convert) ) {
	  let change = Math.floor(curr[c] / t.each);
	  curr[c] -= (change * t.each);
	  curr[t.into] += change;
	}
	return this.object.update({"system.currency": curr});
  }
  
  /* -------------------------------------------- */

  /**
   * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
	_onTraitSelector(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("h4");
		const choices = CONFIG.DND4EBETA[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices};
		new TraitSelector(this.actor, options).render(true);
	}

	_onTraitSelectorWeapon(event){
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("h4");
		const choices = CONFIG.DND4EBETA.weaponProficienciesMap;
		const options = { name: a.dataset.target, title: label.innerText, choices, datasetOptions: a.dataset.options, config:CONFIG};
		new TraitSelector(this.actor, options).render(true);
	}

	_onTraitSelectorSense(event) {
		event.preventDefault();
		const a = event.currentTarget;
		// const label = a.parentElement.parentElement.querySelector("h4");
		const label = a.parentElement.querySelector("span");
		const choices = CONFIG.DND4EBETA[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices };
		new TraitSelectorSense(this.actor, options).render(true);
	}
	
	_onListStringInput(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("span");
		const options = { name: a.dataset.target, title: label.innerText};
		new ListStringInput(this.actor, options).render(true);
	}
	
	_onTraitSelectorSaveThrow(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const choices = CONFIG.DND4EBETA[a.dataset.options];
		const options = { name: a.dataset.target, title: "Saving Throw Mods", choices };
		new TraitSelectorSave(this.actor, options).render(true);
	}

  /* -------------------------------------------- */

  /** @override */
  setPosition(options={}) {
	const position = super.setPosition(options);
	const sheetBody = this.element.find(".sheet-body");
	const bodyHeight = position.height - 345;
	sheetBody.css("height", bodyHeight);
	return position;
  }

	/* -------------------------------------------- */

	/**
	 * Handle rolling a Skill check
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onRollSkillCheck(event) {
		event.preventDefault();
		const skill = event.currentTarget.parentElement.dataset.skill;
		this.actor.rollSkill(skill, {event: event});
	}
  /* -------------------------------------------- */
  
  /**
   * Handle posting a chat message for displaying passive skills.
   * @param {Event} event   The originating click event
   * @private
   */
	_onRollPassiveCheck(event) {
		event.preventDefault();
		const passName = event.currentTarget.parentElement.dataset.passive;
		const skillName = this.actor.system.passive[passName].skill;

		ChatMessage.create({
			user: game.user.id,
			speaker: {actor: this.object, alias: this.object.name},
			content: `Passive ${this.actor.system.skills[skillName].label} Skill Check: <SPAN STYLE="font-weight:bold">${this.object.system.passive[passName].value}`
		});	
	}

  /* -------------------------------------------- */
  
  /**
   * Handle rolling a ability check
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollAbilityCheck(event) {
	event.preventDefault();
	let ability = event.currentTarget.parentElement.dataset.ability;
	this.actor.rollAbility(ability, {event: event});
  }
  
  /* -------------------------------------------- */

  /**
   * Handle rolling a defences check
   * @param {Event} event   The originating click event
   * @private
   */
	_onRollDefenceCheck(event) {
		event.preventDefault();
		const def = event.currentTarget.parentElement.dataset.defence;
		this.actor.rollDef(def, {event: event});
	}

}
