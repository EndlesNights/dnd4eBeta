import DocumentSheet4e from "./DocumentSheet4e.js"

export class ShortRestDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return foundry.utils.mergeObject(options, {
			id: "short-rest",
			classes: ["dnd4e", "actor-rest"],
			template: "systems/dnd4e/templates/apps/short-rest.html",
			width: 500,
			closeOnSubmit: true
		});
	}

	static DEFAULT_OPTIONS = {
		id: "short-rest",
		classes: ["dnd4e", "actor-rest", "standard-form"],
		form: {
			handler: ShortRestDialog.#onSubmit,
			closeOnSubmit: true,
		},
		position: {
			width: 500,
			height: "auto",
		},
		tag: "form"
	}
	
	get title() {
		return `${this.document.name} - ${game.i18n.localize("DND4E.ShortRest")}`;
	}

	static PARTS = {
		ShortRestDialog: {
			template: "systems/dnd4e/templates/apps/short-rest.hbs"
		}
	}

	/** @override */
	_prepareContext() {
		return {system: this.document.system}
	}
	
	static async #onSubmit(event, form, formData) {
		const restOptions = foundry.utils.expandObject(formData.object);

		this.document.shortRest(event, {
			...this.options,
			...restOptions
		});
	}  
}