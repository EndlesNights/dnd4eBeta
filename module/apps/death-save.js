import DocumentSheet4e from "./DocumentSheet4e.js"

export class DeathSaveDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "death-save",
		classes: ["dnd4e","actor-death-save","standard-form","default"],
		form: {
			closeOnSubmit: true,
			handler: DeathSaveDialog.#onSubmit
		},
		position: {
			width: 500,
			height: "auto"
		},
		window: {
			contentClasses: ["standard-form"]
		},
		tag: "form"
	}

	get title() {
		return `${this.document.name} - ${game.i18n.localize("DND4E.DeathSaveLongform")}`;
	}

	static PARTS = {
		DeathSaveDialog: {
			template: "systems/dnd4e/templates/apps/death-save.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
			data: this.document.system,
			rollModes: Object.keys(CONFIG.Dice.rollModes).map(key => CONFIG.Dice.rollModes[key].label),
			buttons: [
				{ type: "submit", icon: "fa-solid fa-dice-d20", label: "DND4E.DeathSave" }
			]
		});
        return context;
	}

	static async #onSubmit(event, form, formData) {
		const saveData = foundry.utils.expandObject(formData.object);
		saveData.rollMode = Object.keys(CONFIG.Dice.rollModes)[saveData.rollMode]

		this.document.rollDeathSave(event, {
			...this.options,
			...saveData
		});
	}

}