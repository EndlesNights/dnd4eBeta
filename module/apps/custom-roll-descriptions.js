export class CustomRolldDescriptions extends BaseEntitySheet {
	
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "actor-flags",
			classes: ["dnd4eBeta", "actor-rest"],
			template: "systems/dnd4eBeta/templates/apps/custom-roll-descriptions.html",
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
		const data = Object.entries(formData);
		for(let i = 0; i < data.length; i++) {
			// console.log(`${data[i][0]}`);
			updateData[`${data[i][0]}`] = data[i][1];
		}
		return this.object.update(updateData);
	}
	
}