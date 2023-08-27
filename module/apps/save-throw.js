import DocumentSheet4e from "./DocumentSheet4e.js"

export class SaveThrowDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "save-throw",
			classes: ["dnd4eBeta", "actor-save-throw"],
			template: "systems/dnd4e/templates/apps/save-throw.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	get title() {
		return `${this.object.name} - ${game.i18n.format("DND4EBETA.SavingThrow")}`;
	}

	/** @override */
	getData() {
		const options = this.options;
		return {
			system: this.object.system,
			rollModes: CONFIG.Dice.rollModes,
			effectName: ( options.effectSave ? this.object.effects.get(options.effectId).name : null )
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
