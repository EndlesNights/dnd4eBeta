import DocumentSheet4e from "./DocumentSheet4e.js"

export class SaveThrowDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "save-throw",
		classes: ["dnd4e", "actor-save-throw", "standard-form"],
		form: {
			closeOnSubmit: true,
			handler: SaveThrowDialog.#onSubmit
		},
		position: {
			width: 500,
			height: "auto",
		},
		window: {
			contentClasses: ["standard-form"]
		},
		tag: "form"
	}

	get title() {
		return `${this.document.name} - ${game.i18n.format("DND4E.SavingThrow")}`;
	}

	static PARTS = {
		SaveThrowDialog: {
			template: "systems/dnd4e/templates/apps/save-throw.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	_prepareContext() {
		const options = this.options;
		let savableEffects = [];
		const actor = this.document;
		if (actor && !options.effectSave) {
			Array.from(actor.effects).forEach((e) => {
				if (e.flags.dnd4e?.effectData?.durationType === 'saveEnd') savableEffects.push({name: e.name, id: e.id});
			});
		}
		if (savableEffects.length) {
			savableEffects = [{name: game.i18n.format("DND4E.None"), id:''}].concat(savableEffects);
		}
		return {
			system: actor.system,
			rollModes: Object.keys(CONFIG.Dice.rollModes).map(key => CONFIG.Dice.rollModes[key].label),
			effectName: ( options.effectSave ? actor.effects.get(options.effectId).name : null ),
			effectId: this.options.saveAgainst,
			saveDC: ( options.effectSave ? actor.effects.get(options.effectId).flags.dnd4e?.effectData?.saveDC : this.options.saveDC ),
			savableEffects: savableEffects,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "DND4E.SaveRoll" }
			]
		};
	}

	async _onChangeInput(event) {
		const target = event.target;
		if (target?.name !== "saveAgainst") return;
		this.options.saveDC = this.document.effects.get(target.value)?.flags.dnd4e?.effectData?.saveDC;
		this.options.saveAgainst = target.value;
		this.render();
	}

	static #onSubmit(event, form, formData) {
		const saveData = foundry.utils.expandObject(formData.object);
		saveData.rollMode = Object.keys(CONFIG.Dice.rollModes)[saveData.rollMode]
		if (saveData.saveAgainst) {
			saveData.effectSave = true;
			saveData.effectId = saveData.saveAgainst
		}

		this.document.rollSave(event, {
			...this.options,
			...saveData
		});
	}
}
