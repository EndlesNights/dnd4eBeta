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
		let savableEffects = [];
		const actor = this.object;
		if (actor && !options.effectSave) {
			Array.from(actor.effects).forEach((e) => {
				if (e.getFlag('dnd4e', 'effectData').durationType === 'saveEnd') savableEffects.push({name: e.name, id: e.id});
			});
		}
		if (savableEffects.length) {
			savableEffects = [{name: game.i18n.format("DND4E.None")}].concat(savableEffects);
		}
		return {
			system: this.object.system,
			rollModes: CONFIG.Dice.rollModes,
			effectName: ( options.effectSave ? this.object.effects.get(options.effectId).name : null ),
			saveDC: ( options.effectSave ? this.object.effects.get(options.effectId).flags.dnd4e?.effectData?.saveDC : null ),
			savableEffects: savableEffects
		};
	}

	async _updateObject(event, formData) {
		const options = this.options;
		options.dc = formData.dc;
		options.save = formData.save;
		options.rollMode = formData.rollMode;
		if (formData.saveAgainst) {
			options.effectSave = true;
			options.effectId = formData.saveAgainst
		}

		this.document.rollSave(event, options);
	}
}
