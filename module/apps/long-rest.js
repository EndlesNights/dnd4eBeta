import DocumentSheet4e from "./DocumentSheet4e.js"

export class LongRestDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "long-rest",
			classes: ["dnd4eBeta", "actor-rest"],
			template: "systems/dnd4e/templates/apps/long-rest.html",
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
