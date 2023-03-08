/**
 * A specialized form used to input traits as a string
 * @extends {FormApplication}
 */
export default class ListStringInput extends FormApplication {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
		id: "trait-selector",
		classes: ["dnd4eBeta"],
		title: "Actor Trait Input",
		template: "systems/dnd4e/templates/apps/list-string-input.html",
		width: 320,
		height: "auto",
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
		return `${this.object.name} - ${super.title}`;
	}
  /* -------------------------------------------- */

  /** @override */
  getData() {
	
    // Get current values and make them into a single string
	let attr = getProperty(this.object, this.attribute) || {};
	
	let traits = attr.join(";");
    // Return data
	  return {
      traits: traits
    }
  }

  /* -------------------------------------------- */

  /** @override */
  _updateObject(event, formData) {	  
    const updateData = {};
	 
	// Turn the string into a list and clean up empty entries
	formData.traits = formData.traits.trim();
	formData.traits = formData.traits.replace('; ',';');
	let traits = formData.traits.split(';');
	traits = traits.filter(function(e){return e}); 
	
    updateData[`${this.attribute}`] = traits;

    // Update the object
    this.object.update(updateData);
  }
}
