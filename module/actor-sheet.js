import { DND4EALTUS } from "./config.js";
import { SecondWindDialog } from "./apps/second-wind.js";
import { ShortRestDialog } from "./apps/short-rest.js";
import { LongRestDialog } from "./apps/long-rest.js";
import { DeathSaveDialog } from "./apps/death-save.js";
import TraitSelector from "./apps/trait-selector.js";
import TraitSelectorSense from "./apps/trait-selector-sense.js";

import HPOptions from "./apps/hp-options.js";



/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class SimpleActorSheet extends ActorSheet {

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
		
		this._prepareData(data.actor.data.senses, 
		{"vision": CONFIG.DND4EALTUS.vision, "special": CONFIG.DND4EALTUS.special}
		);			
			
		return data;
	}
	
	_prepareData(data, map) {
		console.log(data);
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
	}
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
    
	console.log(formData);
    // Update the Actor
    return this.object.update(formData);
  }
}
