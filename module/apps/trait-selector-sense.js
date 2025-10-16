/**
 * A specialized form used to select from a checklist of attributes, traits, or properties that each have an associated value
 */
export default class TraitSelectorValues extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.DocumentSheet) {

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
    choices: {}
  };

  static PARTS = {
    main: { template: "systems/dnd4e/templates/apps/trait-selector-values.hbs" },
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
		// const name = this.options.name.substring(this.options.name.lastIndexOf(".") + 1);
		// return `${this.object.name} - ${super.title} - ${name}`;
		return `${this.document.name} - ${this.options.window.title}`;
	}
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
	
    // Get current values
    const attr = foundry.utils.getProperty(this.document, this.attribute) || {};
    attr.value = Array.from(attr.value ?? []);
	
	  // Populate choices
    let choices = duplicate(this.options.choices);
		
    for ( let [k, v] of Object.entries(choices) ) {
      let i = -1;
      
      for(let index = 0; index < attr.value.length; index++)
      {
        if(attr.value[index][0].includes(k)) i = index;
      }
		
      choices[k] = {
        label: v,
        chosen: attr && i != -1 ? true : false,
        value: attr && i != -1 ? attr.value[i][1] : null 
      };
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
      if ( (k !== "custom") && v[0] ) chosen.push([k,v[1]]);
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

    return foundry.utils.expandObject(updateData);
  }
}
