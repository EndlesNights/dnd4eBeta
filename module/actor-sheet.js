import { DND4EALTUS } from "./config.js";
import { SecondWindDialog } from "./apps/second-wind.js";
import { ShortRestDialog } from "./apps/short-rest.js";
import { LongRestDialog } from "./apps/long-rest.js";
import { DeathSaveDialog } from "./apps/death-save.js";
import TraitSelector from "./apps/trait-selector.js";
import TraitSelectorSense from "./apps/trait-selector-sense.js";

import HPOptions from "./apps/hp-options.js";
import Item4e from "./item/entity.js";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

  constructor(...args) {
    super(...args);

    /**
     * Track the set of item filters which are applied
     * @type {Set}
     */
    this._filters = {
      inventory: new Set(),
      spellbook: new Set(),
      features: new Set()
    };
  }
  
  /** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["dnd4eAltus", "sheet", "actor"],
			template: "systems/dnd4eAltus/templates/actor-sheet.html",
			width: 700,
			height: 690,
			tabs: [{
				navSelector: ".sheet-tabs",
				contentSelector: ".sheet-body",
				initial: "attributes"
			}],
			dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}],
			scrollY: [".desk__content"]
		});
  }

  /* -------------------------------------------- */

	/** @override */
	getData() {

		let data = super.getData();
		data.config = CONFIG.DND4EALTUS;
		// const data = {
			// owner: isOwner,
			// limited: this.entity.limited,
			// options: this.options,
			// editable: this.isEditable,
			// cssClass: isOwner ? "editable" : "locked",
			// isCharacter: this.entity.data.type === "character",
			// isNPC: this.entity.data.type === "npc",
			// config: CONFIG.DND4EALTUS,
		// };		
		// data.dtypes = ["String", "Number", "Boolean"];
		// for ( let attr of Object.values(data.data.attributes) ) {
			// attr.isCheckbox = attr.dtype === "Boolean";
		// }
		data.actor.data.size = DND4EALTUS.actorSizes;
		
		for ( let [s, skl] of Object.entries(data.actor.data.skills)) {
			skl.ability = data.actor.data.abilities[skl.ability].label.substring(0, 3);
			skl.icon = this._getTrainingIcon(skl.value);
			skl.hover = game.i18n.localize(DND4EALTUS.trainingLevels[skl.value]);
			skl.label = game.i18n.localize(DND4EALTUS.skills[s]);
		}
		
		this._prepareData(data.actor.data.languages, 
		{"spoken": CONFIG.DND4EALTUS.spoken, "script": CONFIG.DND4EALTUS.script}
		);
		
		this._prepareDataSense(data.actor.data.senses, 
			{"vision": CONFIG.DND4EALTUS.vision, "special": CONFIG.DND4EALTUS.special}
		);			
		
		this._prepareItems(data);
		return data;
	}
	
	_prepareData(data, map) {
		// const map = {
			// "spoken": CONFIG.DND4EALTUS.spoken,
			// "script": CONFIG.DND4EALTUS.script,
			// "vision": CONFIG.DND4EALTUS.vision,
			// "special": CONFIG.DND4EALTUS.special
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
		const inventory = {
			weapon: { label: "DND4EALTUS.ItemTypeWeaponPl", items: [], dataset: {type: "weapon"} },
			equipment: { label: "DND4EALTUS.ItemTypeEquipmentPl", items: [], dataset: {type: "equipment"} },
			consumable: { label: "DND4EALTUS.ItemTypeConsumablePl", items: [], dataset: {type: "consumable"} },
			tool: { label: "DND4EALTUS.ItemTypeToolPl", items: [], dataset: {type: "tool"} },
			backpack: { label: "DND4EALTUS.ItemTypeContainerPl", items: [], dataset: {type: "backpack"} },
			loot: { label: "DND4EALTUS.ItemTypeLootPl", items: [], dataset: {type: "loot"} }
		};
		
    // Partition items by category
    let [items, spells, feats, classes] = data.items.reduce((arr, item) => {

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
      if ( item.type === "spell" ) arr[1].push(item);
      else if ( item.type === "feat" ) arr[2].push(item);
      else if ( item.type === "class" ) arr[3].push(item);
      else if ( Object.keys(inventory).includes(item.type ) ) arr[0].push(item);
      return arr;
    }, [[], [], [], []]);

    // Apply active item filters
    items = this._filterItems(items, this._filters.inventory);
    spells = this._filterItems(spells, this._filters.spellbook);
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
    const nPrepared = spells.filter(s => {
      return (s.data.level > 0) && (s.data.preparation.mode === "prepared") && s.data.preparation.prepared;
    }).length;

    // Organize Features
    const features = {
      classes: { label: "DND4EALTUS.ItemTypeClassPl", items: [], hasActions: false, dataset: {type: "class"}, isClass: true },
      active: { label: "DND4EALTUS.FeatureActive", items: [], hasActions: true, dataset: {type: "feat", "activation.type": "action"} },
      passive: { label: "DND4EALTUS.FeaturePassive", items: [], hasActions: false, dataset: {type: "feat"} }
    };
    for ( let f of feats ) {
      if ( f.data.activation.type ) features.active.items.push(f);
      else features.passive.items.push(f);
    }
    classes.sort((a, b) => b.levels - a.levels);
    features.classes.items = classes;

    // Assign and return
		data.inventory = Object.values(inventory);
	}
	
  /* -------------------------------------------- */

  /**
   * A helper method to establish the displayed preparation state for an item
   * @param {Item} item
   * @private
   */
  _prepareItemToggleState(item) {
    if (item.type === "spell") {
      const isAlways = getProperty(item.data, "preparation.mode") === "always";
      const isPrepared =  getProperty(item.data, "preparation.prepared");
      item.toggleClass = isPrepared ? "active" : "";
      if ( isAlways ) item.toggleClass = "fixed";
      if ( isAlways ) item.toggleTitle = CONFIG.DND4EALTUS.spellPreparationModes.always;
      else if ( isPrepared ) item.toggleTitle = CONFIG.DND4EALTUS.spellPreparationModes.prepared;
      else item.toggleTitle = game.i18n.localize("DND4EALTUS.SpellUnprepared");
    }
    else {
      const isActive = getProperty(item.data, "equipped");
      item.toggleClass = isActive ? "active" : "";
      item.toggleTitle = game.i18n.localize(isActive ? "DND4EALTUS.Equipped" : "DND4EALTUS.Unequipped");
    }
  }
	_prepareDataSense(data, map) {
		// const map = {
			// "spoken": CONFIG.DND4EALTUS.spoken,
			// "script": CONFIG.DND4EALTUS.script,
			// "vision": CONFIG.DND4EALTUS.vision,
			// "special": CONFIG.DND4EALTUS.special
		// }
		
		for ( let [l, choices] of Object.entries(map) ) {
			const trait = data[l];
			if ( !trait ) continue;
			let values = [];
			if ( trait.value ) {
				values = trait.value instanceof Array ? trait.value : [trait.value];
			}
			trait.selected = values.reduce((obj, l) => {
				// obj[l] = l[1] != "" ? choices[l[0]] + " " + l[1] + " sq" : choices[l[0]];
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
      if ( filters.has("ritual") ) {
        if (data.components.ritual !== true) return false;
      }
      if ( filters.has("concentration") ) {
        if (data.components.concentration !== true) return false;
      }
      if ( filters.has("prepared") ) {
        if ( data.level === 0 || ["innate", "always"].includes(data.preparation.mode) ) return true;
        if ( this.actor.data.type === "npc" ) return true;
        return data.preparation.prepared;
      }

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
			let size = CONFIG.DND4EALTUS.tokenSizes[newSize];
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

    // Add or Remove Attribute
    html.find(".attributes").on("click", ".attribute-control", this._onClickAttributeControl.bind(this));


    if ( this.actor.owner ) {	
		// Roll Skill Checks
		html.find('.skill-name').click(this._onRollSkillCheck.bind(this));
		
		//roll Abillity Checks
		html.find('.ability-name').click(this._onRollAbilityCheck.bind(this));
		
		//Open HP-Options
		html.find('.health-option').click(this._onHPOptions.bind(this));
		
		//second wind
		html.find('.second-wind').click(this._onSecondWind.bind(this));
		
		//short rest
		html.find('.short-rest').click(this._onShortRest.bind(this));
		
		//long rest
		html.find('.long-rest').click(this._onLongRest.bind(this));		
		
		//death save
		html.find('.death-save').click(this._onDeathSave.bind(this));
		
		// Trait Selector
		html.find('.trait-selector').click(this._onTraitSelector.bind(this));
		
		html.find('.trait-selector-senses').click(this._onTraitSelectorSense.bind(this));
		
		//Inventory & Item management
		html.find('.item-create').click(this._onItemCreate.bind(this));
		html.find('.item-edit').click(this._onItemEdit.bind(this));
		html.find('.item-delete').click(this._onItemDelete.bind(this));
		html.find('.item-uses input').click(ev => ev.target.select()).change(this._onUsesChange.bind(this));
		
		// Item summaries
		html.find('.item .item-name h4').click(event => this._onItemSummary(event));		
		
		// Item State Toggling
		html.find('.item-toggle').click(this._onToggleItem.bind(this));
	
		//convert currency to it's largest form to save weight.
		html.find(".currency-convert").click(this._onConvertCurrency.bind(this));
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
    const attr = item.data.type === "spell" ? "data.preparation.prepared" : "data.equipped";
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
			name: game.i18n.format("DND4EALTUS.ItemNew", {type: type.capitalize()}),
			type: type,
			data: duplicate(header.dataset)
		};
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
	*Opens HP options config window, turns on/off auto calculation of HP based on class stats
	*/
	_onHPOptions(event) {
		event.preventDefault();

		new HPOptions(this.actor).render(true)
	}

	/* -------------------------------------------- */
  
	/**
	* Opens dialog window to spend Second Wind
	*/
	_onSecondWind(event) {
		event.preventDefault();
		new SecondWindDialog(this.actor).render(true);		

	}
	
	/* -------------------------------------------- */
  
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
		new DeathSaveDialog(this.actor).render(true)
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
   * Handle mouse click events to convert currency to the highest possible denomination
   * @param {MouseEvent} event    The originating click event
   * @private
   */
  async _onConvertCurrency(event) {
    event.preventDefault();
    return Dialog.confirm({
      title: `${game.i18n.localize("DND4EALTUS.CurrencyConvert")}`,
      content: `<p>${game.i18n.localize("DND4EALTUS.CurrencyConvertHint")}</p>`,
      yes: () => this.convertCurrency()
    });
  }

  /* -------------------------------------------- */

  /**
   * Convert all carried currency to the highest possible denomination to reduce the number of raw coins being
   * carried by an Actor.
   * @return {Promise<Actor5e>}
   */
  convertCurrency() {
    const curr = duplicate(this.actor.data.data.currency);
    const convert = CONFIG.DND4EALTUS.currencyConversion;
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
	_onTraitSelector(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("h4");
		const choices = CONFIG.DND4EALTUS[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices };
		new TraitSelector(this.actor, options).render(true)
	}

	_onTraitSelectorSense(event) {
		event.preventDefault();
		const a = event.currentTarget;
		const label = a.parentElement.querySelector("h4");
		const choices = CONFIG.DND4EALTUS[a.dataset.options];
		const options = { name: a.dataset.target, title: label.innerText, choices };
		new TraitSelectorSense(this.actor, options).render(true)
	}

  /* -------------------------------------------- */

  /** @override */
  setPosition(options={}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /**
   * Listen for click events on an attribute control to modify the composition of attributes in the sheet
   * @param {MouseEvent} event    The originating left click event
   * @private
   */
  async _onClickAttributeControl(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const action = a.dataset.action;
    const attrs = this.object.data.data.attributes;
    const form = this.form;

    // Add new attribute
    if ( action === "create" ) {
      const nk = Object.keys(attrs).length + 1;
      let newKey = document.createElement("div");
      newKey.innerHTML = `<input type="text" name="data.attributes.attr${nk}.key" value="attr${nk}"/>`;
      newKey = newKey.children[0];
      form.appendChild(newKey);
      await this._onSubmit(event);
    }

    // Remove existing attribute
    else if ( action === "delete" ) {
      const li = a.closest(".attribute");
      li.parentElement.removeChild(li);
      await this._onSubmit(event);
    }
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

  /** @override */
  _updateObject(event, formData) {

    // Handle the free-form attributes list
    const formAttrs = expandObject(formData).data.attributes || {};
    const attributes = Object.values(formAttrs).reduce((obj, v) => {
      let k = v["key"].trim();
      if ( /[\s\.]/.test(k) )  return ui.notifications.error("Attribute keys may not contain spaces or periods");
      delete v["key"];
      obj[k] = v;
      return obj;
    }, {});
    
    // Remove attributes which are no longer used
    for ( let k of Object.keys(this.object.data.data.attributes) ) {
      if ( !attributes.hasOwnProperty(k) ) attributes[`-=${k}`] = null;
    }

    // Re-combine formData
    formData = Object.entries(formData).filter(e => !e[0].startsWith("data.attributes")).reduce((obj, e) => {
      obj[e[0]] = e[1];
      return obj;
    }, {_id: this.object._id, "data.attributes": attributes});
    
    // Update the Actor
    return this.object.update(formData);
  }
}
