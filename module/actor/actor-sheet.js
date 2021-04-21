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
import TraitSelector from "../apps/trait-selector.js";
import TraitSelectorSense from "../apps/trait-selector-sense.js";
import TraitSelectorSave from "../apps/trait-selector-save.js";
import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects.js";
import HPOptions from "../apps/hp-options.js";
import { Helper } from "../helper.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ActorSheet4e extends ActorSheet {

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
  
  /** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["dnd4eBeta", "sheet", "actor"],
			template: "systems/dnd4eBeta/templates/actor-sheet.html",
			width: 800,
			height: 905,
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

	/** @override */
	getData() {

		let data = super.getData();
		data.config = CONFIG.DND4EBETA;
		data.actor.data.size = DND4EBETA.actorSizes;
		
		for ( let [s, skl] of Object.entries(data.actor.data.skills)) {
			skl.ability = data.actor.data.abilities[skl.ability].label.substring(0, 3);
			skl.icon = this._getTrainingIcon(skl.value);
			skl.hover = game.i18n.localize(DND4EBETA.trainingLevels[skl.value]);
			skl.label = game.i18n.localize(DND4EBETA.skills[s]);
		}
		
		this._prepareData(data.actor.data.languages, 
			{"spoken": CONFIG.DND4EBETA.spoken, "script": CONFIG.DND4EBETA.script}
		);
		
		this._prepareDataSense(data.actor.data.senses,
			{"vision": CONFIG.DND4EBETA.vision, "special": CONFIG.DND4EBETA.special}
		);
		
		this._prepareDataSave(data.actor.data.details,
			{"saves": CONFIG.DND4EBETA.saves}
		);

		// Prepare owned items
		this._prepareItems(data);
		
		// Prepare active effects
		data.effects = prepareActiveEffectCategories(this.entity.effects);

		// data.actor.data.details.isBloodied = (data.actor.data.attributes.hp.value <= data.actor.data.attributes.hp.max/2);
		return data;
	}
	
	_prepareData(data, map) {
		// const map = {
			// "spoken": CONFIG.DND4EBETA.spoken,
			// "script": CONFIG.DND4EBETA.script,
			// "vision": CONFIG.DND4EBETA.vision,
			// "special": CONFIG.DND4EBETA.special
		// }
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
			trait.cssClass = !isObjectEmpty(trait.selected) ? "" : "inactive";
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
			item.isStack = Number.isNumeric(item.data.quantity) && (item.data.quantity !== 1);

			// Item usage
			item.hasUses = item.data.uses && (item.data.uses.max > 0);
			item.isOnCooldown = item.data.recharge && !!item.data.recharge.value && (item.data.recharge.charged === false);
			item.isDepleted = item.isOnCooldown && (item.data.uses.per && (item.data.uses.value > 0));
			item.hasTarget = !!item.data.target && !(["none",""].includes(item.data.target.type));

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
			i.data.quantity = i.data.quantity || 0;
			i.data.weight = i.data.weight || 0;
			i.totalWeight = Math.round(i.data.quantity * i.data.weight * 10) / 10;
			inventory[i.type].items.push(i);
		}

		// Organize Spellbook and count the number of prepared spells (excluding always, at will, etc...)
		// const spellbook = this._prepareSpellbook(data, spells);
		// const nPrepared = spells.filter(s => {
		  // return (s.data.level > 0) && (s.data.preparation.mode === "prepared") && s.data.preparation.prepared;
		// }).length;
		
		// Organize Features
		// const features = {
		  // classes: { label: "DND4EBETA.ItemTypeClassPl", items: [], hasActions: false, dataset: {type: "class"}, isClass: true },
		  // active: { label: "DND4EBETA.FeatureActive", items: [], hasActions: true, dataset: {type: "feat", "activation.type": "action"} },
		  // passive: { label: "DND4EBETA.FeaturePassive", items: [], hasActions: false, dataset: {type: "feat"} }
		// };

		for ( let f of feats ) {
			features[f.type].items.push(f);
		  // if ( f.data.activation.type ) features.active.items.push(f);
		  // else features.passive.items.push(f);
		}

		for ( let p of pow ) {
			powers[this._groupPowers(p,powers)].items.push(p);
		}

		// classes.sort((a, b) => b.levels - a.levels);
		// features.classes.items = classes;
		// Assign and return
		data.inventory = Object.values(inventory);
		data.powers = Object.values(powers);
		data.features = Object.values(features);

		for (const [key, group] of Object.entries(powers)) {
			group.items?.forEach(item => {
				this._preparePowerRangeText(item);
				this._checkPowerAvailable(item);
			});
		}

		this._sortPowers(powers);
	}
	_sortPowers(powers) {

		function _compareValues(key, order = 'asc') {
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
					return (order === 'desc') ? (comparison * -1) : comparison;
				} else if (a.data.hasOwnProperty(key) && b.data.hasOwnProperty(key)) {

					const varA = (typeof a.data[key] === 'string') ? a.data[key].toUpperCase() : a.data[key];
					const varB = (typeof b.data[key] === 'string') ? b.data[key].toUpperCase() : b.data[key];
		
					let comparison = 0;
					if (varA > varB) {
						comparison = 1;
					}
					else if (varA < varB) {
						comparison = -1;
					}
					return (order === 'desc') ? (comparison * -1) : comparison;
				}
				return 0;

			};
		};
		
		const sort = this.object.data.data.powerSortTypes;
		if(sort === "none") {return;}
		for (const [keyy, group] of Object.entries(powers)) {
			group.items.sort(_compareValues(sort));
		}
	}

	_groupPowers(power, powerGroups) {
		if(this.object.data.data.powerGroupTypes === "action" || this.object.data.data.powerGroupTypes == undefined) {
			if(Object.keys(powerGroups).includes(power.data.actionType) ) return power.data.actionType;
		}
		if(this.object.data.data.powerGroupTypes === "type") {
			if(Object.keys(powerGroups).includes(power.data.powerType) )return power.data.powerType;
		}
		if(this.object.data.data.powerGroupTypes === "usage") {
			if(Object.keys(powerGroups).includes(power.data.useType) ) return power.data.useType;
		}
		return "other";
	}
	_generatePowerGroups() {

		if(this.object.data.data.powerGroupTypes === "action" || this.object.data.data.powerGroupTypes == undefined) {
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
		else if(this.object.data.data.powerGroupTypes === "type") {
			return {
				class: { label: "Class Power", items: [], dataset: {type: "class"} },
				race: { label: "Racial Power", items: [], dataset: {type: "race"} },
				utility: { label: "DND4EBETA.PowerUtil", items: [], dataset: {type: "utility"} },
				other: { label: "DND4EBETA.Other", items: [], dataset: {type: "other"} },
			};
		}
		else return { //"usage"
			atwill: { label: "DND4EBETA.PowerAt", items: [], dataset: {type: "atwill"} },
			encounter: { label: "DND4EBETA.PowerEnc", items: [], dataset: {type: "encounter"} },
			daily: { label: "DND4EBETA.PowerDaily", items: [], dataset: {type: "daily"} },
			// utility: { label: "DND4EBETA.PowerUtil", items: [], dataset: {type: "utility"} },
			recharge: { label: "DND4EBETA.PowerRecharge", items: [], dataset: {type: "recharge"} },
			other: { label: "DND4EBETA.Other", items: [], dataset: {type: "other"} },
		};
	}

	_checkPowerAvailable(itemData) {
		if( (itemData.data.uses.value == 0 && itemData.data.uses.max)
			|| !itemData.data.prepared) {
				itemData.data.notAvailable = true;

		}
	}
  /* -------------------------------------------- */
	/**
   * A helper method to generate the text for the range of difrent powers
   * @param {itemData} itemData
   * @private
   */
	_preparePowerRangeText(itemData) {
		if(itemData.data.rangeType === "range") {
			itemData.data.rangeText = `Range ${itemData.data.rangePower}`
			itemData.data.rangeTextShort = `R`
			itemData.data.rangeTextBlock = `${itemData.data.rangePower}`
		} else if(itemData.data.rangeType === "closeBurst") {
			itemData.data.rangeText = `Close Burst ${itemData.data.area}`
			itemData.data.rangeTextShort = "CBU"
			itemData.data.rangeTextBlock = `${itemData.data.area}`
		} else if(itemData.data.rangeType === "rangeBurst") {
			itemData.data.rangeText = `Area Burst ${itemData.data.area} within ${itemData.data.rangePower}`
			itemData.data.rangeTextShort = "ABU"
			itemData.data.rangeTextBlock = `${itemData.data.area} - ${itemData.data.rangePower}`
		} else if(itemData.data.rangeType === "closeBlast") {
			itemData.data.rangeText = `Close Blast ${itemData.data.area}`
			itemData.data.rangeTextShort = "CBL"
			itemData.data.rangeTextBlock = `${itemData.data.area}`
		} else if(itemData.data.rangeType === "rangeBlast") {
			itemData.data.rangeText = `Area Blast ${itemData.data.area} within ${itemData.data.rangePower}`
			itemData.data.rangeTextShort = "ABL"
			itemData.data.rangeTextBlock = `${itemData.data.area} - ${itemData.data.rangePower}`
		} else if(itemData.data.rangeType === "wall") {
			itemData.data.rangeText = `Wall ${itemData.data.area} within ${itemData.data.rangePower}`
			itemData.data.rangeTextShort = "W"
			itemData.data.rangeTextBlock = `${itemData.data.area} - ${itemData.data.rangePower}`
		} else if(itemData.data.rangeType === "personal") {
			itemData.data.rangeText = "Personal"
			itemData.data.rangeTextShort = "P"
		} else if(itemData.data.rangeType === "touch") {
			itemData.data.rangeText = "Melee Touch"
			itemData.data.rangeTextShort = "M-T"
		} else if(itemData.data.rangeType === "weapon") {

			try {
				const weaponUse = Helper.getWeaponUse(itemData.data, this.actor);
				if(weaponUse.data.data.isRanged) {
					itemData.data.rangeText = `Range Weapon - ${weaponUse.data.name}`
					itemData.data.rangeTextShort = `W-R`
					itemData.data.rangeTextBlock = `${weaponUse.data.data.range.value}/${weaponUse.data.data.range.long}`
				} else {
					itemData.data.rangeText = `Melee Weapon - ${weaponUse.data.name}`;
					itemData.data.rangeTextShort = "W-M";
				}

			} catch {
				itemData.data.rangeText = "Weapon";
				itemData.data.rangeTextShort = "W-M";
			}

		} else {
			itemData.data.rangeText = "Not Avalible"
			itemData.data.rangeTextShort = "NA"
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
	  const isPrepared =  getProperty(item.data, "prepared");
	  item.toggleClass = isPrepared ? "active" : "";
	  // if ( isAlways ) item.toggleClass = "fixed";
	  // if ( isAlways ) item.toggleTitle = CONFIG.DND4EBETA.spellPreparationModes.always;
	  // else if ( isPrepared ) item.toggleTitle = CONFIG.DND4EBETA.spellPreparationModes.prepared;
	  if ( isPrepared ) item.toggleTitle = game.i18n.localize("DND4EBETA.PowerPrepared");
	  else item.toggleTitle = game.i18n.localize("DND4EBETA.PowerUnPrepared");
	}
	else {
	  const isActive = getProperty(item.data, "equipped");
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
			trait.cssClass = !isObjectEmpty(trait.selected) ? "" : "inactive";
			
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
			trait.cssClass = !isObjectEmpty(trait.selected) ? "" : "inactive";
			
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
	  const data = item.data;

	  // Action usage
	  for ( let f of ["action", "bonus", "reaction"] ) {
		if ( filters.has(f) ) {
		  if ((data.activation && (data.activation.type !== f))) return false;
		}
	  }

	  // Spell-specific filters
	  // if ( filters.has("ritual") ) {
		// if (data.components.ritual !== true) return false;
	  // }
	  // if ( filters.has("concentration") ) {
		// if (data.components.concentration !== true) return false;
	  // }
	  // if ( filters.has("prepared") ) {
		// if ( data.level === 0 || ["innate", "always"].includes(data.preparation.mode) ) return true;
		// if ( this.actor.data.type === "npc" ) return true;
		// return data.preparation.prepared;
	  // }

	  // Equipment-specific filters
	  if ( filters.has("equipped") ) {
		if ( data.equipped !== true ) return false;
	  }
	  return true;
	});
  }	
	
	/** @override */
	async update(data, options={}) {
		
		// Apply changes in Actor size to Token width/height
		const newSize = data["data.traits.size"];
		if ( newSize && (newSize !== getProperty(this.data, "data.traits.size")) ) {
			let size = CONFIG.DND4EBETA.tokenSizes[newSize];
			if ( this.isToken ) this.token.update({height: size, width: size});
			else if ( !data["token.width"] && !hasProperty(data, "token.width") ) {
				data["token.height"] = size;
				data["token.width"] = size;
			}
		}
		return super.update(data, options);
	}
	_getTrainingIcon(level) {
		const icons = {
			0: '<i class="far fa-circle"></i>',
			5: '<i class="fas fa-check"></i>',
			8: '<i class="fas fa-check-double"></i>'
			};
		return icons[level];
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

  /** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		const inputs = html.find("input");
		inputs.focus(ev => ev.currentTarget.select());
		inputs.addBack().find('[data-dtype="Number"]').change(this._onChangeInputDelta.bind(this));

		html.find('.skill-training').on("click contextmenu", this._onCycleSkillProficiency.bind(this));

		// Update Inventory Item
		html.find('.item-edit').click(ev => {
		const li = $(ev.currentTarget).parents(".item");
		const item = this.actor.getOwnedItem(li.data("itemId"));
		item.sheet.render(true);
		});

		// Delete Inventory Item
		html.find('.item-delete').click(ev => {
		const li = $(ev.currentTarget).parents(".item");
		this.actor.deleteOwnedItem(li.data("itemId"));
		li.slideUp(200, () => this.render(false));
		});

		if ( this.actor.owner ) {	
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
			html.find('.resistances-bonus').click(this._onResistancesBonus.bind(this));
			
			html.find('.movement-dialog').click(this._onMovementDialog.bind(this));		
			
			html.find('.custom-roll-descriptions').click(this._onCustomRolldDescriptions.bind(this));
			
			//second wind
			html.find('.second-wind').click(this._onSecondWind.bind(this));

			//action point
			html.find('.action-point').click(this._onActionPointDialog.bind(this));
			
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
			html.find('.trait-selector').click(this._onTraitSelectorLang.bind(this));
			html.find('.trait-selector-senses').click(this._onTraitSelectorSense.bind(this));
			
			//save throw bonus
			html.find(`.trait-selector-save`).click(this._onTraitSelectorSaveThrow.bind(this));
			
			//Inventory & Item management
			html.find('.item-create').click(this._onItemCreate.bind(this));
			html.find('.item-edit').click(this._onItemEdit.bind(this));
			html.find('.item-delete').click(this._onItemDelete.bind(this));
			html.find('.item-uses input').click(ev => ev.target.select()).change(this._onUsesChange.bind(this));

			html.find('.power-create').click(this._onPowerItemCreate.bind(this));

			// Active Effect management
			html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.entity));
		
			// Item summaries
			html.find('.item .item-name h4').click(event => this._onItemSummary(event));		
			
			// Item State Toggling
			html.find('.item-toggle').click(this._onToggleItem.bind(this));
		
			//convert currency to it's largest form to save weight.
			html.find(".currency-convert").click(this._onConvertCurrency.bind(this));
			
			// Item Rolling
			html.find('.item .item-image').click(event => this._onItemRoll(event));
			// html.find('.item .item-recharge').click(event => this._onItemRecharge(event));
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
		if ( ["+", "-"].includes(value[0]) ) {
			let delta = parseFloat(value);
			input.value = getProperty(this.actor.data, input.name) + delta;
		} else if ( value[0] === "=" ) {
			input.value = value.slice(1);
		}
	}

  /* -------------------------------------------- */

  /**
   * Handle rolling of an item from the Actor sheet, obtaining the Item instance and dispatching to it's roll method
   * @private
   */
  _onItemSummary(event) {
	event.preventDefault();
	let li = $(event.currentTarget).parents(".item"),
		item = this.actor.getOwnedItem(li.data("item-id")),
		chatData = item.getChatData({secrets: this.actor.owner});

	
	// Toggle summary
	if ( li.hasClass("expanded") ) {
	  let summary = li.children(".item-summary");
	  summary.slideUp(200, () => summary.remove());
	} else {
	  let div = $(`<div class="item-summary">${chatData.description.value}</div>`);
	  let props = $(`<div class="item-properties"></div>`);
	  chatData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
	  div.append(props);
	  li.append(div.hide());
	  div.slideDown(200);
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
	const item = this.actor.getOwnedItem(itemId);
	const power = ["power","atwill","encounter","daily","utility"];
	const attr = power.includes(item.data.type) ? "data.prepared" : "data.equipped";
	return item.update({[attr]: !getProperty(item.data, attr)});
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
		return this.actor.createOwnedItem(itemData);
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

		if(this.object.data.data.powerGroupTypes === "action" || this.object.data.data.powerGroupTypes == undefined) {
			itemData.data.actionType = type;
		}
		else if(this.object.data.data.powerGroupTypes === "type") {
			itemData.data.powerType = type;
		}
		else if(this.object.data.data.powerGroupTypes === "usage") {
			itemData.data.useType = type;
		}

		delete itemData.data["type"];
		return this.actor.createOwnedItem(itemData);
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
	const item = this.actor.getOwnedItem(li.dataset.itemId);
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
	this.actor.deleteOwnedItem(li.dataset.itemId);
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
		const item = this.actor.getOwnedItem(itemId);
		const uses = Math.clamped(0, parseInt(event.target.value), item.data.data.uses.max);
		event.target.value = uses;
		return item.update({ 'data.uses.value': uses });
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
		const target = `data.skills.${skillName}`;
		const options = {target: target, label: `${this.actor.data.data.skills[skillName].label} Skill Bonues`, skill: true };
		new AttributeBonusDialog(this.actor, options).render(true);
	}
	/* -------------------------------------------- */

	_onDeathSaveBonus(event) {
		event.preventDefault();
		const options = {target: `data.details.deathsavebon`, label: "Death Savingthrow Bonues" };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	
	_onSurgeBonus(event) {
		event.preventDefault();
		const options = {target: `data.details.surgeBon`, label: "Healing Surge Bonues" };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onSurgeEnv(event) {
		event.preventDefault();
		const options = {target: `data.details.surgeEnv`, label: "Healing Surges Environmental Losses" };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}

	_onSecondWindBonus(event) {
		event.preventDefault();
		const options = {target: `data.details.secondwindbon`, label: "Second Wind Bonues", secondWind: true };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onDefencesBonus(event) {
		event.preventDefault();
		const defName = event.currentTarget.parentElement.dataset.defence;
		const target = `data.defences.${defName}`;
		const options = {target: target, label: `${this.actor.data.data.defences[defName].label} Defence Bonues`, ac: (defName ==="ac")  };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onInitiativeBonus(event) {
		event.preventDefault();
		const options = {target: `data.attributes.init`, label: "Initiative Bonues", init: true };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onMovementBonus(event) {
		event.preventDefault();
		const moveName = event.currentTarget.parentElement.dataset.movement;
		const target = `data.movement.${moveName}`;
		const options = {target: target, label: `${this.actor.data.data.movement[moveName].label} Movement Bonues` };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}
	
	_onMovementDialog(event) {
		event.preventDefault();
		new MovementDialog(this.actor).render(true)
	}
	
	_onPassiveBonus(event) {
		event.preventDefault();
		const passName = event.currentTarget.parentElement.dataset.passive;
		const skillName = this.actor.data.data.passive[passName].skill;
		const target = `data.passive.${passName}`;
		const options = {target: target, label: `Passive ${this.actor.data.data.skills[skillName].label} Bonues` };
		new AttributeBonusDialog(this.actor, options).render(true);		
	}	

	_onResistancesBonus(event) {
		event.preventDefault();
		const resName = event.currentTarget.parentElement.dataset.res;
		const target = `data.resistances.${resName}`;
		const options = {target: target, label: `${this.actor.data.data.resistances[resName].label} Damage Resistances Bonues` };
		new AttributeBonusDialog(this.actor, options).render(true);
	}
	
	_onCustomRolldDescriptions(event) {
		event.preventDefault();
		const options = {data: this.actor.data};
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
		console.log("action point")
		event.preventDefault();
		new ActionPointDialog(this.actor).render(true);
	}

	/**
	*Opens dialog window to short rest.
	*Spend n number of healin surges,
	*reset encounter powers, action point ussage, second wind ussage.
	*/
	_onShortRest(event) {
		event.preventDefault();
		new ShortRestDialog(this.actor).render(true)
	}
	
	/* -------------------------------------------- */
  
	/**
	*Opens dialog window to long rest.
	*reset HP, surges, encounter powers, daily powers, magic item use, actions points set to default.
	*/
	_onLongRest(event) {
		event.preventDefault();
		new LongRestDialog(this.actor).render(true)
	}

	_onDeathSave(event) {
		event.preventDefault();
		new DeathSaveDialog(this.actor).render(true);
	}

	_onrollInitiative(event) {
		event.preventDefault();
		return this.actor.rollInitiative({createCombatants: true});
	}

	_onSavingThrow(event) {
		event.preventDefault();
		new SaveThrowDialog(this.actor).render(true);
	}

	_onSavingThrowBonus(event) {
		event.preventDefault();
		const options = {target: `data.details.saves`, label: "Savingthrow Bonues" };
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
	const item = this.actor.getOwnedItem(itemId);
	// Roll powers through the actor
	const power = ["atwill","encounter","daily","utility"];
	if ( power.includes(item.data.type)) {
		return this.actor.usePower(item, {configureDialog: !event.shiftKey});
	}
	// Otherwise roll the Item directly
	return item.roll();
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
	const curr = duplicate(this.actor.data.data.currency);
	const convert = CONFIG.DND4EBETA.currencyConversion;
	for ( let [c, t] of Object.entries(convert) ) {
	  let change = Math.floor(curr[c] / t.each);
	  curr[c] -= (change * t.each);
	  curr[t.into] += change;
	}
	return this.object.update({"data.currency": curr});
  }
  
  /* -------------------------------------------- */

  /**
   * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
   * @param {Event} event   The click event which originated the selection
   * @private
   */
	_onTraitSelectorLang(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("h4");
		const choices = CONFIG.DND4EBETA[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices };
		new TraitSelector(this.actor, options).render(true);
	}

	_onTraitSelectorSense(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.parentElement.querySelector("h4");
		const choices = CONFIG.DND4EBETA[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices };
		new TraitSelectorSense(this.actor, options).render(true);
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
		const skillName = this.actor.data.data.passive[passName].skill;

		ChatMessage.create({
			user: game.user._id,
			speaker: {actor: this.object, alias: this.object.data.name},
			content: `Passive ${this.actor.data.data.skills[skillName].label} Skill Check: <SPAN STYLE="font-weight:bold">${this.object.data.data.passive[passName].value}`
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
