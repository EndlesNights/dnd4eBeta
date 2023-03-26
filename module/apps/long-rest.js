export class LongRestDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "long-rest",
			classes: ["dnd4eAltus", "actor-rest"],
			template: "systems/dnd4eAltus/templates/apps/long-rest.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Long Rest`;
	}

	/** @override */
	getData() {
		return {system: this.object.system}
	}
	
	async _updateObject(event, formData) {
		const options = this.options;
		options.envi = formData.envi;

		this.object.longRest(event, options);
	}
}
