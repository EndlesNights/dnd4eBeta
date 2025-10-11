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
			title: "Hit Points Options",
		}
	}

	static PARTS = {
		HPOptions: {
			template: "systems/dnd4e/templates/apps/hp-options.hbs"
		}
	}
	
	/** @override */
	_prepareContext() {
		return {system: this.document.system}
	}
	
	/* -------------------------------------------- */

	/** @override */
	static #onSubmit(event, form, formData) {
		const updateData = foundry.utils.expandObject(formData.object);
		this.document.update(updateData);
	}
}
