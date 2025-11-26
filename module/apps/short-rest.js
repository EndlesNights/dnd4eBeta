import DocumentSheet4e from "./DocumentSheet4e.js"

export class ShortRestDialog extends DocumentSheet4e {
	static DEFAULT_OPTIONS = {
		id: "short-rest",
		classes: ["dnd4e","actor-rest","standard-form","default"],
		form: {
			handler: ShortRestDialog.#onSubmit,
			closeOnSubmit: true,
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
		return `${this.document.name} - ${game.i18n.localize("DND4E.ShortRest")}`;
	}

	static PARTS = {
		ShortRestDialog: {
			template: "systems/dnd4e/templates/apps/short-rest.hbs"
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
				{ type: "submit", label: "DND4E.ShortRestTake" }
			]
		});
        return context;
	}
	
	static async #onSubmit(event, form, formData) {
		const restOptions = foundry.utils.expandObject(formData.object);

		this.document.shortRest(event, {
			...this.options,
			...restOptions
		});
	}  
}