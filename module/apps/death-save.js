import DocumentSheet4e from "./DocumentSheet4e.js"

export class DeathSaveDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "death-save",
			classes: ["dnd4eBeta", "actor-death-save"],
			template: "systems/dnd4e/templates/apps/death-save.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	get title() {
		return `${this.object.name} - Death Saving Throw`;
	}

	/** @override */
	getData() {
		return {
			data: this.object.system,
			rollModes: CONFIG.Dice.rollModes
		};
	}
	async _updateObject(event, formData) {
		const options = this.options;
		options.dc = formData.dc;
		options.save = formData.save;
		options.rollMode = formData.rollMode;

		this.document.rollDeathSave(event, options);
	}
}