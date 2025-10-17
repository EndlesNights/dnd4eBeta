/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 */
export default class TraitSelector extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheet) {

  static DEFAULT_OPTIONS = {
    id: "trait-selector",
    classes: ["dnd4e", "standard-form"],
    window: {
      title: "Actor Trait Selection"
    },
    position: {
      width: 320,
      height: "auto"
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: true
    },
    allowCustom: true,
    minimum: 0,
    maximum: null,
    choices: {},
    actions: {
      toggle: TraitSelector.#onToggle
    }
  };

  static PARTS = {
    main: { template: "systems/dnd4e/templates/apps/trait-selector.hbs" },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  /* -------------------------------------------- */

  /**
   * Return a reference to the target attribute
   * @type {String}
   */
  get attribute() {
	  return this.options.name;
  }

	get title() {
		return `${this.document.name} - ${this.options.window.title}`;
	}
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    // Get current values
    const attr = foundry.utils.getProperty(this.document, this.attribute) || {};

	  // Populate choices
    const choices = duplicate(this.options.choices);

    if(this.options.datasetOptions == "weaponProf"){
      for ( let [k, v] of Object.entries(choices) ) {
        const children = Object.keys(CONFIG.DND4E[k]).length ? foundry.utils.duplicate(CONFIG.DND4E[k]) : null;
        if(children){
          for ( let [kc, vc] of Object.entries(children) ) {
            children[kc] = {
              label: vc,
              chosen: attr ? attr.value.has(kc) : false
            };
          }
        }

        choices[k] = {
          label: game.i18n.localize(`DND4E.Weapon${v}`),
          chosen: attr ? attr.value.has(k) : false,
          children: children
        };
      }
    } else {
      for ( let [k, v] of Object.entries(choices) ) {
        choices[k] = {
          label: v,
          chosen: attr ? attr.value.has(k) : false
        }
      }
    }


    context.allowCustom = this.options.allowCustom;
    context.choices = choices;
    context.custom = attr ? attr.custom : "";
    context.buttons = [{type: "submit", icon: "far fa-save", label: "DND4E.Save"}];
    
    // Return data
	  return context;
  }

  /* -------------------------------------------- */

  /** @override */
  _processFormData(event, form, formData) {
    const updateData = {};

    formData = foundry.utils.expandObject(formData.object);

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
    return foundry.utils.expandObject(updateData);
  }

  /* -------------------------------------------- */

  static #onToggle(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const li = target.closest("li.collapsible");
    li?.classList.toggle("collapsed");
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    for ( const checkbox of this.element.querySelectorAll("input[type='checkbox']") ) {
      if ( checkbox.checked ) this._onToggleCategory(checkbox);
    }
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _onChangeForm(formConfig, event) {
    super._onChangeForm(formConfig, event);
    if ( event.target.type === "checkbox" ) this._onToggleCategory(event.target);
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
