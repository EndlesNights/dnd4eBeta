import DocumentSheet4e from "./DocumentSheet4e.js"

export default class HPOptions extends DocumentSheet4e {

  /** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
		id: "hp-options",
		classes: ["dnd4e"],
		title: "Hit Points Options",
		template: "systems/dnd4e/templates/apps/hp-options.html",
		width: 340,
		height: "auto",
		closeOnSubmit: false,
		submitOnClose: false
    });
	}
	
	/** @override */
	getData() {
		return {system: this.object.system}
	}
	
	/* -------------------------------------------- */

	/** @override */
	_updateObject(event, formData) {
		const updateData = {};
		
		for(let i = 0; i < Object.entries(formData).length; i++) {
			updateData[Object.entries(formData)[i][0]] = Object.entries(formData)[i][1];
		}

		this.object.update(updateData);
	}
}
