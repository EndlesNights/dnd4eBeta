export class SecondWindDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "second-wind",
			classes: ["dnd4eAltus", "second-wind"],
			template: "systems/dnd4eAltus/templates/apps/second-wind.html",
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
