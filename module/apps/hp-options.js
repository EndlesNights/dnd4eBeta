import DocumentSheet4e from "./DocumentSheet4e.js"

export default class HPOptions extends DocumentSheet4e {

  /** @override */
	static DEFAULT_OPTIONS = {
		id: "hp-options",
		classes: ["dnd4e", "standard-form"],
		form: {
			closeOnSubmit: false,
			submitOnClose: false,
			handler: HPOptions.#onSubmit
		},
		position: {
			width: 340,
			height: "auto",
		},
		window: {
			contentClasses: ["standard-form"]
		},
		tag: "form",
	}

	get title() {
		return `${this.document.name} - ${game.i18n.localize("DND4E.HPOptions")}`;
	}

	static PARTS = {
		HPOptions: {
			template: "systems/dnd4e/templates/apps/hp-options.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}
	
	/** @override */
	async _prepareContext(options) {
		const context = await super._prepareContext(options);
        foundry.utils.mergeObject(context, {
			system: this.document.system,
			buttons: [
				{ type: "submit", icon: "fa-solid fa-save", label: "DND4E.Save" }
			]
		});
        return context;
	}
	
	/* -------------------------------------------- */

	/** @override */
	static #onSubmit(event, form, formData) {
		const updateData = foundry.utils.expandObject(formData.object);
		this.document.update(updateData);
	}

}
