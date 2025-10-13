import DocumentSheet4e from "./DocumentSheet4e.js"

export class LongRestDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "long-rest",
		classes: ["dnd4e", "actor-rest", "standard-form"],
		form: {
			closeOnSubmit: true,
			handler: LongRestDialog.#onSubmit
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
		return `${this.document.name} - ${game.i18n.localize("DND4E.LongRest")}`;
	}

	static PARTS = {
		LongRestDialog: {
			template: "systems/dnd4e/templates/apps/long-rest.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	_prepareContext() {
		return {
			system: this.document.system,
			buttons: [
				{ type: "submit", label: "DND4E.LongRestTake" }
			]
		}
	}
	
	static async #onSubmit(event, form, formData) {
		this.document.longRest(event, {
			...this.options,
			...{envi: formData.object.envi}
		});
	}

}