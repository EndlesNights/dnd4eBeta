import DocumentSheet4e from "./DocumentSheet4e.js"

export class ActionPointDialog extends DocumentSheet4e {

	static DEFAULT_OPTIONS = {
		id: "action-point",
		form: {
			closeOnSubmit: true
		},
		classes: ["action-point", "standard-form"],
		position: {
			width: 500,
			height: "auto"
		}
	}
	
	get title() {
		return `${this.document.name} - Action Point`;
	}

	static PARTS = {
		actionPoint: {
			template: "systems/dnd4e/templates/apps/action-point.hbs"
		}
	}

	/** @override */
	_prepareContext() {
		const extra = this.document.system.actionpoints.custom !== "" ? this.document.system.actionpoints.custom.split("\n") : "";
		return { system: this.document.system, extra: extra };
	}

	async _updateObject(event, formData) {
		
		const options = this.options;

		this.document.actionPoint(event, options);
	}

}
