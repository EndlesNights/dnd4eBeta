/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {FormApplication}
 */
export default class TraitSelector extends FormApplication {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
	    id: "trait-selector",
      classes: ["dnd4eBeta"],
      title: "Actor Trait Selection",
      template: "systems/dnd4e/templates/apps/trait-selector.html",
      width: 320,
      height: "auto",
      choices: {},
      allowCustom: true,
      minimum: 0,
      maximum: null
    });
  }

  /* -------------------------------------------- */

  /**
   * Return a reference to the target attribute
   * @type {String}
   */
  get attribute() {
	  return this.options.name;
  }

	get title() {
		const name = this.options.name.substring(this.options.name.lastIndexOf(".") + 1);
		return `${this.object.name} - ${super.title} - ${name}`;
	}
  /* -------------------------------------------- */

  /** @override */
  getData() {

    // Get current values
    let attr = getProperty(this.object, this.attribute) || {};
    attr.value = attr.value || [];

	  // Populate choices
    const choices = duplicate(this.options.choices);

    if(this.options.datasetOptions == "weaponProf"){
      for ( let [k, v] of Object.entries(choices) ) {
        const children = CONFIG.DND4EBETA[k] ? duplicate(CONFIG.DND4EBETA[k]) : {};
        for ( let [kc, vc] of Object.entries(children) ) {
          children[kc] = {
            label: vc,
            chosen: attr ? attr.value.includes(kc) : false
          }
        }

        choices[k] = {
          label: game.i18n.localize(`DND4EBETA.Weapon${v}`),
          chosen: attr ? attr.value.includes(k) : false,
          children: children
        }
      }
    } else {
      for ( let [k, v] of Object.entries(choices) ) {
        choices[k] = {
          label: v,
          chosen: attr ? attr.value.includes(k) : false
        }
      }
    }


    // Return data
	  return {
      allowCustom: this.options.allowCustom,
	    choices: choices,
      custom: attr ? attr.custom : ""
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {
    const updateData = {};
    // Obtain choices
    const chosen = [];
    for ( let [k, v] of Object.entries(formData) ) {
      if ( (k !== "custom") && v ) chosen.push(k);
    }
    updateData[`${this.attribute}.value`] = chosen;

    // Validate the number chosen
    if ( this.options.minimum && (chosen.length < this.options.minimum) ) {
      return ui.notifications.error(`You must choose at least ${this.options.minimum} options`);
    }
    if ( this.options.maximum && (chosen.length > this.options.maximum) ) {
      return ui.notifications.error(`You may choose no more than ${this.options.maximum} options`);
    }

    // Include custom
    if ( this.options.allowCustom ) {
      updateData[`${this.attribute}.custom`] = formData.custom;
    }

    // Update the object
    this.object.update(updateData);
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    for ( const checkbox of html[0].querySelectorAll("input[type='checkbox']") ) {
      if ( checkbox.checked ) this._onToggleCategory(checkbox);
    }
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onChangeInput(event) {
    super._onChangeInput(event);

    if ( event.target.tagName === "INPUT" ) this._onToggleCategory(event.target);
  }

  /* -------------------------------------------- */

  /**
   * Enable/disable all children when a category is checked.
   *
   * @param {HTMLElement} checkbox  Checkbox that was changed.
   * @private
   */
   _onToggleCategory(checkbox) {
    const children = checkbox.closest("li")?.querySelector("ol");
    if ( !children ) return;

    for ( const child of children.querySelectorAll("input[type='checkbox']") ) {
      child.checked = child.disabled = checkbox.checked;
    }
  }

}
