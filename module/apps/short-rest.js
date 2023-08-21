import DocumentSheet4e from "./DocumentSheet4e.js"

export class ShortRestDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "short-rest",
			classes: ["dnd4eBeta", "actor-rest"],
			template: "systems/dnd4e/templates/apps/short-rest.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Short Rest`;
	}

	/** @override */
	getData() {
		
		return {system: this.object.system}
	}
	
	async _updateObject(event, formData) {
		const options = this.options;
		options.surge = formData.surge;
		options.bonus = formData.bonus;

		this.object.shortRest(event, options);
	}  
}
