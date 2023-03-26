export class SaveThrowDialog extends DocumentSheet {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "save-throw",
			classes: ["dnd4eAltus", "actor-save-throw"],
			template: "systems/dnd4eAltus/templates/apps/save-throw.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	get title() {
		return `${this.object.name} - Saving Throw`;
	}

	/** @override */
	getData() {
		return {
			system: this.object.system,
			rollModes: CONFIG.Dice.rollModes
		};
	}

	async _updateObject(event, formData) {
		const options = this.options;
		options.dc = formData.dc;
		options.save = formData.save;
		options.rollMode = formData.rollMode;

		this.document.rollSave(event, options);
	}
}