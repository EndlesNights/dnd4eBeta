export class CustomRolldDescriptions extends DocumentSheet {
	
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
		return {data: this.object.data.data};
	}
	
	async _updateObject(event, formData) {
		const updateData = {};
		for(let data in formData) { updateData[`${data}`] = formData[`${data}`];}
		return this.object.update(updateData);
	}
	
}