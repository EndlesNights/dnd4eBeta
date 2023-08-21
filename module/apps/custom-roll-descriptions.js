import DocumentSheet4e from "./DocumentSheet4e.js"

export class CustomRolldDescriptions extends DocumentSheet4e {
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "custom-roll",
			classes: ["dnd4eBeta", "actor-rest"],
			template: "systems/dnd4e/templates/apps/custom-roll-descriptions.html",
			width: 500,
			closeOnSubmit: false,
			submitOnClose: true
		});
	}
	
	get title() {
		return `${this.object.name} - Customize Roll Descriptions Options`;
	}
	
	/** @override */
	getData() {
		return {system: this.object.system};
	}
	
	async _updateObject(event, formData) {
		const updateData = {};
		for(let system in formData) { updateData[`${system}`] = formData[`${system}`];}
		return this.object.update(updateData);
	}
	
}