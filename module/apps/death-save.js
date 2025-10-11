import DocumentSheet4e from "./DocumentSheet4e.js"

export class DeathSaveDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "death-save",
		classes: ["dnd4e", "actor-death-save", "standard-form"],
		form: {
			closeOnSubmit: true,
			handler: DeathSaveDialog.#onSubmit
		},
		position: {
			width: 500,
			height: "auto"
		}
	}

	get title() {
		return `${this.document.name} - Death Saving Throw`;
	}

	static PARTS = {
		DeathSaveDialog: {
			template: "systems/dnd4e/templates/apps/death-save.hbs"
		}
	}

	/** @override */
	_prepareContext() {
		return {
			data: this.document.system,
			rollModes: Object.keys(CONFIG.Dice.rollModes).map(key => CONFIG.Dice.rollModes[key].label)
		};
	}

	static async #onSubmit(event, form, formData) {
		const saveData = foundry.utils.expandObject(formData.object);
		const options = this.options;

		this.document.rollDeathSave(event, {
            ...this.options,
            ...saveData
        });
	}

}