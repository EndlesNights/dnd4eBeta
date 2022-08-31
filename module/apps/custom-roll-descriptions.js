export class CustomRolldDescriptions extends DocumentSheet {
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "custom-roll",
			classes: ["dnd4eAltus", "actor-rest"],
			template: "systems/dnd4eAltus/templates/apps/custom-roll-descriptions.html",
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