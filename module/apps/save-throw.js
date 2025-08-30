import DocumentSheet4e from "./DocumentSheet4e.js"

export class SaveThrowDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return foundry.utils.mergeObject(options, {
			id: "save-throw",
			classes: ["dnd4e", "actor-save-throw"],
			template: "systems/dnd4e/templates/apps/save-throw.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	get title() {
		return `${this.object.name} - ${game.i18n.format("DND4E.SavingThrow")}`;
	}

	/** @override */
	getData() {
		const options = this.options;
		return {
			system: this.object.system,
			rollModes: Object.keys(CONFIG.Dice.rollModes).map(key => CONFIG.Dice.rollModes[key].label),
			effectName: ( options.effectSave ? this.object.effects.get(options.effectId).name : null ),
			saveDC: ( options.effectSave ? this.object.effects.get(options.effectId).flags.dnd4e?.effectData?.saveDC : null )
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
