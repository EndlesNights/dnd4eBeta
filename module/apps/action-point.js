import DocumentSheet4e from "./DocumentSheet4e.js"

export class ActionPointDialog extends DocumentSheet4e {

	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "action-point",
			classes: ["action-point"],
			template: "systems/dnd4e/templates/apps/action-point.html",
			width: 500,
			closeOnSubmit: true
		});
	}
	
	get title() {
		return `${this.object.name} - Action Point`;
	}

	/** @override */
	getData() {
		const extra = this.object.system.actionpoints.custom !== "" ? this.object.system.actionpoints.custom.split("\n") : "";
		return { system: this.object.system, extra: extra };
	}
	async _updateObject(event, formData) {
		
		const options = this.options;

		this.object.actionPoint(event, options);
	}
}
