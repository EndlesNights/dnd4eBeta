import DocumentSheet4e from "./DocumentSheet4e.js"

export class CustomRolldDescriptions extends DocumentSheet4e {
	
	static DEFAULT_OPTIONS = {
		id: "custom-roll",
		classes: ["dnd4e", "actor-rest", "standard-form"],
		form: {
			closeOnSubmit: false,
			submitOnClose: true
		},
		position: {
			width: 500,
			height: "auto"
		},
		tag: "form"
	}

	static PARTS = {
		CustomRolldDescriptions: {
			template: "systems/dnd4e/templates/apps/custom-roll-descriptions.hbs"
		}
	}

	get title() {
		return `${this.document.name} - Customize Roll Descriptions Options`;
	}
	
	/** @override */
	_prepareContext() {
		return {system: this.document.system};
	}
	
	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.document.update(updateData);
	}
	
}