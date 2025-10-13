import DocumentSheet4e from "./DocumentSheet4e.js"

export class ActionPointDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "action-point",
		classes: ["action-point", "standard-form"],
		form: {
			closeOnSubmit: true,
			handler: this.#onSubmit
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
		return `${this.document.name} - ${game.i18n.localize("DND4E.ActionPoint")}`;
	}

	static PARTS = {
		actionPoint: {
			template: "systems/dnd4e/templates/apps/action-point.hbs"
		},
		footer: {
			template: "templates/generic/form-footer.hbs",
		}
	}

	/** @override */
	_prepareContext() {
		const extra = this.document.system.actionpoints.custom !== "" ? this.document.system.actionpoints.custom.split("\n") : "";
		return { 
			system: this.document.system,
			extra: extra,
			buttons: [
				{ type: "submit", label: "DND4E.ActionPointUse" }
			]
		};
	}

	static async #onSubmit(event, form, formData) {
		const options = this.options;
		this.document.actionPoint(event, options);
	}

}
