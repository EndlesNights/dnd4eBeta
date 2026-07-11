import DocumentSheet4e from "../sheets/DocumentSheet4e.mjs";

export default class DeathSaveDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "death-save",
		classes: ["dnd4e", "actor-death-save", "standard-form", "default"],
		form: {
			closeOnSubmit: true,
			handler: DeathSaveDialog.#onSubmit,
		},
		actions: {
			minus: DeathSaveDialog.#onMinus,
			plus: DeathSaveDialog.#onPlus,
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

	/** @inheritDoc */
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

	/** @inheritDoc */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		foundry.utils.mergeObject(context, {
			data: this.document.system,
			messageModes: CONFIG.ChatMessage.modes,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-dice-d20", label: "DND4E.DeathSave" },
			],
		});
		return context;
	}

	/**
     * @param {Event} event
     * @param {Object} form
     * @param {Object} formData
     */
	static async #onSubmit(event, form, formData) {
		const saveData = foundry.utils.expandObject(formData.object);

		this.document.rollDeathSave(event, form, {
			...this.options,
			...saveData,
		});
	}

	/**
     * @param {Event} event 
     * @param {HTMLElement} target 
     */
	static #onMinus(event, target) {
		const input = this.element.querySelector("#d20");
		const currentValue = Number(input.value) || 0;
		if (event.ctrlKey) input.value = currentValue - 2;
		else input.value = currentValue - 1;
	}

	/**
     * @param {Event} event 
     * @param {HTMLElement} target 
     */
	static #onPlus(event, target) {
		const input = this.element.querySelector("#d20");
		const currentValue = Number(input.value) || 0;
		if (event.ctrlKey) input.value = currentValue + 2;
		else input.value = currentValue + 1;
	}
}
