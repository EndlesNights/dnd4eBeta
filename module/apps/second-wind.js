import DocumentSheet4e from "./DocumentSheet4e.js"

export class SecondWindDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "second-wind",
			classes: ["dnd4e", "second-wind"],
			template: "systems/dnd4e/templates/apps/second-wind.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Second Wind`;
	}

	/** @override */
	getData() {
		const extra = this.object.system.details.secondwindbon.custom.split(";");
		return { system: this.object.system, extra: extra };
	}
	async _updateObject(event, formData) {
		const options = this.options;
		options.bonus = formData.bonus;

		this.object.secondWind(event, options);
	}
}
