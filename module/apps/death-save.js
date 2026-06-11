import DocumentSheet4e from "./DocumentSheet4e.js";

export class DeathSaveDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "death-save",
		classes: ["dnd4e", "actor-death-save", "standard-form", "default"],
		form: {
			closeOnSubmit: true,
			handler: DeathSaveDialog.#onSubmit,
		},
		position: {
			width: 500,
			height: "auto",
		},
		window: {
			contentClasses: ["standard-form"],
			resizable: true,
		},
		tag: "form",
	};

	get title() {
		return `${this.document.name} - ${_loc("DND4E.DeathSaveLongform")}`;
	}

	static PARTS = {
		DeathSaveDialog: {
			template: "systems/dnd4e/templates/apps/death-save.hbs",
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		},
	};

	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		foundry.utils.mergeObject(context, {
			data: this.document.system,
			messageModes: Object.keys(CONFIG.ChatMessage.modes).map(key => CONFIG.ChatMessage.modes[key].label),
			buttons: [
				{ type: "submit", icon: "fa-solid fa-dice-d20", label: "DND4E.DeathSave" },
			],
		});
		return context;
	}

	static async #onSubmit(event, form, formData) {
		const saveData = foundry.utils.expandObject(formData.object);
		saveData.messageMode = Object.keys(CONFIG.ChatMessage.modes)[saveData.messageMode];

		this.document.rollDeathSave(event, {
			...this.options,
			...saveData,
		});
	}

}
